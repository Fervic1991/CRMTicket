import React, { memo } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles(theme => ({
	mainContainer: {
		flex: 1,
		padding: theme.appTokens?.spacing?.lg || theme.spacing(2),
		height: `calc(100% - 48px)`,
		background: theme.appTokens?.colors?.surfaceAlt,
	},

	contentWrapper: {
		height: "100%",
		overflowY: "hidden",
		display: "flex",
		flexDirection: "column",
		borderRadius: theme.appTokens?.radius?.lg || theme.shape.borderRadius,
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
