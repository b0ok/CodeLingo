-- Security hardening.
-- 1. Size caps: every text column and every per-learner table has a ceiling, so one account
--    with a script can't fill the database (a full free-tier database goes read-only for everyone).
-- 2. The username word filter now also covers display names, bios and status lines.

-- ---------- 1. Size caps ----------

alter table public.profiles
  add constraint profiles_career_goal_len check (char_length(career_goal) <= 40),
  add constraint profiles_theme_len check (char_length(theme) <= 20),
  add constraint profiles_featured_badges_len check (char_length(array_to_string(featured_badges, '')) <= 6 * 64),
  add constraint profiles_showcase_stats_len check (char_length(array_to_string(showcase_stats, '')) <= 8 * 64);

alter table public.lesson_results add constraint lesson_results_id_len check (char_length(lesson_id) <= 64);
alter table public.achievements add constraint achievements_id_len check (char_length(item_id) <= 64);
alter table public.xp_log add constraint xp_log_xp_max check (xp <= 100000);

-- Row ceilings per learner, far above what real progress needs (the app has under 1,000 lessons and challenges).
create function public.cap_rows_per_user()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  n integer;
begin
  execute format('select count(*) from %I.%I where user_id = $1', tg_table_schema, tg_table_name) into n using new.user_id;
  if n >= tg_argv[0]::integer then
    raise exception 'row limit reached for %', tg_table_name using errcode = '54000';
  end if;
  return new;
end;
$$;

create trigger cap_rows before insert on public.lesson_results
  for each row execute function public.cap_rows_per_user('3000');
create trigger cap_rows before insert on public.achievements
  for each row execute function public.cap_rows_per_user('3000');
-- One row per day: about 10 years.
create trigger cap_rows before insert on public.xp_log
  for each row execute function public.cap_rows_per_user('4000');

-- ---------- 2. Word filter ----------

-- Why one word can't be used ('not_allowed'), or null. The word is lowercase letters, digits and underscores.
-- This is the content half of username_problem, unchanged; usernames and free text both use it.
create function public.word_problem(n text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  leet text;
  squash text;
  tokens text[];
  w text;
begin
  -- Hate numbers, checked before digits are read as letters.
  if replace(n, '_', '') like '%1488%' then
    return 'not_allowed';
  end if;

  -- Undo common look-alike swaps (f4ck, sh1t) and ignore underscores (f_u_c_k).
  leet := translate(n, '0134578', 'oieastb');
  squash := replace(leet, '_', '');

  -- Innocent words that contain a blocked one are removed before the anywhere-check.
  foreach w in array array['jewel', 'spice', 'spicy', 'raccoon', 'cocoon', 'tycoon', 'scunthorpe'] loop
    squash := replace(squash, w, '');
  end loop;

  -- Blocked anywhere in the word.
  foreach w in array array[
    -- profanity and sexual terms
    'fuck', 'fuk', 'fck', 'fack', 'phuck', 'fuq', 'shit', 'shyt', 'bitch', 'biatch', 'cunt', 'pussy',
    'penis', 'vagina', 'porn', 'slut', 'whore', 'dildo', 'boob', 'horny', 'molest', 'pedo', 'incest',
    'bastard', 'jizz', 'wank', 'twat', 'tits', 'blowjob', 'handjob', 'sexy', 'xxx', 'milf', 'orgasm',
    'erotic', 'nude', 'naked', 'fatass', 'fatso',
    -- slurs
    'nigg', 'negro', 'faggot', 'fagg', 'dyke', 'tranny', 'kike', 'spic', 'chink', 'gook', 'wetback',
    'beaner', 'towelhead', 'raghead', 'chinaman', 'retard', 'autist', 'spastic', 'cripple', 'midget',
    'mongoloid',
    -- identity words (religion, ethnicity, sexuality)
    'jew', 'muslim', 'islam', 'gay', 'lesbian', 'homo', 'queer',
    -- hate and violence
    'nazi', 'hitler', 'heil', 'kkk', 'whitepower', 'whitepride', 'swastika', 'holocaust', 'genocide',
    'lynch', 'terrorist', 'jihad', 'kys', 'suicide'
  ] loop
    if position(w in squash) > 0 then
      return 'not_allowed';
    end if;
  end loop;

  -- Blocked only as a whole word, so class, grape, peacock, japan and pakistan still work.
  tokens := regexp_split_to_array(n, '[_0-9]+') || regexp_split_to_array(leet, '_+') || array[replace(leet, '_', '')];
  if tokens && array[
    'ass', 'asses', 'sex', 'rape', 'rapist', 'cock', 'dick', 'fag', 'cum', 'tit', 'hoe', 'hoes',
    'anal', 'drug', 'drugs', 'weed', 'meth', 'damn', 'hell', 'crap', 'piss',
    'coon', 'paki', 'jap', 'wop', 'kraut', 'gypsy', 'nig', 'tard', 'slave', 'slaves'
  ] then
    return 'not_allowed';
  end if;

  return null;
end;
$$;

create or replace function public.username_problem(name text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  n text := lower(name);
  squash text;
  w text;
begin
  if n !~ '^[a-z][a-z0-9_]{2,19}$' then
    return 'invalid';
  end if;

  if public.word_problem(n) is not null then
    return 'not_allowed';
  end if;

  squash := replace(translate(n, '0134578', 'oieastb'), '_', '');
  foreach w in array array['jewel', 'spice', 'spicy', 'raccoon', 'cocoon', 'tycoon', 'scunthorpe'] loop
    squash := replace(squash, w, '');
  end loop;
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

-- Why free text (display name, bio, status) can't be used: 'not_allowed', 'reserved', or null.
-- Each word is checked on its own, so "Chris Hitchens" isn't read as "...shit...".
create function public.text_problem(t text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  w text;
  whole text := regexp_replace(lower(coalesce(t, '')), '[^a-z0-9]+', '', 'g');
begin
  -- ponytail: spaced-out letters (f u c k) and look-alike Unicode letters get past a per-word check; a report button covers those.
  foreach w in array regexp_split_to_array(lower(coalesce(t, '')), '[^a-z0-9_]+') loop
    if w <> '' and public.word_problem(w) is not null then
      return 'not_allowed';
    end if;
  end loop;
  -- Names that pose as the team.
  if whole in ('admin', 'administrator', 'moderator', 'mod', 'support', 'staff', 'official', 'pyto')
    or whole like 'codelingo%' or whole like 'official%' or whole like 'admin%' or whole like 'moderator%' then
    return 'reserved';
  end if;
  return null;
end;
$$;

grant execute on function public.text_problem(text) to anon, authenticated;

alter table public.profiles
  add constraint profiles_display_name_words check (display_name is null or public.text_problem(display_name) is null),
  add constraint profiles_bio_words check (public.text_problem(bio) is distinct from 'not_allowed'),
  add constraint profiles_status_words check (public.text_problem(status) is distinct from 'not_allowed');
