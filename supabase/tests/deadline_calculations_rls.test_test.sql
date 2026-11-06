begin;
select no_plan();
insert into auth.users(id, email) values
  ('11111111-1111-1111-1111-111111111111', 'owner@example.invalid'),
  ('22222222-2222-2222-2222-222222222222', 'other@example.invalid');
select ok((select relrowsecurity from pg_class where oid = 'public.deadline_calculations'::regclass), 'RLS enabled on deadline_calculations');
set local role anon;
select throws_ok($$select * from public.deadline_calculations$$, '42501', null, 'anon cannot read calculations');
select throws_ok($$insert into public.deadline_calculations(owner_id,input,result_snapshot) values ('11111111-1111-1111-1111-111111111111','{}','{}')$$, '42501', null, 'anon cannot insert');
select throws_ok($$delete from public.deadline_calculations$$, '42501', null, 'anon cannot delete');
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated","is_anonymous":false}';
select results_eq(
  $$insert into public.deadline_calculations(id,owner_id,title,input,result_snapshot) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','Fixture','{}','{}') returning title$$,
  array['Fixture'], 'owner inserts own calculation');
select results_eq($$select title from public.deadline_calculations where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$, array['Fixture'], 'owner reads own calculation');
select throws_ok($$update public.deadline_calculations set title = 'changed'$$, '42501', null, 'snapshots cannot be updated through user role');
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","is_anonymous":false}';
select is_empty($$select * from public.deadline_calculations$$, 'other user sees no private calculations');
select throws_ok($$insert into public.deadline_calculations(owner_id,input,result_snapshot) values ('11111111-1111-1111-1111-111111111111','{}','{}')$$, '42501', null, 'other user cannot insert for owner');
select is_empty($$delete from public.deadline_calculations where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' returning title$$, 'other user deletes no owner rows');
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated","is_anonymous":false}';
select results_eq($$select title from public.deadline_calculations where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$, array['Fixture'], 'denied update and delete left owner row intact');
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated","is_anonymous":true}';
select is_empty($$select * from public.deadline_calculations$$, 'anonymous sign-in cannot read even matching owner id');
select throws_ok($$insert into public.deadline_calculations(owner_id,input,result_snapshot) values ('11111111-1111-1111-1111-111111111111','{}','{}')$$, '42501', null, 'anonymous sign-in cannot insert');
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated","is_anonymous":false}';
select results_eq($$delete from public.deadline_calculations where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' returning title$$, array['Fixture'], 'owner deletes own calculation');
select * from finish();
rollback;
