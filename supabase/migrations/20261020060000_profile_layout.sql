-- Pro learners can turn My Space into their whole profile page.
alter table public.profiles
  add column profile_layout text not null default 'standard' check (profile_layout in ('standard', 'custom'));
