# CodeLingo

Bite-sized code learning. Duolingo-style lessons for Python, JavaScript, SQL and HTML & CSS, where every answer is real code that runs in your browser.

## What's in it

| Course | Units | Lessons | Challenges |
|---|---|---|---|
| Python | 10 | 27 | 189 |
| JavaScript | 9 | 27 | 189 |
| SQL | 9 | 20 | 140 |
| HTML & CSS | 6 | 9 | 63 |

- **Real code execution:** Python runs in a Web Worker through Pyodide, JavaScript runs in the browser, and SQL runs on a built-in engine against a sample database. Answers are graded on output, not string matching. HTML & CSS are graded with structural checks.
- **Retry, then explain:** a wrong answer gets one more try before the explanation shows.
- **Game loop:** XP and levels, streaks, gold rings, life points, daily tasks, a ring shop, badges and leagues.
- **Practice and sandbox:** 22 practice sets plus a free playground.
- **Accounts (optional):** Supabase email sign-in with cloud progress sync, profiles, usernames and account deletion. Without keys, it runs fully local.

## Stack

React 19 · TypeScript · Vite · Tailwind v4 · Supabase (Postgres + RLS) · Pyodide

## Run it

```bash
npm install
cp .env.example .env.local   # optional: add Supabase URL + publishable key for sign-in
npm run dev                  # http://localhost:3000
```

## Checks

Every PR runs these in GitHub Actions:

```bash
npm run lint              # tsc --noEmit
npm run build
npm run check:curriculum  # lesson/challenge structure
npm run check:sync        # roadmaps match curricula
npm run check:economy     # rewards and prices match the game economy
npm run verify:snippets   # sample answers actually pass their graders
```

Database migrations live in `supabase/migrations`, and RLS checks live in `supabase/tests`.

## License

Source is visible for portfolio purposes. All rights reserved, see [LICENSE](LICENSE).
