// components/tasks/TaskDetails.tsx
"use client";

import { Task, TaskStatus } from "@/lib/api";
import { formatToIST } from "@/lib/date";

type TaskDetailsProps = {
  task: Task;
  onChangeStatus?: (status: TaskStatus) => void;
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  onChangeStatus,
}) => {
  return (
    <section className="border border-neutral-700 rounded-xl p-4 bg-neutral-900/70 text-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold">{task.title}</h2>
        <span className="text-xs text-neutral-400">
          {formatToIST(task.due_date ?? task.created_at)}
        </span>
      </div>

      <div className="mb-2">
        <p className="text-xs uppercase text-neutral-400 mb-1">Description</p>
        <p className="whitespace-pre-wrap">
          {task.description || "No description"}
        </p>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs uppercase text-neutral-400 mb-1">Status</p>
          <p className="inline-flex items-center px-2 py-0.5 rounded-full border border-neutral-600 text-xs">
            {task.status.replace("_", " ")}
          </p>
        </div>

        {/* 🔥 New: change status UI */}
        {onChangeStatus && (
          <div className="space-y-1">
            <p className="text-xs uppercase text-neutral-400 mb-1">
              Change status
            </p>
            <select
              value={task.status}
              onChange={(e) => onChangeStatus(e.target.value as TaskStatus)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </section>
  );
};
