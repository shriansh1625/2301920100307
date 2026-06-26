import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

const navButtonStyles = {
  color: "inherit",
  textTransform: "none",
  fontWeight: 500,
};

export function AppLayout({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar sx={{ gap: 1, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Campus Notifications
          </Typography>

          <Button
            component={NavLink}
            to="/"
            end
            sx={navButtonStyles}
            style={({ isActive }) => ({
              borderBottom: isActive ? "2px solid #fff" : "2px solid transparent",
            })}
          >
            All Notifications
          </Button>

          <Button
            component={NavLink}
            to="/priority"
            sx={navButtonStyles}
            style={({ isActive }) => ({
              borderBottom: isActive ? "2px solid #fff" : "2px solid transparent",
            })}
          >
            Priority Inbox
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}
