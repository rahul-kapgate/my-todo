// components/tasks/TasksPage.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Task,
  TaskStatus,
  FilterStatus,
  fetchTasks,
  createTask,
  updateTaskStatus,
} from "@/lib/api";
import { TaskFilters } from "./TaskFilters";
import { TaskList } from "./TaskList";
import { TaskForm, TaskFormValues } from "./TaskForm";
import { TaskDetails } from "./TaskDetails";

const getDayRangeIso = (date: Date | null) => {
  if (!date) return { fromDue: undefined, toDue: undefined };
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return {
    fromDue: start.toISOString(),
    toDue: end.toISOString(),
  };
};

export const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterDate, setFilterDate] = useState<Date | null>(new Date());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Load tasks whenever filters change
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const { fromDue, toDue } = getDayRangeIso(filterDate);

        const data = await fetchTasks({
          status: filterStatus,
          fromDue,
          toDue,
        });

        setTasks(data);

        // keep selected task if still present
        if (selectedTask) {
          const stillThere = data.find((t) => t.id === selectedTask.id);
          if (!stillThere) setSelectedTask(null);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate, filterStatus]);

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleCreateTask = async (values: TaskFormValues) => {
    const { title, description, status, dueDate } = values;
    if (!title.trim()) return;

    try {
      setCreating(true);
      setError(null);

      const payload = {
        title: title.trim(),
        description: description?.trim() || undefined,
        status,
        due_date: dueDate ? dueDate.toISOString() : undefined,
      };

      const newTask = await createTask(payload);

      // If new task matches current date filter, include it
      const { fromDue, toDue } = getDayRangeIso(filterDate);
      const newDue = newTask.due_date
        ? new Date(newTask.due_date)
        : new Date(newTask.created_at);

      if (
        !fromDue ||
        !toDue ||
        (newDue >= new Date(fromDue) && newDue <= new Date(toDue))
      ) {
        setTasks((prev) => [newTask, ...prev]);
      }

      setSelectedTask(newTask);
      setShowAddForm(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  // 🔥 NEW: change status via PUT API and update UI
  const handleChangeStatus = async (task: Task, newStatus: TaskStatus) => {
    if (task.status === newStatus) return;

    try {
      setError(null);
      const updated = await updateTaskStatus(task.id, newStatus);

      // Update tasks list
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );

      // Update selected task if it's the same one
      setSelectedTask((prev) =>
        prev && prev.id === updated.id ? updated : prev
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to update task");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center">
      <div className="max-w-5xl w-full p-6 md:p-10 border border-neutral-700 rounded-2xl bg-neutral-900/70">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Tasks
          </h1>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center rounded-full border border-neutral-400 px-4 py-1.5 text-sm font-medium hover:bg-neutral-100 hover:text-black transition-colors"
          >
            Add Task
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6">
          {/* LEFT: Task list + filters */}
          <section className="border border-neutral-700 rounded-xl p-4 bg-neutral-900/60">
            <TaskFilters
              filterDate={filterDate}
              onFilterDateChange={setFilterDate}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
            />

            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              selectedTaskId={selectedTask?.id ?? null}
              onSelectTask={setSelectedTask}
            />
          </section>

          {/* RIGHT: Add Task form + Details */}
          <div className="space-y-4">
            {showAddForm && (
              <TaskForm
                creating={creating}
                onSubmit={handleCreateTask}
                onCancel={() => setShowAddForm(false)}
              />
            )}

            {selectedTask && (
              <TaskDetails
                task={selectedTask}
                onChangeStatus={(status) =>
                  handleChangeStatus(selectedTask, status)
                }
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
