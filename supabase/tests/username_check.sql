-- Username rules check. Run against a development project; it rolls itself back.
begin;

do $$
declare
  r record;
begin
  for r in select * from (values
    ('codecooker', 'ok'), ('t3_trims', 'ok'), ('py_ninja99', 'ok'), ('classic_coder', 'ok'),
    ('grape_lover', 'ok'), ('skillful', 'ok'), ('kill_switch', 'ok'), ('hello_world', 'ok'),
    ('assistant_dev', 'ok'), ('passport', 'ok'), ('cocktail_fan', 'ok'), ('peacock', 'ok'),
    ('analyst_amy', 'ok'), ('therapist', 'ok'), ('diego', 'ok'),
    ('f4ck_this', 'not_allowed'), ('sh1t_coder', 'not_allowed'), ('a55', 'not_allowed'),
    ('big_dick', 'not_allowed'), ('f_u_c_k', 'not_allowed'), ('sexy_dev', 'not_allowed'),
    ('n4zi', 'not_allowed'), ('hell', 'not_allowed'),
    ('admin', 'reserved'), ('admin_bob', 'reserved'), ('codelingo_team', 'reserved'), ('pyto', 'reserved'),
    ('ab', 'invalid'), ('1coder', 'invalid'), ('has space', 'invalid'), ('way_too_long_username_here', 'invalid')
  ) as t(name, expected) loop
    if coalesce(public.username_problem(r.name), 'ok') <> r.expected then
      raise exception '%: expected %, got %', r.name, r.expected, coalesce(public.username_problem(r.name), 'ok');
    end if;
  end loop;
end $$;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'name-a@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'name-b@example.test');
update public.profiles set username = 'codecooker' where id = '00000000-0000-0000-0000-00000000000a';

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);

do $$
begin
  if public.check_username('codecooker') <> 'taken' then raise exception 'taken name not reported'; end if;
  if public.check_username('CodeCooker') <> 'taken' then raise exception 'taken check is case-sensitive'; end if;
  if public.check_username('fresh_name') <> 'ok' then raise exception 'free name not ok'; end if;

  -- The database itself refuses bad or duplicate names, whatever the app sends.
  begin
    update public.profiles set username = 'codecooker' where id = '00000000-0000-0000-0000-00000000000b';
    raise exception 'duplicate username saved';
  exception when unique_violation then null;
  end;
  begin
    update public.profiles set username = 'sh1t_coder' where id = '00000000-0000-0000-0000-00000000000b';
    raise exception 'blocked username saved';
  exception when check_violation then null;
  end;
  begin
    update public.profiles set username = 'Mixed_Case' where id = '00000000-0000-0000-0000-00000000000b';
    raise exception 'uppercase username saved';
  exception when check_violation then null;
  end;
  update public.profiles set username = 'fresh_name' where id = '00000000-0000-0000-0000-00000000000b';
end $$;

-- Signed-out visitors can check names during sign-up.
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$
begin
  if public.check_username('fresh_name') <> 'taken' then raise exception 'signed-out check missed a taken name'; end if;
  if public.check_username('brand_new_name') <> 'ok' then raise exception 'signed-out check rejected a free name'; end if;
end $$;

rollback;
