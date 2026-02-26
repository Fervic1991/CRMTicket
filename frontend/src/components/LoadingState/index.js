import React from "react";
import { Box, CircularProgress, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    gap: theme.appTokens?.spacing?.sm || theme.spacing(1.5),
    padding: theme.appTokens?.spacing?.md || theme.spacing(2),
    borderRadius: theme.appTokens?.radius?.md || theme.shape.borderRadius,
    background: theme.appTokens?.glass?.background,
    backdropFilter: theme.appTokens?.glass?.blur,
    border: theme.appTokens?.glass?.border,
  },
  text: {
    color: theme.appTokens?.colors?.textMuted || theme.palette.text.secondary,
    fontWeight: 500,
  },
}));

const LoadingState = ({ label = "Carregando..." }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <CircularProgress size={20} thickness={5} />
      <Typography variant="body2" className={classes.text}>
        {label}
      </Typography>
    </Box>
  );
};

export default LoadingState;
