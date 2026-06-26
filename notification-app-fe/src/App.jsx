import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Log } from "logging-middleware";

import { AppLayout } from "./components/AppLayout.jsx";
import { NotificationsPage } from "./pages/NotificationsPage.jsx";
import { PriorityPage } from "./pages/PriorityPage.jsx";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1565c0",
    },
  },
});

export default function App() {
  useEffect(() => {
    Log("frontend", "info", "page", "notification app mounted").catch(() => {
      // Avoid blocking render if logging fails.
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<NotificationsPage />} />
            <Route path="/priority" element={<PriorityPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
