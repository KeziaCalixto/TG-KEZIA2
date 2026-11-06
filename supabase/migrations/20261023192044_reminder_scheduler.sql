SET local check_function_bodies = off;

-- Extension objects are excluded from the scoped schema diff. Install only
-- missing extensions; never recreate or change platform-owned pg_net grants.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
    CREATE EXTENSION pg_cron WITH SCHEMA pg_catalog;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_net') THEN
    CREATE EXTENSION pg_net WITH SCHEMA extensions;
  END IF;
END $$;

CREATE TABLE "reminder_private"."scheduler_config" (
  "singleton" boolean NOT NULL DEFAULT true,
  "enabled"   boolean NOT NULL DEFAULT false,
  CONSTRAINT "scheduler_config_pkey" PRIMARY KEY (singleton),
  CONSTRAINT "scheduler_config_singleton_check" CHECK (singleton)
);

ALTER TABLE "reminder_private"."scheduler_config"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "reminder_private"."scheduler_invocations" (
  "nonce"        uuid                     NOT NULL,
  "issued_at"    bigint                   NOT NULL,
  "operation"    text                     NOT NULL,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "used_at"      timestamp with time zone,
  "request_id"   bigint,
  "http_status"  integer,
  "completed_at" timestamp with time zone,
  "timed_out"    boolean,
  "summary"      jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT "scheduler_invocations_issued_at_check" CHECK ((issued_at > 0)),
  CONSTRAINT "scheduler_invocations_operation_check" CHECK ((operation = ANY (ARRAY['dispatch'::text, 'probe'::text]))),
  CONSTRAINT "scheduler_invocations_pkey" PRIMARY KEY (nonce),
  CONSTRAINT "scheduler_invocations_request_id_key" UNIQUE (request_id),
  CONSTRAINT "scheduler_invocations_summary_check" CHECK ((jsonb_typeof(summary) = 'object'::text))
);

ALTER TABLE "reminder_private"."scheduler_invocations"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_reminder_invocation (
  p_nonce     uuid,
  p_timestamp bigint,
  p_operation text
)
  RETURNS boolean
  LANGUAGE sql
  SET search_path TO ''
  AS $function$
select reminder_private.consume_invocation(p_nonce,p_timestamp,p_operation);
$function$;

REVOKE ALL ON FUNCTION "public"."consume_reminder_invocation"(uuid, bigint, text) FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION reminder_private.collect_scheduler_results()
  RETURNS integer
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare r record; v_body jsonb; v_summary jsonb; v_count integer:=0; v_fields integer;
begin
  for r in select s.nonce,s.operation,n.status_code,n.content,n.timed_out from reminder_private.scheduler_invocations s
    join net._http_response n on n.id=s.request_id where s.completed_at is null for update of s skip locked
  loop
    v_body:=case when coalesce(pg_input_is_valid(r.content,'jsonb'),false) then r.content::jsonb else '{}'::jsonb end;
    if jsonb_typeof(v_body) is distinct from 'object' then v_body:='{}'::jsonb; end if;
    if r.operation='probe' then
      v_summary:=jsonb_build_object('probe_ok',r.status_code=200 and coalesce(v_body->>'providerReady'='true',false),'delivery_enabled',coalesce(v_body->>'deliveryEnabled'='true',false));
      if v_body->>'code' in ('provider_unavailable','provider_ip_blocked','sender_unavailable','relay_not_disabled') then
        v_summary:=v_summary||jsonb_build_object('code',v_body->>'code');
      end if;
    else
      select coalesce(jsonb_object_agg(key,value),'{}'::jsonb),count(*) into v_summary,v_fields
        from jsonb_each(v_body) where key=any(array['claimed','accepted','failed','uncertain','skipped']) and jsonb_typeof(value)='number' and value::text ~ '^[0-5]$';
      v_summary:=case when v_fields=5 then v_summary||'{"response_valid":true}'::jsonb else '{"response_valid":false}'::jsonb end;
    end if;
    update reminder_private.scheduler_invocations set http_status=r.status_code,timed_out=coalesce(r.timed_out,false),completed_at=now(),summary=v_summary where nonce=r.nonce;
    v_count:=v_count+1;
  end loop;
  update reminder_private.scheduler_invocations set timed_out=true,completed_at=now(),summary='{"response_missing":true}'::jsonb
    where request_id is not null and completed_at is null and created_at<now()-interval '3 minutes';
  delete from reminder_private.scheduler_invocations where created_at<now()-interval '7 days';
  delete from cron.job_run_details where jobid in (select jobid from cron.job where jobname='prazo-claro-reminders' and username='postgres') and end_time<now()-interval '7 days';
  return v_count;
end;
$function$;

CREATE OR REPLACE FUNCTION reminder_private.consume_invocation (
  p_nonce     uuid,
  p_timestamp bigint,
  p_operation text
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  if p_nonce is null or p_timestamp is null or p_operation is null or p_operation not in ('dispatch','probe') then return false; end if;
  update reminder_private.scheduler_invocations set used_at=now()
    where nonce=p_nonce and issued_at=p_timestamp and operation=p_operation and used_at is null
      and created_at>now()-interval '2 minutes'
      and p_timestamp between floor(extract(epoch from now()))::bigint-120 and floor(extract(epoch from now()))::bigint+30;
  return found;
end;
$function$;

CREATE OR REPLACE FUNCTION reminder_private.dispatch_tick (
  p_probe boolean DEFAULT false
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare v_nonce uuid; v_timestamp bigint; v_secret text; v_signature text; v_request bigint;
  v_operation text:=case when p_probe is true then 'probe' else 'dispatch' end;
begin
  perform reminder_private.collect_scheduler_results();
  if not coalesce(p_probe,false) and not coalesce((select enabled from reminder_private.scheduler_config where singleton),false) then return null; end if;
  if not coalesce(p_probe,false) and not exists (
    select 1 from public.deadline_reminders where delivery_mode='brevo' and
    ((status='pending' and send_at<=now() and next_attempt_at<=now()) or (status='processing' and claimed_at<now()-interval '5 minutes'))
  ) then return null; end if;
  if exists(select 1 from reminder_private.scheduler_invocations where operation=v_operation and request_id is not null and completed_at is null and created_at>now()-interval '3 minutes') then return null; end if;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name='prazo_claro_scheduler_secret';
  if v_secret is null or length(v_secret)<32 then raise exception using errcode='22023',message='scheduler_secret_missing'; end if;
  v_nonce:=gen_random_uuid(); v_timestamp:=floor(extract(epoch from now()))::bigint;
  v_signature:=encode(extensions.hmac(concat_ws(E'\n','POST','/api/internal/reminders/dispatch','brevo',v_operation,v_timestamp::text,v_nonce::text),v_secret,'sha256'),'hex');
  insert into reminder_private.scheduler_invocations(nonce,issued_at,operation) values(v_nonce,v_timestamp,v_operation);
  v_request:=net.http_post(
    url:='https://tg-kezia2.vercel.app/api/internal/reminders/dispatch',
    body:=jsonb_build_object('operation',v_operation),
    headers:=jsonb_build_object('Content-Type','application/json','X-Prazo-Timestamp',v_timestamp::text,'X-Prazo-Nonce',v_nonce::text,'X-Prazo-Signature',v_signature),
    timeout_milliseconds:=130000);
  update reminder_private.scheduler_invocations set request_id=v_request where nonce=v_nonce;
  return v_nonce;
end;
$function$;

CREATE OR REPLACE FUNCTION reminder_private.prepare_scheduler()
  RETURNS bigint
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare v_job bigint;
begin
  insert into reminder_private.scheduler_config(singleton,enabled) values(true,false) on conflict(singleton) do nothing;
  select jobid into v_job from cron.job where jobname='prazo-claro-reminders' and username=current_user;
  if v_job is null then
    v_job:=cron.schedule('prazo-claro-reminders','* * * * *','select reminder_private.dispatch_tick(false);');
    perform cron.alter_job(v_job,active:=false);
  end if;
  return v_job;
end;
$function$;

CREATE OR REPLACE FUNCTION reminder_private.set_scheduler_enabled (
  p_enabled boolean
)
  RETURNS boolean
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare v_job bigint;
begin
  if p_enabled is null then raise exception using errcode='22023',message='invalid_enable'; end if;
  perform reminder_private.collect_scheduler_results();
  if p_enabled and (not exists(select 1 from vault.decrypted_secrets where name='prazo_claro_scheduler_secret' and length(decrypted_secret)>=32)
    or not exists(select 1 from reminder_private.scheduler_invocations where operation='probe' and used_at is not null and created_at>now()-interval '15 minutes' and http_status=200 and summary->>'probe_ok'='true' and summary->>'delivery_enabled'='true')) then
    raise exception using errcode='22023',message='successful_probe_required';
  end if;
  v_job:=reminder_private.prepare_scheduler();
  update reminder_private.scheduler_config set enabled=p_enabled where singleton;
  perform cron.alter_job(v_job,active:=p_enabled);
  return p_enabled;
end;
$function$;

CREATE INDEX scheduler_invocations_created_idx ON reminder_private.scheduler_invocations USING btree (created_at);

REVOKE ALL ON FUNCTION "public"."consume_reminder_invocation"(uuid, bigint, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."consume_reminder_invocation"(uuid, bigint, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."consume_reminder_invocation"(uuid, bigint, text) TO "service_role";

REVOKE ALL ON FUNCTION "reminder_private"."collect_scheduler_results"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "reminder_private"."consume_invocation"(uuid, bigint, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "reminder_private"."consume_invocation"(uuid, bigint, text) TO "service_role";

REVOKE ALL ON FUNCTION "reminder_private"."dispatch_tick"(boolean) FROM PUBLIC;

REVOKE ALL ON FUNCTION "reminder_private"."prepare_scheduler"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "reminder_private"."set_scheduler_enabled"(boolean) FROM PUBLIC;

