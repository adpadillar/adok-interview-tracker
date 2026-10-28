# Interview issue tracker

A small issue tracker starter for a live technical interview. Built with Next.js App Router, tRPC, Tailwind CSS, TypeScript, and SQLite.

## Run

Use Node.js 22 or newer and pnpm 10.

```sh
pnpm i
pnpm dev
```

Open http://localhost:3000. SQLite creates `data/issues.db` and seeds 15 issues on first use. Data persists across restarts. To reset the data, stop the server and delete `data/`.

## Code

- `src/app/page.tsx` contains the issue list and create form.
- `src/server/router.ts` contains the tRPC procedures and the 700 ms delay middleware applied to every procedure. Mutations wait for the server, then refetch the list.
- `src/server/db.ts` contains the SQLite table and seed data, including the `position` column.
- `src/lib/issues.ts` contains the shared validation schemas.

Run `pnpm typecheck` to check types and `pnpm build` to build for production.
