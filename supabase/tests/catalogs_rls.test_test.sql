begin;
select no_plan();
insert into public.legal_sources(id,title,url,provision,consulted_at,review_status) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Test approved','https://example.invalid/a','fixture',now(),'approved'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Test pending','https://example.invalid/b','fixture',now(),'pending');
insert into public.legal_rule_versions(rule_key,version,source_id,scope,valid_from,definition,review_status) values
  ('fixture-approved','1','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','{}','2026-01-01','{}','approved'),
  ('fixture-pending-source','1','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','{}','2026-01-01','{}','approved'),
  ('fixture-pending','1','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','{}','2026-01-01','{}','pending');
insert into public.calendar_versions(calendar_key,version,court,locality,coverage_start,coverage_end,is_complete,review_status,snapshot) values
  ('fixture-approved','1','TJSP','São Paulo','2026-01-01','2026-12-31',true,'approved','{}'),
  ('fixture-pending','1','TJSP','São Paulo','2026-01-01','2026-12-31',false,'pending','{}');
select ok((select relrowsecurity from pg_class where oid = 'public.legal_sources'::regclass), 'RLS enabled on legal_sources');
select ok((select relrowsecurity from pg_class where oid = 'public.legal_rule_versions'::regclass), 'RLS enabled on legal_rule_versions');
select ok((select relrowsecurity from pg_class where oid = 'public.calendar_versions'::regclass), 'RLS enabled on calendar_versions');
set local role anon;
select results_eq($$select title from public.legal_sources where title like 'Test %'$$, array['Test approved'], 'anon sees only reviewed source');
select results_eq($$select rule_key from public.legal_rule_versions where rule_key like 'fixture-%'$$, array['fixture-approved'], 'anon sees approved rule with approved source');
select results_eq($$select calendar_key from public.calendar_versions where calendar_key like 'fixture-%'$$, array['fixture-approved'], 'anon sees only approved complete calendar');
select throws_ok($$insert into public.calendar_versions(calendar_key,version,court,locality,coverage_start,coverage_end,snapshot) values ('bad','1','TJSP','São Paulo','2026-01-01','2026-12-31','{}')$$, '42501', null, 'anon cannot insert calendar');
set local role authenticated;
select results_eq($$select title from public.legal_sources where title like 'Test %'$$, array['Test approved'], 'authenticated sees reviewed sources only');
select results_eq($$select rule_key from public.legal_rule_versions where rule_key like 'fixture-%'$$, array['fixture-approved'], 'authenticated sees reviewed rules only');
select results_eq($$select calendar_key from public.calendar_versions where calendar_key like 'fixture-%'$$, array['fixture-approved'], 'authenticated sees reviewed complete calendar only');
select throws_ok($$update public.legal_sources set review_status = 'approved'$$, '42501', null, 'user cannot approve sources');
select throws_ok($$delete from public.legal_rule_versions$$, '42501', null, 'user cannot remove rules');
select throws_ok($$update public.calendar_versions set review_status = 'approved'$$, '42501', null, 'user cannot approve calendars');
reset role;
select results_eq($$select title from public.legal_sources where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' and review_status = 'pending'$$, array['Test pending'], 'denied write left source intact');
select * from finish();
rollback;
