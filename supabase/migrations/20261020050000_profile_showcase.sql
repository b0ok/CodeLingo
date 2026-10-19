-- Profile showcase: which stats a learner shows, and the Pro "My Space" HTML and CSS.
-- The app sanitizes and sandboxes My Space when it renders; these caps bound the size.
alter table public.profiles
  add column showcase_stats text[] not null default '{}' check (cardinality(showcase_stats) <= 8),
  add column space_html text not null default '' check (char_length(space_html) <= 5000),
  add column space_css text not null default '' check (char_length(space_css) <= 5000);
