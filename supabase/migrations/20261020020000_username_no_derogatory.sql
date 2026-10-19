-- No derogatory usernames. A username has no context, so identity words (religion, ethnicity,
-- sexuality, disability) can only read as a label or an insult ("smalljew"); they are kept out
-- entirely, along with slurs and hate references. A short allowlist keeps innocent words that
-- happen to contain a blocked one (jewel, spicy, raccoon).
create or replace function public.username_problem(name text)
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

  -- Blocked anywhere in the name.
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
