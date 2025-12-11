// components/tasks/TaskDetails.tsx
"use client";

import { Task, TaskStatus } from "@/lib/api";
import { formatToIST } from "@/lib/date";
import { CalendarDays, Info, ListChecks } from "lucide-react";

type TaskDetailsProps = {
  task: Task;
  onChangeStatus?: (status: TaskStatus) => void;
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const STATUS_BADGE_STYLES: Record<TaskStatus, string> = {
  todo: "bg-amber-500/10 text-amber-300 border-amber-500/40",
  in_progress: "bg-blue-500/10 text-blue-300 border-blue-500/40",
  done: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
};

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  onChangeStatus,
}) => {
  const statusLabel = STATUS_LABELS[task.status];

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 sm:p-5 shadow-md shadow-black/30 text-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-50 leading-snug">
            {task.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {task.due_date ? "Due:" : "Created:"}{" "}
              <span className="text-neutral-200">
                {formatToIST(task.due_date ?? task.created_at)}
              </span>
            </span>
          </div>
        </div>

        {/* Current status badge */}
        <div className="flex items-start">
          <span
            className={[
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
              STATUS_BADGE_STYLES[task.status],
            ].join(" ")}
          >
            <ListChecks className="h-3.5 w-3.5" />
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-400">
          <Info className="h-3.5 w-3.5" />
          <span>Description</span>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2">
          <p className="whitespace-pre-wrap text-sm text-neutral-100">
            {task.description ? (
              task.description
            ) : (
              <span className="italic text-neutral-500">No description</span>
            )}
          </p>
        </div>
      </div>

      {/* Change status */}
      {onChangeStatus && (
        <div className="space-y-2 pt-1 border-t border-neutral-800/70">
          <p className="text-xs uppercase tracking-wide text-neutral-400 flex items-center gap-1.5">
            <span className="inline-block h-1 w-1 rounded-full bg-blue-400" />
            Change status
          </p>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => {
              const isActive = status === task.status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => !isActive && onChangeStatus(status)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                    "flex items-center gap-1.5",
                    isActive
                      ? STATUS_BADGE_STYLES[status] +
                        " shadow-sm shadow-black/40 cursor-default"
                      : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800/70",
                  ].join(" ")}
                >
                  <span className="capitalize">
                    {STATUS_LABELS[status]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
