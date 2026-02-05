import React, { useEffect } from "react";

import { Card, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles(theme => ({
	ticketHeader: {
		display: "flex",
		background: "linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(14, 116, 144, 0.16) 45%, rgba(16, 185, 129, 0.16) 100%)",
		flex: "none",
		borderBottom: "1px solid rgba(148, 163, 184, 0.35)",
		height: "70px",
		backdropFilter: "blur(8px)",
		boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
		alignItems: "center",
		padding: theme.spacing(0, 1),
		[theme.breakpoints.down("sm")]: {
			flexWrap: "wrap",
			height: "max-content",
			paddingBottom: theme.spacing(0.5),
		},
	},
	backButton: {
		minWidth: 40,
		height: 40,
		borderRadius: 12,
		border: "1px solid rgba(148, 163, 184, 0.5)",
		background: "rgba(255, 255, 255, 0.65)",
		boxShadow: "0 6px 14px rgba(15, 23, 42, 0.08)",
		marginRight: theme.spacing(1),
		"&:hover": {
			background: "rgba(248, 250, 252, 0.95)",
			borderColor: "rgba(59, 130, 246, 0.5)",
		},
	},
	headerDivider: {
		width: 1,
		height: 32,
		background: "rgba(148, 163, 184, 0.5)",
		marginRight: theme.spacing(1.5),
		[theme.breakpoints.down("sm")]: {
			display: "none",
		},
	},
}));

const TicketHeader = ({ loading, children }) => {
	const classes = useStyles();
	const history = useHistory();

	const handleBack = () => {

		history.push("/tickets");
	};

	// useEffect(() => {
	// 	const handleKeyDown = (event) => {
	// 		if (event.key === "Escape") {
	// 			handleBack();
	// 		}
	// 	};
	// 	document.addEventListener("keydown", handleKeyDown);
	// 	return () => {
	// 		document.removeEventListener("keydown", handleKeyDown);
	// 	};
	// }, [history]);

	return (
		<>
			{loading ? (
				<TicketHeaderSkeleton />
			) : (
				<Card
					square
					className={classes.ticketHeader}
				>
					<Button className={classes.backButton} onClick={handleBack}>
						<ArrowBackIos />
					</Button>
					<div className={classes.headerDivider} />
					{children}
				</Card>
			)}
		</>
	);
};

export default TicketHeader;
