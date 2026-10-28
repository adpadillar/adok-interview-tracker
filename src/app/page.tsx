"use client";

import { useState, type FormEvent } from "react";
import { trpc } from "@/lib/trpc";
import {
  createIssueSchema,
  prioritySchema,
  statusSchema,
  type Issue,
} from "@/lib/issues";

const statusColors: Record<Issue["status"], string> = {
  Backlog: "bg-slate-100 text-slate-500",
  Todo: "bg-stone-100 text-stone-600",
  "In progress": "bg-amber-50 text-amber-700",
  Done: "bg-emerald-50 text-emerald-700",
};
const priorityColors: Record<Issue["priority"], string> = {
  Urgent: "text-red-600",
  High: "text-orange-600",
  Medium: "text-slate-600",
  Low: "text-slate-400",
};
const fieldClass =
  "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-violet-500";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const issues = trpc.issues.list.useQuery();
  const utils = trpc.useUtils();
  const createIssue = trpc.issues.create.useMutation({
    onSuccess: async () => {
      await utils.issues.list.invalidate();
      setShowForm(false);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = createIssueSchema.safeParse({
      title: data.get("title"),
      status: data.get("status"),
      priority: data.get("priority"),
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }
    setFormError("");
    createIssue.mutate(parsed.data);
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-10 sm:py-16">
      <div className="mb-10 flex items-center gap-2 text-sm font-semibold text-zinc-500">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white">
          O
        </span>
        Orbit <span className="mx-2 text-zinc-300">/</span> Product
      </div>
      <header className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Issues</h1>
          <p className="mt-1 text-sm text-zinc-500">
            A little progress, every day.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            createIssue.reset();
            setFormError("");
          }}
          disabled={createIssue.isPending}
          className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {showForm ? "Close form" : "+ New issue"}
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-xl border border-zinc-200 bg-white p-5"
        >
          <h2 className="mb-4 text-sm font-semibold">Create issue</h2>
          <fieldset
            disabled={createIssue.isPending}
            className="space-y-4 disabled:opacity-60"
          >
            <label className="block text-sm">
              Title
              <input
                autoFocus
                name="title"
                required
                maxLength={200}
                placeholder="What needs to be done?"
                className={`${fieldClass} mt-1.5`}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm">
                Status
                <select
                  name="status"
                  defaultValue="Todo"
                  className={`${fieldClass} mt-1.5`}
                >
                  {statusSchema.options.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Priority
                <select
                  name="priority"
                  defaultValue="Medium"
                  className={`${fieldClass} mt-1.5`}
                >
                  {prioritySchema.options.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </label>
            </div>
            {(formError || createIssue.error) && (
              <p role="alert" className="text-sm text-red-600">
                {formError || createIssue.error?.message}
              </p>
            )}
            <button
              type="submit"
              className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              {createIssue.isPending ? "Creating…" : "Create issue"}
            </button>
          </fieldset>
        </form>
      )}

      <section
        aria-label="Issue list"
        className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/70 px-5 py-3 text-xs font-medium text-zinc-500">
          <span>
            All issues{" "}
            {issues.data && (
              <span className="ml-2 rounded bg-zinc-200/60 px-1.5 py-0.5">
                {issues.data.length}
              </span>
            )}
          </span>
          {issues.isFetching && (
            <span role="status">
              {issues.isPending ? "Loading…" : "Refreshing…"}
            </span>
          )}
        </div>
        {issues.isPending && (
          <p className="px-5 py-12 text-center text-sm text-zinc-400">
            Loading issues…
          </p>
        )}
        {issues.isError && (
          <div role="alert" className="p-5 text-sm text-red-600">
            {issues.error.message}{" "}
            <button onClick={() => issues.refetch()} className="ml-2 underline">
              Retry
            </button>
          </div>
        )}
        {issues.data?.length === 0 && (
          <p className="p-10 text-center text-sm text-zinc-500">
            No issues yet. Create your first issue.
          </p>
        )}
        <ul className="divide-y divide-zinc-100">
          {issues.data?.map((issue) => (
            <li
              key={issue.id}
              className="flex flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap"
            >
              <span className="w-14 shrink-0 text-xs tabular-nums text-zinc-400">
                ORB-{issue.id}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium">
                {issue.title}
              </span>
              <div className="ml-auto flex shrink-0 items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs ${statusColors[issue.status]}`}
                >
                  {issue.status}
                </span>
                <span
                  className={`w-14 text-right text-xs ${priorityColors[issue.priority]}`}
                >
                  {issue.priority}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
