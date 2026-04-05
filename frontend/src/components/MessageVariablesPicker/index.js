import React from "react";
import { Chip, makeStyles, Typography } from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    background: "#F8FAFC",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1E293B",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  helper: {
    fontSize: 12,
    lineHeight: 1.5,
    color: "#64748B",
  },
  scrollRow: {
    display: "flex",
    gap: theme.spacing(1),
    overflowX: "auto",
    paddingBottom: 2,
    '&::-webkit-scrollbar': {
      height: 6,
    },
    '&::-webkit-scrollbar-thumb': {
      background: "rgba(148,163,184,0.35)",
      borderRadius: 999,
    },
  },
  chip: {
    cursor: "pointer",
    borderRadius: 999,
    background: "#EFF6FF",
    color: "#2563EB",
    fontWeight: 600,
    border: "1px solid rgba(37,99,235,0.12)",
    boxShadow: "none",
    '& .MuiChip-label': {
      paddingLeft: 10,
      paddingRight: 10,
    },
    '&:hover': {
      background: "#DBEAFE",
    },
  },
}));

const MessageVariablesPicker = ({ onClick, disabled }) => {
  const classes = useStyles();

  const handleClick = (e, value) => {
    e.preventDefault();
    if (disabled) return;
    onClick(value);
  };

  const msgVars = [
    { name: i18n.t("messageVariablesPicker.vars.contactFirstName"), value: "{{firstName}}" },
    { name: i18n.t("messageVariablesPicker.vars.contactName"), value: "{{name}} " },
    { name: i18n.t("messageVariablesPicker.vars.user"), value: "{{userName}} " },
    { name: i18n.t("messageVariablesPicker.vars.greeting"), value: "{{ms}} " },
    { name: i18n.t("messageVariablesPicker.vars.protocolNumber"), value: "{{protocol}} " },
    { name: i18n.t("messageVariablesPicker.vars.date"), value: "{{date}} " },
    { name: i18n.t("messageVariablesPicker.vars.hour"), value: "{{hour}} " },
    { name: i18n.t("messageVariablesPicker.vars.ticket_id"), value: "{{ticket_id}} " },
    { name: i18n.t("messageVariablesPicker.vars.queue"), value: "{{queue}} " },
    { name: i18n.t("messageVariablesPicker.vars.connection"), value: "{{connection}} " },
  ];

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography className={classes.title}>
          {i18n.t("scheduleModal.variables.title")}
        </Typography>
        <Typography className={classes.helper}>
          {i18n.t("scheduleModal.variables.helper")}
        </Typography>
      </div>
      <div className={classes.scrollRow}>
        {msgVars.map(msgVar => (
          <Chip
            key={msgVar.value}
            onMouseDown={e => handleClick(e, msgVar.value)}
            label={msgVar.name}
            size="small"
            className={classes.chip}
            clickable
          />
        ))}
      </div>
    </div>
  );
};

export default MessageVariablesPicker;
