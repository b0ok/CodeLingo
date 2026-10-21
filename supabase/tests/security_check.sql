-- Security hardening check. Run against a development project; it rolls itself back.
begin;

-- Free-text word filter: each word on its own, so innocent names that hide a blocked word across a space pass.
do $$
declare
  r record;
begin
  for r in select * from (values
    ('T3RRR (◣_◢)', 'ok'), ('Chris Hitchens', 'ok'), ('Amy the Analyst', 'ok'), ('Grape Lover 99', 'ok'),
    ('I love Python and SQL!', 'ok'), ('Learning to code 👋', 'ok'), ('Kill switch fan', 'ok'),
    ('Big Dick', 'not_allowed'), ('f4ck this', 'not_allowed'), ('what the hell', 'not_allowed'),
    ('small jew', 'not_allowed'), ('n4zi coder', 'not_allowed'), ('user1488', 'not_allowed'),
    ('Admin', 'reserved'), ('CodeLingo Team', 'reserved'), ('Official Support', 'reserved'), ('Pyto', 'reserved')
  ) as t(txt, expected) loop
    if coalesce(public.text_problem(r.txt), 'ok') <> r.expected then
      raise exception '%: expected %, got %', r.txt, r.expected, coalesce(public.text_problem(r.txt), 'ok');
    end if;
  end loop;
  -- Usernames keep their old answers.
  if public.username_problem('kill_switch') is not null or public.username_problem('f_u_c_k') <> 'not_allowed'
    or public.username_problem('admin_bob') <> 'reserved' or public.username_problem('jewel_maker') is not null then
    raise exception 'username_problem changed';
  end if;
end $$;

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000c1', 'cap@example.test');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}', true);

do $$
begin
  -- Blocked words and oversized fields are refused by the database itself.
  begin
    update public.profiles set display_name = 'Big Dick' where id = auth.uid();
    raise exception 'bad display name was saved';
  exception when check_violation then null;
  end;
  begin
    update public.profiles set career_goal = repeat('x', 1000) where id = auth.uid();
    raise exception 'huge career_goal was saved';
  exception when check_violation then null;
  end;
  begin
    insert into public.lesson_results (user_id, lesson_id, stars) values (auth.uid(), repeat('x', 65), 1);
    raise exception 'huge lesson_id was saved';
  exception when check_violation then null;
  end;

  -- Row ceiling: 4,000 days of xp_log fit, the 4,001st doesn't.
  insert into public.xp_log (user_id, day, xp) select auth.uid(), date '2020-01-01' + g, 10 from generate_series(0, 3999) g;
  begin
    insert into public.xp_log (user_id, day, xp) values (auth.uid(), date '2040-01-01', 10);
    raise exception 'row ceiling did not hold';
  exception when sqlstate '54000' then null;
  end;
end $$;

rollback;
