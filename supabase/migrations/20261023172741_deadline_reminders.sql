SET local check_function_bodies = off;

CREATE SCHEMA "reminder_private";

CREATE TABLE "public"."deadline_reminders" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "calculation_id"    uuid                     NOT NULL,
  "owner_id"          uuid                     NOT NULL,
  "due_date"          date                     NOT NULL,
  "lead_days"         integer                  NOT NULL,
  "send_hour"         integer                  NOT NULL,
  "time_zone"         text                     NOT NULL DEFAULT 'America/Sao_Paulo'::text,
  "send_at"           timestamp with time zone NOT NULL,
  "snapshot_metadata" jsonb                    NOT NULL,
  "status"            text                     NOT NULL DEFAULT 'pending'::text,
  "attempt_count"     integer                  NOT NULL DEFAULT 0,
  "next_attempt_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "claim_token"       uuid,
  "claimed_at"        timestamp with time zone,
  "accepted_at"       timestamp with time zone,
  "error_code"        text,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "deadline_reminders_attempt_count_check" CHECK (((attempt_count >= 0) AND (attempt_count <= 3))),
  CONSTRAINT "deadline_reminders_error_code_check"
    CHECK
    ((error_code = ANY (ARRAY['window_expired'::text, 'lease_expired'::text, 'recipient_unavailable'::text, 'preflight_failed'::text, 'send_rejected'::text,
    'send_uncertain'::text]))),
  CONSTRAINT "deadline_reminders_lead_days_check" CHECK ((lead_days = ANY (ARRAY[0, 1, 3]))),
  CONSTRAINT "deadline_reminders_pkey" PRIMARY KEY (id),
  CONSTRAINT "deadline_reminders_send_hour_check" CHECK ((send_hour = ANY (ARRAY[9, 12, 18]))),
  CONSTRAINT "deadline_reminders_snapshot_metadata_check" CHECK ((jsonb_typeof(snapshot_metadata) = 'object'::text)),
  CONSTRAINT "deadline_reminders_status_check"
    CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'accepted'::text, 'failed'::text, 'cancelled'::text, 'uncertain'::text]))),
  CONSTRAINT "deadline_reminders_time_zone_check" CHECK ((time_zone = 'America/Sao_Paulo'::text))
);

ALTER TABLE "public"."deadline_reminders"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."deadline_reminders" FROM "anon", "service_role";

CREATE OR REPLACE FUNCTION public.cancel_deadline_reminders (
  p_id uuid DEFAULT NULL::uuid
)
  RETURNS integer
  LANGUAGE sql
  SET search_path TO ''
  AS $function$ select reminder_private.cancel(p_id); $function$;

REVOKE ALL ON FUNCTION "public"."cancel_deadline_reminders"(uuid) FROM PUBLIC, "anon", "service_role";

CREATE OR REPLACE FUNCTION public.claim_deadline_reminders (
  p_limit integer DEFAULT 20
)
  RETURNS TABLE (
    id    uuid,
    token uuid
  )
  LANGUAGE sql
  SET search_path TO ''
  AS $function$ select * from reminder_private.claim(p_limit); $function$;

REVOKE ALL ON FUNCTION "public"."claim_deadline_reminders"(integer) FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.list_deadline_reminders (
  p_ids uuid[]
)
  RETURNS TABLE (
    id             uuid,
    calculation_id uuid,
    due_date       date,
    lead_days      integer,
    send_hour      integer,
    send_at        timestamp with time zone,
    time_zone      text,
    status         text,
    accepted_at    timestamp with time zone,
    error_code     text,
    created_at     timestamp with time zone
  )
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if p_ids is null or cardinality(p_ids) not between 1 and 50 then raise exception using errcode='22023',message='invalid_ids'; end if;
  return query select distinct on (r.calculation_id) r.id,r.calculation_id,r.due_date,r.lead_days,r.send_hour,r.send_at,r.time_zone,r.status,r.accepted_at,r.error_code,r.created_at
    from public.deadline_reminders r where r.owner_id=(select auth.uid()) and r.calculation_id=any(p_ids)
    order by r.calculation_id,r.created_at desc,r.id desc;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."list_deadline_reminders"(uuid[]) FROM PUBLIC, "anon", "service_role";

CREATE OR REPLACE FUNCTION public.prepare_deadline_reminder (
  p_id    uuid,
  p_token uuid
)
  RETURNS jsonb
  LANGUAGE sql
  SET search_path TO ''
  AS $function$ select reminder_private.prepare(p_id,p_token); $function$;

REVOKE ALL ON FUNCTION "public"."prepare_deadline_reminder"(uuid, uuid) FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.schedule_deadline_reminder (
  p_calculation_id uuid,
  p_lead_days      integer,
  p_hour           integer
)
  RETURNS uuid
  LANGUAGE sql
  SET search_path TO ''
  AS $function$
  select reminder_private.schedule(p_calculation_id,p_lead_days,p_hour);
$function$;

REVOKE ALL ON FUNCTION "public"."schedule_deadline_reminder"(uuid, integer, integer) FROM PUBLIC, "anon", "service_role";

CREATE OR REPLACE FUNCTION public.settle_deadline_reminder (
  p_id      uuid,
  p_token   uuid,
  p_outcome text
)
  RETURNS boolean
  LANGUAGE sql
  SET search_path TO ''
  AS $function$ select reminder_private.settle(p_id,p_token,p_outcome); $function$;

REVOKE ALL ON FUNCTION "public"."settle_deadline_reminder"(uuid, uuid, text) FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION reminder_private.cancel (
  p_id uuid DEFAULT NULL::uuid
)
  RETURNS integer
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare v_count integer;
begin
  if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
    raise exception using errcode='42501',message='identity_required';
  end if;
  update public.deadline_reminders set status='cancelled'
    where owner_id=auth.uid() and (p_id is null or id=p_id) and status in ('pending','processing','uncertain');
  get diagnostics v_count = row_count;
  return v_count;
end;
$function$;

CREATE OR REPLACE FUNCTION reminder_private.claim (
  p_limit integer DEFAULT 20
)
  RETURNS TABLE (
    id    uuid,
    token uuid
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  if p_limit is null or p_limit < 1 or p_limit > 20 then raise exception using errcode='22023',message='invalid_batch'; end if;
  update public.deadline_reminders r set status='uncertain',error_code='lease_expired'
    where r.status='processing' and r.claimed_at < now()-interval '5 minutes';
  update public.deadline_reminders r set status='failed',error_code='window_expired'
    where r.status='pending' and (r.send_at < now()-interval '1 hour' or r.due_date < (now() at time zone 'America/Sao_Paulo')::date);
  return query
  with candidates as (
    select r.id from public.deadline_reminders r
    where r.status='pending' and r.send_at <= now() and r.next_attempt_at <= now() and r.attempt_count < 3
    order by r.send_at,r.id limit p_limit for update skip locked
  )
  update public.deadline_reminders r set status='processing',claim_token=gen_random_uuid(),claimed_at=now(),attempt_count=r.attempt_count+1
    from candidates c where r.id=c.id returning r.id,r.claim_token;
end;
$function$;

CREATE OR REPLACE FUNCTION reminder_private.prepare (
  p_id    uuid,
  p_token uuid
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare v_row public.deadline_reminders; v_email text; v_snapshot jsonb;
begin
  select * into v_row from public.deadline_reminders where id=p_id and claim_token=p_token and status='processing' for update;
  if not found then return null; end if;
  if v_row.claimed_at < now()-interval '5 minutes' then
    update public.deadline_reminders set status='uncertain',error_code='lease_expired' where id=p_id; return null;
  end if;
  select email into v_email from auth.users where id=v_row.owner_id and email_confirmed_at is not null
    and not coalesce(is_anonymous,false) and deleted_at is null and (banned_until is null or banned_until <= now()) and email is not null and email <> '';
  if not found then
    update public.deadline_reminders set status='failed',error_code='recipient_unavailable' where id=p_id; return null;
  end if;
  select result_snapshot into v_snapshot from public.deadline_calculations where id=v_row.calculation_id and owner_id=v_row.owner_id;
  if not found then return null; end if;
  return jsonb_build_object('id',v_row.id,'calculationId',v_row.calculation_id,'dueDate',v_row.due_date,
    'leadDays',v_row.lead_days,'hour',v_row.send_hour,'timeZone',v_row.time_zone,'email',v_email,'snapshot',v_snapshot);
end;
$function$;

CREATE OR REPLACE FUNCTION reminder_private.schedule (
  p_calculation_id uuid,
  p_lead_days      integer,
  p_hour           integer
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_owner uuid := auth.uid();
  v_snapshot jsonb;
  v_due date;
  v_at timestamptz;
  v_id uuid;
begin
  if v_owner is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) or not exists
    (select 1 from auth.users where id = v_owner and email_confirmed_at is not null and not coalesce(is_anonymous,false)) then
    raise exception using errcode = '42501', message = 'confirmed_identity_required';
  end if;
  if p_lead_days is null or p_lead_days not in (0,1,3) or p_hour is null or p_hour not in (9,12,18) then
    raise exception using errcode = '22023', message = 'invalid_schedule';
  end if;
  select result_snapshot into v_snapshot from public.deadline_calculations
    where id = p_calculation_id and owner_id = v_owner for update;
  if not found then raise exception using errcode = 'P0002', message = 'calculation_not_found'; end if;
  if v_snapshot->>'status' is distinct from 'provisional' or
    coalesce(v_snapshot->>'dueDate','') !~ '^\d{4}-\d{2}-\d{2}$' or
    jsonb_typeof(v_snapshot->'metadata') is distinct from 'object' then
    raise exception using errcode = '22023', message = 'invalid_snapshot';
  end if;
  v_due := (v_snapshot->>'dueDate')::date;
  v_at := ((v_due - p_lead_days) + make_time(p_hour,0,0)) at time zone 'America/Sao_Paulo';
  if v_due < (now() at time zone 'America/Sao_Paulo')::date or v_at <= now() then
    raise exception using errcode = '22023', message = 'schedule_not_future';
  end if;
  insert into public.deadline_reminders(calculation_id,owner_id,due_date,lead_days,send_hour,send_at,snapshot_metadata)
    values(p_calculation_id,v_owner,v_due,p_lead_days,p_hour,v_at,v_snapshot->'metadata') returning id into v_id;
  return v_id;
end;
$function$;

CREATE OR REPLACE FUNCTION reminder_private.settle (
  p_id      uuid,
  p_token   uuid,
  p_outcome text
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare v_row public.deadline_reminders;
begin
  if p_outcome is null or p_outcome not in ('accepted','preflight_failed','send_rejected','send_uncertain') then
    raise exception using errcode='22023',message='invalid_outcome';
  end if;
  select * into v_row from public.deadline_reminders where id=p_id and claim_token=p_token and status in ('processing','cancelled','uncertain') for update;
  if not found then return false; end if;
  if p_outcome='accepted' then
    update public.deadline_reminders set accepted_at=coalesce(accepted_at,now()),
      status=case when status='cancelled' then 'cancelled' else 'accepted' end,error_code=null where id=p_id;
  elsif v_row.status='processing' then
    update public.deadline_reminders set
      status=case when p_outcome='send_uncertain' then 'uncertain'
        when p_outcome='preflight_failed' and attempt_count<3 and now()+interval '5 minutes'<=send_at+interval '1 hour' then 'pending' else 'failed' end,
      next_attempt_at=now()+interval '5 minutes',error_code=p_outcome where id=p_id;
  end if;
  return true;
end;
$function$;

ALTER TABLE "public"."deadline_reminders"
  ADD CONSTRAINT "deadline_reminders_calculation_id_fkey" FOREIGN KEY (calculation_id) REFERENCES public.deadline_calculations(id) ON DELETE CASCADE;

ALTER TABLE "public"."deadline_reminders"
  ADD CONSTRAINT "deadline_reminders_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX deadline_reminders_calculation_idx ON public.deadline_reminders USING btree (calculation_id);

CREATE UNIQUE INDEX deadline_reminders_one_active_idx ON public.deadline_reminders USING btree (calculation_id)
  WHERE (status = ANY (ARRAY['pending'::text, 'processing'::text, 'uncertain'::text]));

CREATE INDEX deadline_reminders_owner_created_idx ON public.deadline_reminders USING btree (owner_id, created_at DESC);

CREATE INDEX deadline_reminders_pending_idx ON public.deadline_reminders USING btree (next_attempt_at, send_at)
  WHERE (status = 'pending'::text);

CREATE POLICY "owner_read_reminders" ON "public"."deadline_reminders"
  FOR SELECT
  TO "authenticated"
  USING (((( SELECT auth.uid() AS uid) = owner_id) AND (NOT COALESCE(((( SELECT auth.jwt() AS jwt) ->> 'is_anonymous'::text))::boolean, false))));

GRANT EXECUTE ON FUNCTION "public"."cancel_deadline_reminders"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."cancel_deadline_reminders"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."cancel_deadline_reminders"(uuid) TO "postgres";

REVOKE ALL ON FUNCTION "public"."claim_deadline_reminders"(integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."claim_deadline_reminders"(integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."claim_deadline_reminders"(integer) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."list_deadline_reminders"(uuid[]) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."list_deadline_reminders"(uuid[]) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."list_deadline_reminders"(uuid[]) TO "postgres";

REVOKE ALL ON FUNCTION "public"."prepare_deadline_reminder"(uuid, uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."prepare_deadline_reminder"(uuid, uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."prepare_deadline_reminder"(uuid, uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."schedule_deadline_reminder"(uuid, integer, integer) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."schedule_deadline_reminder"(uuid, integer, integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."schedule_deadline_reminder"(uuid, integer, integer) TO "postgres";

REVOKE ALL ON FUNCTION "public"."settle_deadline_reminder"(uuid, uuid, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."settle_deadline_reminder"(uuid, uuid, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."settle_deadline_reminder"(uuid, uuid, text) TO "service_role";

REVOKE ALL ON FUNCTION "reminder_private"."cancel"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "reminder_private"."cancel"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "reminder_private"."claim"(integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "reminder_private"."claim"(integer) TO "service_role";

REVOKE ALL ON FUNCTION "reminder_private"."prepare"(uuid, uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "reminder_private"."prepare"(uuid, uuid) TO "service_role";

REVOKE ALL ON FUNCTION "reminder_private"."schedule"(uuid, integer, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "reminder_private"."schedule"(uuid, integer, integer) TO "authenticated";

REVOKE ALL ON FUNCTION "reminder_private"."settle"(uuid, uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "reminder_private"."settle"(uuid, uuid, text) TO "service_role";

GRANT USAGE ON SCHEMA "reminder_private" TO "authenticated", "service_role";

REVOKE ALL ON TABLE "public"."deadline_reminders" FROM "authenticated";

GRANT SELECT ON TABLE "public"."deadline_reminders" TO "authenticated";

REVOKE ALL ON TABLE "public"."deadline_reminders" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."deadline_reminders" TO "postgres";
