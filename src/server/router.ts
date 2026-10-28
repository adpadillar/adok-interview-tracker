import { initTRPC } from "@trpc/server";
import { createIssueSchema, issueSchema } from "@/lib/issues";
import { db, listIssues } from "./db";

const t = initTRPC.create();

// DO NOT REMOVE OR CHANGE THIS DELAY.
// This app runs fully locally, so this artificial 700 ms delay simulates real
// network latency. It is intentional and must stay as is.
const procedure = t.procedure.use(async ({ next }) => {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return next();
});

export const appRouter = t.router({
  issues: t.router({
    list: procedure.query(() => listIssues()),
    create: procedure.input(createIssueSchema).mutation(({ input }) => {
      const create = db.transaction(() => {
        const result = db
          .prepare(
            `
          INSERT INTO issues (title, status, priority, position)
          VALUES (?, ?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM issues))
        `,
          )
          .run(input.title, input.status, input.priority);
        return issueSchema.parse(
          db
            .prepare("SELECT * FROM issues WHERE id = ?")
            .get(result.lastInsertRowid),
        );
      });
      return create();
    }),
  }),
});

export type AppRouter = typeof appRouter;
