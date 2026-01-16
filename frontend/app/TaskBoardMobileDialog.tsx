import React, { useMemo, useState } from "react";

type Priority = "Low" | "Medium" | "High";
type Status = "todo" | "done";

type Task = {
  id: string;
  title: string;
  details: string;
  createdAt: string;
  priority: Priority;
  dueDate: string;
  status: Status;
  completedAt?: string | null;
};

const initialTasks: Task[] = [
  {
    id: "t1",
    title: "Task 1",
    details: "Add task list UI + details panel",
    createdAt: "Jan 16, 2026",
    priority: "High",
    dueDate: "Jan 20, 2026",
    status: "todo",
    completedAt: null,
  },
  {
    id: "t2",
    title: "Task 2",
    details: "Hook up API and persist tasks",
    createdAt: "Jan 16, 2026",
    priority: "Medium",
    dueDate: "Jan 22, 2026",
    status: "todo",
    completedAt: null,
  },
  {
    id: "t3",
    title: "Task 3",
    details: "Add filters and search",
    createdAt: "Jan 16, 2026",
    priority: "Low",
    dueDate: "Jan 25, 2026",
    status: "done",
    completedAt: "Jan 16, 2026",
  },
];

function clsx(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "green" | "red" | "amber";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-slate-100 text-slate-700 ring-slate-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

function PriorityPill({ p }: { p: Priority }) {
  const tone = p === "High" ? "red" : p === "Medium" ? "amber" : "green";
  return <Pill tone={tone}>{p}</Pill>;
}

function StatusToggle({
  value,
  onChange,
}: {
  value: Status;
  onChange: (v: Status) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("todo")}
        className={clsx(
          "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
          value === "todo"
            ? "bg-slate-900 text-white"
            : "text-slate-700 hover:bg-slate-50"
        )}
      >
        Todo
      </button>
      <button
        type="button"
        onClick={() => onChange("done")}
        className={clsx(
          "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
          value === "done"
            ? "bg-slate-900 text-white"
            : "text-slate-700 hover:bg-slate-50"
        )}
      >
        Done
      </button>
    </div>
  );
}

function LabelRow({
  label,
  value,
  right,
}: {
  label: string;
  value?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="mt-1 break-words text-sm font-medium text-slate-900">
          {value ?? <span className="text-slate-400">—</span>}
        </div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/** Simple dialog (no external libs) */
function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      aria-modal="true"
      role="dialog"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog overlay"
      />

      <div className="absolute inset-0 flex items-end sm:items-center sm:justify-center">
        <div className="w-full rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
            <div className="truncate text-base font-bold text-slate-900">
              {title ?? "Task"}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <div className="max-h-[75vh] overflow-auto px-4 py-4 sm:max-h-[80vh] sm:px-5">
            {children}
          </div>

          {footer ? (
            <div className="border-t border-slate-200 px-4 py-3 sm:px-5">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TaskDetailsForm({
  task,
  onChange,
}: {
  task: Task;
  onChange: (patch: Partial<Task>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Task Name
          </div>
          <input
            value={task.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base font-bold text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <div className="shrink-0">
          <StatusToggle
            value={task.status}
            onChange={(v) => onChange({ status: v })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <LabelRow
          label="Task details"
          value={
            <textarea
              value={task.details}
              onChange={(e) => onChange({ details: e.target.value })}
              rows={4}
              className="mt-0.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-slate-400"
            />
          }
        />

        <div className="space-y-3">
          <LabelRow label="Task created at" value={task.createdAt} />

          <LabelRow
            label="Task priority"
            value={<PriorityPill p={task.priority} />}
            right={
              <select
                value={task.priority}
                onChange={(e) => onChange({ priority: e.target.value as Priority })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none hover:bg-slate-50"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            }
          />
        </div>

        <LabelRow
          label="Due date"
          value={task.dueDate}
          right={
            <input
              type="text"
              placeholder="e.g., Jan 20, 2026"
              value={task.dueDate === "—" ? "" : task.dueDate}
              onChange={(e) => onChange({ dueDate: e.target.value || "—" })}
              className="w-[170px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-slate-400"
            />
          }
        />

        <LabelRow
          label="Status"
          value={<Pill tone={task.status === "done" ? "green" : "blue"}>{task.status}</Pill>}
        />
      </div>
    </div>
  );
}

export default function TaskBoardMobileDialog() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedId, setSelectedId] = useState<string>(initialTasks[0]?.id ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "add">("view");
  const [draft, setDraft] = useState<Task | null>(null);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedId) ?? null,
    [tasks, selectedId]
  );

  function openView(taskId: string) {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    setSelectedId(taskId);
    setMode("view");
    setDraft({ ...t });
    setDialogOpen(true);
  }

  function openAdd() {
    const now = "Jan 16, 2026";
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: "",
      details: "",
      createdAt: now,
      priority: "Low",
      dueDate: "—",
      status: "todo",
      completedAt: null,
    };
    setMode("add");
    setDraft(newTask);
    setDialogOpen(true);
  }

  function patchDraft(patch: Partial<Task>) {
    setDraft((p) => (p ? { ...p, ...patch } : p));
  }

  function saveDraft() {
    if (!draft) return;

    const cleanTitle = draft.title.trim();
    if (!cleanTitle) {
      alert("Please enter a task name.");
      return;
    }

    // if status switches to done, store completedAt = today (ISO is better in real app)
    const today = "Jan 16, 2026";
    const completedAt =
      draft.status === "done" ? draft.completedAt ?? today : null;

    const next = { ...draft, completedAt };

    if (mode === "add") {
      setTasks((p) => [next, ...p]);
      setSelectedId(next.id);
    } else {
      setTasks((p) => p.map((t) => (t.id === next.id ? next : t)));
    }

    setDialogOpen(false);
  }

  return (
    <div className="w-full">
      {/* ✅ Desktop center: max-w + mx-auto + grid centered already */}
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="text-sm font-bold text-slate-900">Tasks</div>
            <button
              type="button"
              onClick={openAdd}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
            >
              + Add Task
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
            {/* LEFT list */}
            <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Task List
              </div>

              <div className="mt-3 space-y-2">
                {tasks.map((t) => {
                  const active = t.id === selectedId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => openView(t.id)}
                      className={clsx(
                        "w-full rounded-xl border px-3 py-3 text-left transition",
                        active
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold">
                          {t.title || "Untitled task"}
                        </div>
                        <Pill tone={t.status === "done" ? "green" : "blue"}>{t.status}</Pill>
                      </div>

                      <div
                        className={clsx(
                          "mt-1 line-clamp-2 text-xs",
                          active ? "text-slate-200" : "text-slate-500"
                        )}
                      >
                        {t.details || "No details"}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <PriorityPill p={t.priority} />
                        <Pill tone="neutral">Due: {t.dueDate}</Pill>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* RIGHT preview (desktop only) */}
            <section className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:block">
              {!selectedTask ? (
                <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-slate-500">
                  Select a task
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-900">Task Details</div>
                    <button
                      type="button"
                      onClick={() => openView(selectedTask.id)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Open
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-base font-bold text-slate-900">
                      {selectedTask.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {selectedTask.details || "No details"}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <PriorityPill p={selectedTask.priority} />
                      <Pill tone={selectedTask.status === "done" ? "green" : "blue"}>
                        {selectedTask.status}
                      </Pill>
                      <Pill tone="neutral">Due: {selectedTask.dueDate}</Pill>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Dialog (no delete) */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={mode === "add" ? "Add Task" : "Task Details"}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveDraft}
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:w-auto"
            >
              Save
            </button>
          </div>
        }
      >
        {draft ? <TaskDetailsForm task={draft} onChange={patchDraft} /> : null}
      </Dialog>
    </div>
  );
}
