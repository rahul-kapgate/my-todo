// src/lib/api.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high"; // ✅ NEW

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority; // ✅ NEW
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority; // ✅ NEW
  due_date?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority; // ✅ NEW
  due_date?: string | null;
}

export type FilterStatus = TaskStatus | "all";
export type FilterPriority = TaskPriority | "all"; // ✅ NEW

export interface TaskFilter {
  status?: FilterStatus;
  priority?: FilterPriority; // ✅ NEW
  fromDue?: string;
  toDue?: string;
  /** When true: backend will return tasks due today + all past-due not-done tasks */
  includeOverdueForToday?: boolean;
}

export async function fetchTasks(filter?: TaskFilter): Promise<Task[]> {
  const url = new URL(`${API_BASE_URL}/tasks`);

  if (filter?.status && filter.status !== "all") {
    url.searchParams.set("status", filter.status);
  }

  // ✅ NEW
  if (filter?.priority && filter.priority !== "all") {
    url.searchParams.set("priority", filter.priority);
  }

  if (filter?.fromDue) {
    url.searchParams.set("from_due", filter.fromDue);
  }
  if (filter?.toDue) {
    url.searchParams.set("to_due", filter.toDue);
  }
  if (filter?.includeOverdueForToday) {
    url.searchParams.set("include_overdue_for_today", "true");
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load tasks");
  return res.json();
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create task");
  }

  return res.json();
}

/**
 * Full update for a task (PUT /tasks/:id).
 * You can send any subset of fields: title, description, status, due_date.
 */
export async function updateTask(
  id: string,
  data: UpdateTaskInput
): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update task");
  }

  return res.json();
}

/**
 * Convenience helper: only change the status of a task.
 */
export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<Task> {
  return updateTask(id, { status });
}
