-- Profile customization: preset avatar and banner, a short bio, featured badges.
-- Lengths are capped at the Pro limits here; which choices are Pro-only gets enforced
-- server-side once Pro status comes from the subscriptions table (build plan PR 11).
alter table public.profiles
  add column avatar text not null default 'snake' check (char_length(avatar) <= 20),
  add column bio text not null default '' check (char_length(bio) <= 160),
  add column banner text not null default 'emerald' check (char_length(banner) <= 20),
  add column featured_badges text[] not null default '{}' check (cardinality(featured_badges) <= 6);
