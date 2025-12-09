"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  Task,
  TaskStatus,
  FilterStatus,
  fetchTasks,
  createTask,
} from "../lib/api";
import { formatToIST } from "../lib/date";


import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

type StatusOption = {
  value: TaskStatus;
  label: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: "todo",        label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done",        label: "Done" },
];

// MUI dark theme so inputs look correct in dark UI
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

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

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Task form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [status, setStatus] = useState<TaskStatus>("todo");

  // Filter state – default: today's date, all statuses
  const [filterDate, setFilterDate] = useState<Date | null>(new Date());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Load tasks whenever filters change (and on first mount)
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
        // keep selected task if still present, otherwise clear
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(new Date());
    setStatus("todo");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      setError(null);

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        due_date: dueDate ? dueDate.toISOString() : undefined,
      };

      const newTask = await createTask(payload);

      // if the new task matches current date filter, show it
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
      resetForm();
      setShowAddForm(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
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
              {/* LEFT: Task list */}
              <section className="border border-neutral-700 rounded-xl p-4 bg-neutral-900/60">
                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div className="text-xs text-neutral-300 space-y-1 w-full md:w-auto">
                    <span className="block mb-1">Filter by date</span>
                    <DatePicker
                      value={filterDate}
                      onChange={(newValue) => setFilterDate(newValue)}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: {
                            minWidth: 210,
                            "& .MuiInputBase-root": {
                              backgroundColor: "#020617",
                              color: "#e5e7eb",
                              fontSize: "0.75rem",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#3f3f46",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#60a5fa",
                            },
                            "& .MuiSvgIcon-root": {
                              color: "#e5e7eb",
                            },
                          },
                        },
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-neutral-300">
                    <span>Status</span>
                    <select
                      value={filterStatus}
                      onChange={(e) =>
                        setFilterStatus(e.target.value as FilterStatus)
                      }
                      className="w-full md:w-40 rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      <option value="all">All</option>
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Header row */}
                <div className="grid grid-cols-[2fr_1.4fr_1fr] text-sm font-medium border-b border-neutral-700 pb-2 mb-2">
                  <span>Title</span>
                  <span>Date &amp; time</span>
                  <span>Status</span>
                </div>

                {loading && (
                  <p className="text-sm text-neutral-400">Loading tasks…</p>
                )}
                {error && (
                  <p className="text-sm text-red-400 mb-2">{error}</p>
                )}

                {!loading && tasks.length === 0 && !error && (
                  <p className="text-sm text-neutral-500">
                    No tasks for this filter.
                  </p>
                )}

                <div className="space-y-2 mt-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`w-full text-left rounded-lg px-3 py-2 border border-neutral-700/80 bg-neutral-900/80 hover:bg-neutral-800 transition-colors text-sm
                        ${
                          selectedTask?.id === task.id
                            ? "ring-1 ring-blue-400"
                            : ""
                        }`}
                    >
                      <div className="grid grid-cols-[2fr_1.4fr_1fr] items-center gap-2">
                        <div className="truncate font-medium">
                          {task.title}
                        </div>
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
              </section>

              {/* RIGHT: Add Task form + Details */}
              <div className="space-y-4">
                {showAddForm && (
                  <section className="border border-neutral-700 rounded-xl p-4 bg-neutral-900/70">
                    <h2 className="text-base font-semibold mb-3">Add Task</h2>
                    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                      <div className="space-y-1">
                        <label className="block text-neutral-300">Title</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-400"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-neutral-300">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-neutral-300 mb-1">
                          Date &amp; time
                        </label>
                        <DateTimePicker
                          value={dueDate}
                          onChange={(newValue) => setDueDate(newValue)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: "small",
                              sx: {
                                "& .MuiInputBase-root": {
                                  backgroundColor: "#020617",
                                  color: "#e5e7eb",
                                },
                                "& .MuiInputBase-input": {
                                  paddingY: "10px",
                                  fontSize: "0.875rem",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#3f3f46",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#60a5fa",
                                },
                                "& .MuiSvgIcon-root": {
                                  color: "#e5e7eb",
                                },
                              },
                            },
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-neutral-300">Status</label>
                        <select
                          value={status}
                          onChange={(e) =>
                            setStatus(e.target.value as TaskStatus)
                          }
                          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            resetForm();
                            setShowAddForm(false);
                          }}
                          className="px-3 py-1.5 text-xs rounded-full border border-neutral-600 hover:bg-neutral-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={creating}
                          className="px-4 py-1.5 text-xs rounded-full bg-blue-500 text-white font-medium hover:bg-blue-400 disabled:opacity-60"
                        >
                          {creating ? "Saving…" : "Save Task"}
                        </button>
                      </div>
                    </form>
                  </section>
                )}

                {selectedTask && (
                  <section className="border border-neutral-700 rounded-xl p-4 bg-neutral-900/70 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-base font-semibold">
                        {selectedTask.title}
                      </h2>
                      <span className="text-xs text-neutral-400">
                      {formatToIST(selectedTask.due_date ?? selectedTask.created_at)}
                      </span>
                    </div>

                    <div className="mb-2">
                      <p className="text-xs uppercase text-neutral-400 mb-1">
                        Description
                      </p>
                      <p className="whitespace-pre-wrap">
                        {selectedTask.description || "No description"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-neutral-400 mb-1">
                        Status
                      </p>
                      <p className="inline-flex items-center px-2 py-0.5 rounded-full border border-neutral-600 text-xs">
                        {selectedTask.status.replace("_", " ")}
                      </p>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </main>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
