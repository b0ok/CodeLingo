-- Row level security check: learner A must not see or change learner B's rows.
-- Run against a development project (SQL editor or `supabase db query`); it rolls itself back.
begin;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'rls-a@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'rls-b@example.test');

-- B's data, written as the server would.
insert into public.lesson_results (user_id, lesson_id, stars) values ('00000000-0000-0000-0000-00000000000b', 'py-1', 3);
insert into public.checkins (user_id, milestone_id, model) values ('00000000-0000-0000-0000-00000000000b', 'm1', 'claude-haiku-5-5');
insert into public.subscriptions (user_id, plan, status) values ('00000000-0000-0000-0000-00000000000b', 'founder', 'active');

-- Act as learner A.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);

do $$
declare n int;
begin
  -- A sees exactly their own profile and progress (made by the sign-up trigger) and none of B's rows.
  select count(*) into n from public.profiles;        if n <> 1 then raise exception 'profiles: A sees % rows', n; end if;
  select count(*) into n from public.progress;        if n <> 1 then raise exception 'progress: A sees % rows', n; end if;
  select count(*) into n from public.lesson_results;  if n <> 0 then raise exception 'lesson_results leak'; end if;
  select count(*) into n from public.checkins;        if n <> 0 then raise exception 'checkins leak'; end if;
  select count(*) into n from public.subscriptions;   if n <> 0 then raise exception 'subscriptions leak'; end if;

  -- A cannot change B's progress.
  update public.progress set xp = 9999 where user_id = '00000000-0000-0000-0000-00000000000b';
  get diagnostics n = row_count;                      if n <> 0 then raise exception 'progress: A updated B'; end if;

  -- A cannot write rows for B, or give themselves a subscription or check-in.
  begin
    insert into public.lesson_results (user_id, lesson_id, stars) values ('00000000-0000-0000-0000-00000000000b', 'py-2', 3);
    raise exception 'lesson_results: A wrote for B';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.subscriptions (user_id, plan, status) values ('00000000-0000-0000-0000-00000000000a', 'founder', 'active');
    raise exception 'subscriptions: A gave themselves a plan';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.checkins (user_id, milestone_id, model) values ('00000000-0000-0000-0000-00000000000a', 'm1', 'x');
    raise exception 'checkins: A wrote a check-in';
  exception when insufficient_privilege then null;
  end;

  -- A can save their own lesson.
  insert into public.lesson_results (user_id, lesson_id, stars) values ('00000000-0000-0000-0000-00000000000a', 'py-1', 2);
  raise notice 'RLS check passed';
end $$;

rollback;
