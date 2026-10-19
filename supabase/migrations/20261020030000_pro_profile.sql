-- Pro profile extras: an avatar frame, a status line and a pinned code snippet.
-- Lengths are capped here; Pro-only use is enforced server-side once Pro status comes
-- from the subscriptions table (build plan PR 11).
alter table public.profiles
  add column frame text not null default 'none' check (char_length(frame) <= 20),
  add column status text not null default '' check (char_length(status) <= 40),
  add column snippet_language text not null default 'python' check (snippet_language in ('python', 'javascript', 'sql', 'web')),
  add column snippet_code text not null default '' check (char_length(snippet_code) <= 600);
