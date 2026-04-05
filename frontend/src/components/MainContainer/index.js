import React, { memo } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles(theme => ({
	mainContainer: {
		flex: 1,
		padding: theme.appTokens?.spacing?.lg || theme.spacing(2),
		height: `calc(100% - 48px)`,
		background: theme.appTokens?.isLight
			? theme.appTokens?.colors?.surfaceAlt
			: "radial-gradient(1200px 680px at 0% 0%, rgba(56,189,248,0.08), transparent 55%), linear-gradient(180deg, rgba(15,23,42,0.92), rgba(17,28,49,0.96))",
	},

	contentWrapper: {
		height: "100%",
		overflowY: "hidden",
		display: "flex",
		flexDirection: "column",
		borderRadius: theme.appTokens?.radius?.lg || theme.shape.borderRadius,
		background: theme.appTokens?.isLight
			? "transparent"
			: "linear-gradient(180deg, rgba(22,32,51,0.52), rgba(15,23,42,0.38))",
	},
}));

const MainContainer = memo(({ children }) => {
	const classes = useStyles();

	return (
		<Container className={classes.mainContainer}>
			<div className={classes.contentWrapper}>{children}</div>
		</Container>
	);
});

export default MainContainer;
