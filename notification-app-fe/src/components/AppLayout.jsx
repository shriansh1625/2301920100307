import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useLocation, useNavigate } from "react-router-dom";

const ROUTES = ["/", "/priority"];

export function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = ROUTES.indexOf(location.pathname) === -1 ? 0 : ROUTES.indexOf(location.pathname);

  function handleTabChange(_, newIndex) {
    navigate(ROUTES[newIndex]);
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky">
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                bgcolor: "primary.main",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NotificationsIcon sx={{ fontSize: 18, color: "#fff" }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "text.primary", letterSpacing: "-0.01em" }}
            >
              Campus Notifications
            </Typography>
          </Box>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                minHeight: 48,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                color: "text.secondary",
                px: 2,
                "&.Mui-selected": {
                  color: "primary.main",
                  fontWeight: 600,
                },
              },
            }}
          >
            <Tab
              label="All Notifications"
              icon={<NotificationsIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              sx={{ gap: 0.5 }}
            />
            <Tab
              label="Priority Inbox"
              icon={<StarBorderIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              sx={{ gap: 0.5 }}
            />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        {children}
      </Container>
    </Box>
  );
}
