import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: theme.appTokens?.radius?.lg || theme.shape.borderRadius,
    border: `1px dashed ${theme.appTokens?.colors?.border || theme.palette.divider}`,
    background: theme.appTokens?.glass?.background,
    backdropFilter: theme.appTokens?.glass?.blur,
    padding: theme.appTokens?.spacing?.lg || theme.spacing(3),
    textAlign: "center",
  },
  title: {
    fontWeight: 600,
    color: theme.appTokens?.colors?.text || theme.palette.text.primary,
  },
  subtitle: {
    marginTop: theme.spacing(1),
    color: theme.appTokens?.colors?.textMuted || theme.palette.text.secondary,
  },
}));

const EmptyState = ({ title, subtitle, action }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Typography variant="h6" className={classes.title}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="body2" className={classes.subtitle}>
          {subtitle}
        </Typography>
      ) : null}
      {action ? <Box mt={2}>{action}</Box> : null}
    </Box>
  );
};

export default EmptyState;
