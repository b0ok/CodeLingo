-- CodeLingo schema: one row set per learner, every table locked to its owner by row level security.
-- Tables follow the build plan's data model. Writes the app may not make (check-ins, subscriptions)
-- have no insert/update policy; only server functions using the service role can write them.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 40),
  age_confirmed_at timestamptz,           -- set once the 13+ birthdate check passes; the birthdate itself is not stored
  active_language text not null default 'python' check (active_language in ('python', 'javascript', 'sql', 'web')),
  career_goal text,
  theme text not null default 'emerald',
  sound_enabled boolean not null default true,
  daily_goal_xp integer not null default 50 check (daily_goal_xp between 10 and 500),
  reminder_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  gold_rings integer not null default 0 check (gold_rings >= 0),
  life_points smallint not null default 5 check (life_points between 0 and 5),
  life_points_refilled_at timestamptz,
  streak integer not null default 0 check (streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  streak_freezes smallint not null default 0 check (streak_freezes >= 0),
  league text not null default 'Bronze' check (league in ('Bronze', 'Silver', 'Gold', 'Sapphire', 'Ruby', 'Diamond', 'Legend')),
  league_weekly_xp integer not null default 0 check (league_weekly_xp >= 0),
  last_active_date date,
  updated_at timestamptz not null default now()
);

create table public.lesson_results (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  stars smallint not null check (stars between 1 and 3),
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('badge', 'milestone', 'challenge')),
  item_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, kind, item_id)
);

create table public.xp_log (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  xp integer not null check (xp >= 0),
  primary key (user_id, day)
);

create table public.checkins (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  milestone_id text not null,
  score smallint check (score between 0 and 100),
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(10, 6) not null default 0,
  created_at timestamptz not null default now()
);
create index checkins_user_created_idx on public.checkins (user_id, created_at desc);

create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique,
  plan text not null check (plan in ('pro_monthly', 'pro_yearly', 'founder')),
  status text not null,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- Row level security: signed-in learners see and change only their own rows.
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.lesson_results enable row level security;
alter table public.achievements enable row level security;
alter table public.xp_log enable row level security;
alter table public.checkins enable row level security;
alter table public.subscriptions enable row level security;

create policy "own profile: read" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "own profile: update" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own progress: read" on public.progress for select to authenticated using (user_id = (select auth.uid()));
-- ponytail: the app writes its own progress for now, so a learner could inflate their XP; move writes to a server function once leagues are real.
create policy "own progress: update" on public.progress for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own lessons: read" on public.lesson_results for select to authenticated using (user_id = (select auth.uid()));
create policy "own lessons: add" on public.lesson_results for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own lessons: update" on public.lesson_results for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own achievements: read" on public.achievements for select to authenticated using (user_id = (select auth.uid()));
create policy "own achievements: add" on public.achievements for insert to authenticated with check (user_id = (select auth.uid()));

create policy "own xp log: read" on public.xp_log for select to authenticated using (user_id = (select auth.uid()));
create policy "own xp log: add" on public.xp_log for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own xp log: update" on public.xp_log for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own checkins: read" on public.checkins for select to authenticated using (user_id = (select auth.uid()));
create policy "own subscription: read" on public.subscriptions for select to authenticated using (user_id = (select auth.uid()));

-- Every new account gets its profile and progress rows.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.progress (user_id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
