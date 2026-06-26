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
      main: "#2563EB",
      light: "#EFF6FF",
      dark: "#1D4ED8",
    },
    success: {
      main: "#16A34A",
      light: "#F0FDF4",
    },
    warning: {
      main: "#D97706",
      light: "#FFFBEB",
    },
    info: {
      main: "#0369A1",
      light: "#F0F9FF",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "sans-serif",
    ].join(","),
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    subtitle1: {
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body2: {
      lineHeight: 1.6,
    },
    caption: {
      letterSpacing: "0.01em",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.15s ease, transform 0.15s ease",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "0.72rem",
          letterSpacing: "0.02em",
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px !important",
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.875rem",
          border: "1px solid #E2E8F0 !important",
          color: "#64748B",
          "&.Mui-selected": {
            backgroundColor: "#2563EB",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#1D4ED8",
            },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: 6,
          "& .MuiToggleButtonGroup-grouped": {
            border: "1px solid #E2E8F0 !important",
            borderRadius: "8px !important",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#0F172A",
          borderBottom: "1px solid #E2E8F0",
          boxShadow: "none",
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          "& .MuiPaginationItem-root": {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default function App() {
  useEffect(() => {
    Log("frontend", "info", "page", "notification app mounted").catch(() => {});
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
