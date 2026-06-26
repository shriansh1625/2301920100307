import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Log } from "logging-middleware";

const filters = ["All", "Placement", "Result", "Event"];

export function NotificationFilter({ value = "All", onChange }) {
  async function handleChange(_, newFilter) {
    if (!newFilter) {
      return;
    }

    onChange(newFilter);
    await Log("frontend", "debug", "component", "notification filter changed");
  }

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      size="small"
      sx={{ flexWrap: "wrap", gap: 0.5 }}
    >
      {filters.map((type) => (
        <ToggleButton key={type} value={type} sx={{ textTransform: "none", px: 2 }}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
