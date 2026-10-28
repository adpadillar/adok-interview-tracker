import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { issueSchema, type Issue } from "@/lib/issues";

mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
export const db = new Database(path.join(process.cwd(), "data", "issues.db"));
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Backlog', 'Todo', 'In progress', 'Done')),
    priority TEXT NOT NULL CHECK (priority IN ('Urgent', 'High', 'Medium', 'Low')),
    position INTEGER NOT NULL
  )
`);

const titles = [
  "Design the onboarding welcome screen",
  "Fix session timeout on mobile",
  "Add an empty state to the dashboard",
  "Update the billing confirmation email",
  "Improve contrast on secondary buttons",
  "Investigate slow workspace loading",
  "Write the getting started guide",
  "Clean up unused API endpoints",
  "Add validation to the signup form",
  "Fix avatar upload for large images",
  "Review the notification settings copy",
  "Polish the account settings layout",
  "Handle expired invitation links",
  "Update the footer links",
  "Ship the new activity feed",
];

const statuses: Issue["status"][] = ["In progress", "Todo", "Backlog", "Done"];
const priorities: Issue["priority"][] = ["High", "Urgent", "Medium", "Low"];

db.transaction(() => {
  const count = db.prepare("SELECT id FROM issues LIMIT 1").get();
  if (count) return;
  const insert = db.prepare(
    "INSERT INTO issues (title, status, priority, position) VALUES (?, ?, ?, ?)",
  );
  titles.forEach((title, index) => {
    insert.run(
      title,
      statuses[index % statuses.length],
      priorities[index % priorities.length],
      index,
    );
  });
})();

export function listIssues() {
  return issueSchema
    .array()
    .parse(db.prepare("SELECT * FROM issues ORDER BY id").all());
}
