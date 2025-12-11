"use client";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { FilterStatus } from "@/lib/api";
import { CalendarDays, Filter } from "lucide-react";

type TaskFiltersProps = {
  filterDate: Date | null;
  onFilterDateChange: (value: Date | null) => void;
  filterStatus: FilterStatus;
  onFilterStatusChange: (value: FilterStatus) => void;
};

const STATUS_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filterDate,
  onFilterDateChange,
  filterStatus,
  onFilterStatusChange,
}) => {
  return (
    <section className="mb-4 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-3 sm:px-4 sm:py-3.5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters</span>
        </div>

        {filterDate && (
          <button
            type="button"
            onClick={() => onFilterDateChange(null)}
            className="text-[11px] text-neutral-400 hover:text-neutral-100 underline-offset-2 hover:underline"
          >
            Clear date
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Date filter */}
        <div className="w-full md:w-auto space-y-1 text-xs text-neutral-300">
          <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-neutral-400">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Filter by due date</span>
          </span>
          <DatePicker
            value={filterDate}
            onChange={(newValue) => onFilterDateChange(newValue)}
            slotProps={{
              textField: {
                size: "small",
                sx: {
                  minWidth: 220,
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

        {/* Status filter */}
        <div className="flex flex-col gap-1 text-xs text-neutral-300">
          <span className="text-[11px] uppercase tracking-wide text-neutral-400">
            Status
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((option) => {
              const isActive = filterStatus === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onFilterStatusChange(option.value)}
                  className={[
                    "rounded-full px-3 py-1.5 text-[11px] font-medium border transition-all",
                    isActive
                      ? "border-blue-500 bg-blue-500/15 text-blue-200 shadow-sm shadow-black/40"
                      : "border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800/70",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
