"use client";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { FilterStatus } from "@/lib/api";

type TaskFiltersProps = {
  filterDate: Date | null;
  onFilterDateChange: (value: Date | null) => void;
  filterStatus: FilterStatus;
  onFilterStatusChange: (value: FilterStatus) => void;
};

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filterDate,
  onFilterDateChange,
  filterStatus,
  onFilterStatusChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
      <div className="text-xs text-neutral-300 space-y-1 w-full md:w-auto">
        <span className="block mb-1">Filter by date</span>
        <DatePicker
          value={filterDate}
          onChange={(newValue) => onFilterDateChange(newValue)}
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
          onChange={(e) => onFilterStatusChange(e.target.value as FilterStatus)}
          className="w-full md:w-40 rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="all">All</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
};
