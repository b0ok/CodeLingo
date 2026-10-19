-- Usernames: unique @handles that stay family friendly.
-- The database is the single rulebook; the app asks check_username() and shows the answer.

-- Why a name can't be used, or null when it can (ignoring whether it's taken).
create function public.username_problem(name text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  n text := lower(name);
  leet text;
  squash text;
  tokens text[];
  w text;
begin
  if n !~ '^[a-z][a-z0-9_]{2,19}$' then
    return 'invalid';
  end if;

  -- Undo common look-alike swaps (f4ck, sh1t) and ignore underscores (f_u_c_k).
  leet := translate(n, '0134578', 'oieastb');
  squash := replace(leet, '_', '');

  -- Blocked anywhere in the name.
  foreach w in array array[
    'fuck', 'fuk', 'fck', 'shit', 'bitch', 'biatch', 'cunt', 'pussy', 'penis', 'vagina', 'porn',
    'nigg', 'faggot', 'slut', 'whore', 'dildo', 'boob', 'horny', 'nazi', 'hitler', 'molest', 'pedo',
    'incest', 'bastard', 'jizz', 'retard', 'wank', 'twat', 'tits', 'blowjob', 'handjob', 'sexy',
    'xxx', 'milf', 'orgasm', 'erotic', 'nude', 'naked', 'kys', 'suicide'
  ] loop
    if position(w in squash) > 0 then
      return 'not_allowed';
    end if;
  end loop;

  -- Blocked only as a whole word, so class, grape, peacock and analyst still work.
  tokens := regexp_split_to_array(n, '[_0-9]+') || regexp_split_to_array(leet, '_+') || array[squash];
  if tokens && array[
    'ass', 'asses', 'sex', 'rape', 'rapist', 'cock', 'dick', 'fag', 'cum', 'tit', 'hoe', 'hoes',
    'kkk', 'anal', 'kill', 'die', 'drug', 'drugs', 'weed', 'meth', 'damn', 'hell', 'crap', 'piss'
  ] then
    return 'not_allowed';
  end if;

  if n = any (array[
    'admin', 'administrator', 'mod', 'moderator', 'support', 'staff', 'official', 'help', 'root',
    'system', 'null', 'undefined', 'everyone', 'here', 'you', 'me', 'pyto', 'codelingo', 'team',
    'security', 'owner'
  ]) or squash like 'codelingo%' or squash like 'admin%' or squash like 'moderator%' or squash like 'official%' then
    return 'reserved';
  end if;

  return null;
end;
$$;

alter table public.profiles
  add column username text unique
    check (username is null or (username = lower(username) and public.username_problem(username) is null));

-- 'ok', 'taken', 'invalid', 'not_allowed' or 'reserved'. Callable before sign-up so the form can check as you type.
create function public.check_username(name text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  problem text := public.username_problem(name);
begin
  if problem is not null then
    return problem;
  end if;
  if exists (select 1 from public.profiles where username = lower(name) and id is distinct from auth.uid()) then
    return 'taken';
  end if;
  return 'ok';
end;
$$;

revoke execute on function public.check_username(text) from public;
grant execute on function public.check_username(text) to anon, authenticated;
