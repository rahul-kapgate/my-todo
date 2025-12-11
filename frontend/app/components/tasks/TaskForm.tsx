"use client";

import { useState, FormEvent } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { TaskStatus } from "@/lib/api";

export type TaskFormValues = {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: Date | null;
};

type StatusOption = {
  value: TaskStatus;
  label: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: "todo",        label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done",        label: "Done" },
];

type TaskFormProps = {
  open: boolean;                    // 👈 NEW: control dialog visibility
  creating: boolean;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  onCancel: () => void;             // called when user closes/cancels
};

export const TaskForm: React.FC<TaskFormProps> = ({
  open,
  creating,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [status, setStatus] = useState<TaskStatus>("todo");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSubmit({
      title,
      description,
      status,
      dueDate,
    });

    // reset local state after successful submit
    setTitle("");
    setDescription("");
    setDueDate(new Date());
    setStatus("todo");
  };

  const handleClose = () => {
    if (!creating) {
      onCancel();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className:
          "bg-neutral-900 border border-neutral-700 rounded-2xl text-neutral-50",
      }}
    >
      <DialogTitle className="border-b border-neutral-800 pb-3 text-base font-semibold">
        Add Task
      </DialogTitle>

      <DialogContent className="pt-4 pb-3">
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
            <label className="block text-neutral-300">Description</label>
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
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-400"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* We keep actions in DialogActions instead of here */}
        </form>
      </DialogContent>

      <DialogActions className="border-t border-neutral-800 px-4 py-3">
        <button
          type="button"
          onClick={handleClose}
          className="px-3 py-1.5 text-xs rounded-full border border-neutral-600 hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          form=":r0:" // NOT needed; Dialog wraps form so we submit from JS below instead
          disabled={creating}
          onClick={(e) => {
            // manually trigger submit on the form
            const form = (e.currentTarget.closest("div")?.previousElementSibling as HTMLElement)?.querySelector("form");
            form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
          }}
          className="px-4 py-1.5 text-xs rounded-full bg-blue-500 text-white font-medium hover:bg-blue-400 disabled:opacity-60"
        >
          {creating ? "Saving…" : "Save Task"}
        </button>
      </DialogActions>
    </Dialog>
  );
};
