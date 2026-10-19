-- Ring shop purchases are kept with the other achievements, as kind 'item'.
alter table public.achievements drop constraint achievements_kind_check;
alter table public.achievements add constraint achievements_kind_check
  check (kind in ('badge', 'milestone', 'challenge', 'item'));
