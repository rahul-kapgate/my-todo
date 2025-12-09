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
      <div className="grid grid-cols-[2fr_1.4fr_1fr] text-sm font-medium border-b border-neutral-700 pb-2 mb-2">
        <span>Title</span>
        <span>Date &amp; time</span>
        <span>Status</span>
      </div>

      {loading && (
        <p className="text-sm text-neutral-400">Loading tasks…</p>
      )}

      {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

      {!loading && tasks.length === 0 && !error && (
        <p className="text-sm text-neutral-500">No tasks for this filter.</p>
      )}

      <div className="space-y-2 mt-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onSelectTask(task)}
            className={`w-full text-left rounded-lg px-3 py-2 border border-neutral-700/80 bg-neutral-900/80 hover:bg-neutral-800 transition-colors text-sm
              ${selectedTaskId === task.id ? "ring-1 ring-blue-400" : ""}`}
          >
            <div className="grid grid-cols-[2fr_1.4fr_1fr] items-center gap-2">
              <div className="truncate font-medium">{task.title}</div>
              <div className="text-xs text-neutral-400">
                {formatToIST(task.due_date ?? task.created_at)}
              </div>
              <div className="text-xs uppercase tracking-wide">
                {task.status.replace("_", " ")}
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};
