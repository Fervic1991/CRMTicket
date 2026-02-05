import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManagerTabs from "../../components/TicketsManagerTabs";
import Ticket from "../../components/Ticket";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	chatContainer: {
		flex: 1,
		background: "radial-gradient(1200px 600px at 10% -10%, rgba(30, 136, 229, 0.18), transparent 55%), radial-gradient(900px 500px at 110% 10%, rgba(67, 160, 71, 0.16), transparent 60%), linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.98))",
		fontFamily: "'Poppins', sans-serif",
		padding: theme.padding,
		height: `calc(100% - 48px)`,
		overflowY: "hidden",
		"--tickets-panel-bg": "rgba(255, 255, 255, 0.78)",
		"--tickets-panel-border": "rgba(148, 163, 184, 0.35)",
		"--tickets-panel-shadow": "0 12px 30px rgba(15, 23, 42, 0.08)",
		"--tickets-accent": theme.palette.primary.main,
		"--tickets-muted": "rgba(71, 85, 105, 0.7)",
	},

	chatPapper: {
		display: "flex",
		height: "100%",
		background: "var(--tickets-panel-bg)",
		border: "1px solid var(--tickets-panel-border)",
		boxShadow: "var(--tickets-panel-shadow)",
		borderRadius: 18,
		backdropFilter: "blur(10px)",
		overflow: "hidden",
	},

	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflowY: "hidden",
		borderRight: "1px solid var(--tickets-panel-border)",
	},
	messagessWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
	},
	welcomeMsg: {
		background: "linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(226, 232, 240, 0.9))",
		display: "flex",
		justifyContent: "space-evenly",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
		color: "var(--tickets-muted)",
		fontSize: "1.05rem",
	},
	logo: {
		logo: theme.logo,
		content: "url(" + ((theme.appLogoLight || theme.appLogoDark) ? getBackendUrl() + "/public/" + (theme.mode === "light" ? theme.appLogoLight || theme.appLogoDark : theme.appLogoDark || theme.appLogoLight) : (theme.mode === "light" ? logo : logoDark)) + ")"
	},
}));

const Chat = () => {
	const classes = useStyles();
	const { ticketId } = useParams();

	return (
		<div className={classes.chatContainer}>
			<div className={classes.chatPapper}>
				<Grid container spacing={0}>
					<Grid item xs={4} className={classes.contactsWrapper}>
						<TicketsManagerTabs />
					</Grid>
					<Grid item xs={8} className={classes.messagessWrapper}>
						{ticketId ? (
							<>
								<Ticket />
							</>
						) : (
							<Paper square variant="outlined" className={classes.welcomeMsg}>
								<span>
									<center>
										<img className={classes.logo} width="50%" alt="" />
									</center>
									{i18n.t("chat.noTicketMessage")}
								</span>
							</Paper>
						)}
					</Grid>
				</Grid>
			</div>
		</div>
	);
};

export default Chat;
