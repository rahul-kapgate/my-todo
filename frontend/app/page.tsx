"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TasksPage } from "./components/tasks/TasksPage";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function HomePage() {
  return (
    <ThemeProvider theme={darkTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <TasksPage />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
