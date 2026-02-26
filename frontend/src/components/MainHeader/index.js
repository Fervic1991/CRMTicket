import React from "react";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	contactsHeader: {
		display: "flex",
		alignItems: "center",
		padding: `${theme.appTokens?.spacing?.xs || 6}px ${theme.appTokens?.spacing?.sm || 10}px`,
		borderRadius: theme.appTokens?.radius?.lg || theme.shape.borderRadius,
		background: theme.appTokens?.glass?.background,
		backdropFilter: theme.appTokens?.glass?.blur,
		border: theme.appTokens?.glass?.border,
		boxShadow: theme.appTokens?.glass?.shadow,
	},
}));

const MainHeader = ({ children }) => {
	const classes = useStyles();

	return <div className={classes.contactsHeader}>{children}</div>;
};

export default MainHeader;
