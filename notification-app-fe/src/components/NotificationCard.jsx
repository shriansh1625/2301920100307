import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { appLog } from "../utils/appLog.js";
import {
  isNotificationViewed,
  markNotificationViewed,
} from "../utils/viewedNotifications.js";

const TYPE_CONFIG = {
  Placement: {
    color: "success",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    dot: "#16A34A",
  },
  Result: {
    color: "info",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    dot: "#0369A1",
  },
  Event: {
    color: "warning",
    bg: "#FFFBEB",
    border: "#FDE68A",
    dot: "#D97706",
  },
};

function formatTimestamp(raw) {
  try {
    const normalized = raw.includes("T") ? raw : `${raw.replace(" ", "T")}Z`;
    const date = new Date(normalized);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return raw;
  }
}

export function NotificationCard({ notification, viewedIds, onViewed }) {
  const isNew = !isNotificationViewed(notification.ID, viewedIds);
  const config = TYPE_CONFIG[notification.Type] ?? {
    color: "default",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    dot: "#94A3B8",
  };

  async function handleClick() {
    if (!isNew) return;
    markNotificationViewed(notification.ID);
    onViewed(notification.ID);
    appLog("frontend", "info", "component", "notification marked viewed");
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: isNew ? config.border : "#E2E8F0",
        bgcolor: isNew ? config.bg : "background.paper",
        "&:hover": isNew
          ? {
              boxShadow: "0 4px 12px 0 rgba(0,0,0,0.08)",
              transform: "translateY(-1px)",
            }
          : {},
      }}
    >
      <CardActionArea
        onClick={handleClick}
        disabled={!isNew}
        disableRipple={!isNew}
        sx={{
          "&:hover .MuiCardActionArea-focusHighlight": { opacity: 0 },
          cursor: isNew ? "pointer" : "default",
        }}
      >
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                mt: "3px",
                flexShrink: 0,
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: isNew ? config.dot : "transparent",
                border: isNew ? "none" : "1.5px solid #CBD5E1",
              }}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
                mb={0.75}
              >
                <Chip
                  label={notification.Type}
                  color={config.color}
                  size="small"
                  variant="filled"
                  sx={{ height: 22, fontSize: "0.7rem" }}
                />

                <Stack direction="row" spacing={0.75} alignItems="center">
                  {notification.priorityScore ? (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.disabled",
                        fontSize: "0.68rem",
                        display: { xs: "none", sm: "block" },
                      }}
                    >
                      #{Math.floor(notification.priorityScore / 1e12) === 3
                        ? "P1"
                        : Math.floor(notification.priorityScore / 1e12) === 2
                        ? "P2"
                        : "P3"}
                    </Typography>
                  ) : null}

                  {isNew ? (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <FiberManualRecordIcon
                        sx={{ fontSize: 8, color: "primary.main" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.72rem" }}
                      >
                        New
                      </Typography>
                    </Stack>
                  ) : null}
                </Stack>
              </Stack>

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: isNew ? "text.primary" : "text.secondary",
                  lineHeight: 1.3,
                  mb: 0.5,
                  textTransform: "capitalize",
                }}
              >
                {notification.Message}
              </Typography>

              <Typography
                variant="caption"
                sx={{ color: "text.disabled", fontSize: "0.75rem" }}
              >
                {formatTimestamp(notification.Timestamp)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
