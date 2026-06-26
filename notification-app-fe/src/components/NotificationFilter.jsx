import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { appLog } from "../utils/appLog.js";

const FILTERS = [
  { label: "All", value: "All" },
  { label: "Placement", value: "Placement" },
  { label: "Result", value: "Result" },
  { label: "Event", value: "Event" },
];

export function NotificationFilter({ value = "All", onChange }) {
  async function handleChange(_, newFilter) {
    if (!newFilter) return;
    onChange(newFilter);
    appLog("frontend", "debug", "component", "notification filter changed");
  }

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      size="small"
      sx={{ flexWrap: "wrap", gap: 0.75 }}
    >
      {FILTERS.map((f) => (
        <ToggleButton
          key={f.value}
          value={f.value}
          sx={{ px: 2.5, py: 0.75, lineHeight: 1.5 }}
        >
          {f.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
