import { z } from "zod";

export const statusSchema = z.enum(["Backlog", "Todo", "In progress", "Done"]);
export const prioritySchema = z.enum(["Urgent", "High", "Medium", "Low"]);

export const createIssueSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(200),
  status: statusSchema,
  priority: prioritySchema,
});

export const issueSchema = createIssueSchema.extend({
  id: z.number().int().positive(),
  position: z.number().int(),
});

export type Issue = z.infer<typeof issueSchema>;
