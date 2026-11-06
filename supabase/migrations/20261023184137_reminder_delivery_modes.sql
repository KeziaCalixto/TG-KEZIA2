SET local check_function_bodies = off;

DROP FUNCTION "reminder_private"."claim"(integer);

ALTER TABLE "public"."deadline_reminders"
  ADD COLUMN "delivery_mode" text NOT NULL DEFAULT 'local'::text;

CREATE OR REPLACE FUNCTION public.claim_deadline_reminders_for_mode (
  p_mode  text,
  p_limit integer
)
  RETURNS TABLE (
    id    uuid,
    token uuid
  )
  LANGUAGE sql
  SET search_path TO ''
  AS $function$
select * from reminder_private.claim_for_mode(p_mode,p_limit);
$function$;

REVOKE ALL ON FUNCTION "public"."claim_deadline_reminders_for_mode"(text, integer) FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.list_deadline_reminders_for_mode (
  p_ids  uuid[],
  p_mode text
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare v_result jsonb;
begin
  if p_ids is null or cardinality(p_ids) not between 1 and 50 or p_mode is null or p_mode not in ('local','brevo') then
    raise exception using errcode='22023',message='invalid_listing';
  end if;
  select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into v_result from (
    select distinct on (r.calculation_id) r.id,r.calculation_id,r.due_date,r.lead_days,r.send_hour,r.send_at,r.time_zone,r.status,r.accepted_at,r.error_code,r.created_at,r.delivery_mode
    from public.deadline_reminders r where r.owner_id=(select auth.uid()) and r.calculation_id=any(p_ids) and r.delivery_mode=p_mode
    order by r.calculation_id,r.created_at desc,r.id desc
  ) x;
  return v_result;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."list_deadline_reminders_for_mode"(uuid[], text) FROM PUBLIC, "anon", "service_role";

CREATE OR REPLACE FUNCTION public.schedule_deadline_reminder_for_mode (
  p_calculation_id uuid,
  p_lead_days      integer,
  p_hour           integer,
  p_mode           text
)
  RETURNS uuid
  LANGUAGE sql
  SET search_path TO ''
  AS $function$
select reminder_private.schedule_for_mode(p_calculation_id,p_lead_days,p_hour,p_mode);
$function$;

REVOKE ALL ON FUNCTION "public"."schedule_deadline_reminder_for_mode"(uuid, integer, integer, text) FROM PUBLIC, "anon", "service_role";

CREATE OR REPLACE FUNCTION reminder_private.claim (
  p_limit integer DEFAULT 20
)
  RETURNS TABLE (
    id    uuid,
    token uuid
  )
  LANGUAGE sql
  SET search_path TO ''
  AS $function$
select * from reminder_private.claim_for_mode('local',p_limit);
$function$;

CREATE OR REPLACE FUNCTION reminder_private.claim_for_mode (
  p_mode  text,
  p_limit integer
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
  if p_mode is null or p_mode not in ('local','brevo') then raise exception using errcode='22023',message='invalid_delivery_mode'; end if;
  if p_limit is null or p_limit < 1 or p_limit > 20 then raise exception using errcode='22023',message='invalid_batch'; end if;
  update public.deadline_reminders r set status='uncertain',error_code='lease_expired'
    where r.delivery_mode=p_mode and r.status='processing' and r.claimed_at < now()-interval '5 minutes';
  update public.deadline_reminders r set status='failed',error_code='window_expired'
    where r.delivery_mode=p_mode and r.status='pending' and (r.send_at < now()-interval '1 hour' or r.due_date < (now() at time zone 'America/Sao_Paulo')::date);
  return query with candidates as (
    select r.id from public.deadline_reminders r
    where r.delivery_mode=p_mode and r.status='pending' and r.send_at<=now() and r.next_attempt_at<=now() and r.attempt_count<3
    order by r.send_at,r.id limit p_limit for update skip locked
  ) update public.deadline_reminders r set status='processing',claim_token=gen_random_uuid(),claimed_at=now(),attempt_count=r.attempt_count+1
    from candidates c where r.id=c.id returning r.id,r.claim_token;
end;
$function$;

CREATE OR REPLACE FUNCTION reminder_private.schedule_for_mode (
  p_calculation_id uuid,
  p_lead_days      integer,
  p_hour           integer,
  p_mode           text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare v_id uuid;
begin
  if p_mode is null or p_mode not in ('local','brevo') then
    raise exception using errcode='22023',message='invalid_delivery_mode';
  end if;
  v_id := reminder_private.schedule(p_calculation_id,p_lead_days,p_hour);
  update public.deadline_reminders set delivery_mode=p_mode where id=v_id;
  return v_id;
end;
$function$;

ALTER TABLE "public"."deadline_reminders"
  ADD CONSTRAINT "deadline_reminders_delivery_mode_check" CHECK ((delivery_mode = ANY (ARRAY['local'::text, 'brevo'::text])));

REVOKE ALL ON FUNCTION "public"."claim_deadline_reminders_for_mode"(text, integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."claim_deadline_reminders_for_mode"(text, integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."claim_deadline_reminders_for_mode"(text, integer) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."list_deadline_reminders_for_mode"(uuid[], text) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."list_deadline_reminders_for_mode"(uuid[], text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."list_deadline_reminders_for_mode"(uuid[], text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."schedule_deadline_reminder_for_mode"(uuid, integer, integer, text) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."schedule_deadline_reminder_for_mode"(uuid, integer, integer, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."schedule_deadline_reminder_for_mode"(uuid, integer, integer, text) TO "postgres";

REVOKE ALL ON FUNCTION "reminder_private"."claim"(integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "reminder_private"."claim"(integer) TO "service_role";

REVOKE ALL ON FUNCTION "reminder_private"."claim_for_mode"(text, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "reminder_private"."claim_for_mode"(text, integer) TO "service_role";

REVOKE ALL ON FUNCTION "reminder_private"."schedule_for_mode"(uuid, integer, integer, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "reminder_private"."schedule_for_mode"(uuid, integer, integer, text) TO "authenticated";

