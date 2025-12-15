"use client";

import { Task } from "@/lib/api";
import { formatToIST } from "@/lib/date";

type TaskListProps = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTaskId: string | null;
  onSelectTask: (task: Task) => void;
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  error,
  selectedTaskId,
  onSelectTask,
}) => {
  return (
    <>
      {/* Header row */}
      <div className="grid grid-cols-[2fr_1.4fr_1fr_0.8fr] text-sm font-medium border-b border-neutral-700 pb-2 mb-2">
        <span>Title</span>
        <span>Date &amp; time</span>
        <span>Status</span>
        <span>Priority</span>
      </div>

      {loading && (
        <p className="text-sm text-neutral-400">Loading tasks…</p>
      )}

      {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

      {!loading && tasks.length === 0 && !error && (
        <p className="text-sm text-neutral-500">No tasks for this filter.</p>
      )}

      <div className="space-y-2 mt-2">
        {tasks.map((task) => {
          const hasDueDate = !!task.due_date;
          const isOverdue =
            hasDueDate &&
            new Date(task.due_date!) < new Date() &&
            task.status !== "done";

          return (
            <button
              key={task.id}
              onClick={() => onSelectTask(task)}
              className={[
                "w-full text-left rounded-lg px-3 py-2 border transition-colors text-sm",
                selectedTaskId === task.id ? "ring-1 ring-blue-400" : "",
                isOverdue
                  ? "border-red-500/70 bg-red-950/50 hover:bg-red-900/70"
                  : "border-neutral-700/80 bg-neutral-900/80 hover:bg-neutral-800",
              ].join(" ")}
            >
              <div className="grid grid-cols-[2fr_1.4fr_1fr_0.8fr] items-center gap-2">
                {/* Title */}
                <div
                  className={
                    "truncate font-medium " +
                    (isOverdue ? "text-red-100" : "")
                  }
                >
                  {task.title}
                </div>

                {/* Date */}
                <div
                  className={
                    "text-xs " +
                    (isOverdue ? "text-red-200" : "text-neutral-400")
                  }
                >
                  {formatToIST(task.due_date ?? task.created_at)}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                  <span
                    className={
                      isOverdue
                        ? "text-red-300 font-semibold"
                        : "text-neutral-200"
                    }
                  >
                    {task.status.replace("_", " ")}
                  </span>

                  {isOverdue && (
                    <span className="ml-2 rounded-full border border-red-500/60 bg-red-900/70 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-red-100">
                      Overdue
                    </span>
                  )}
                </div>

                <div className="text-xs uppercase tracking-wide text-neutral-200">
                  {task.priority}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
};
