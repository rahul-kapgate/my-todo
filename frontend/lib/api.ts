const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string | null;
}

export type FilterStatus = TaskStatus | "all";

export interface TaskFilter {
  status?: FilterStatus;
  fromDue?: string;
  toDue?: string;
}

export async function fetchTasks(filter?: TaskFilter): Promise<Task[]> {
  const url = new URL(`${API_BASE_URL}/tasks/`);

  if (filter?.status && filter.status !== "all") {
    url.searchParams.set("status", filter.status);
  }
  if (filter?.fromDue) {
    url.searchParams.set("from_due", filter.fromDue);
  }
  if (filter?.toDue) {
    url.searchParams.set("to_due", filter.toDue);
  }

  const res = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load tasks");
  }

  return res.json();
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/`, {
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
