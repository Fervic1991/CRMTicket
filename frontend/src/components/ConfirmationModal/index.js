import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
	dialogPaper: {
		borderRadius: 18,
		background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(246,248,255,0.98))",
		border: "1px solid rgba(120,130,160,0.18)",
		boxShadow: "0 24px 60px rgba(31, 45, 61, 0.18)",
	},
	dialogTitle: {
		fontWeight: 700,
		letterSpacing: 0.2,
	},
	dialogContent: {
		paddingTop: theme.spacing(2),
		paddingBottom: theme.spacing(2),
	},
	dialogActions: {
		padding: theme.spacing(2, 3),
		gap: theme.spacing(1.5),
	},
	cancelButton: {
		borderRadius: 12,
		textTransform: "none",
		fontWeight: 600,
		background: "rgba(255,255,255,0.9)",
		border: "1px solid rgba(120,130,160,0.2)",
	},
	confirmButton: {
		borderRadius: 12,
		textTransform: "none",
		fontWeight: 600,
		boxShadow: "0 14px 28px rgba(233,30,99,0.24)",
	},
}));

const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
	const classes = useStyles();
	return (
		<Dialog
			open={open}
			onClose={() => onClose(false)}
			aria-labelledby="confirm-dialog"
			classes={{ paper: classes.dialogPaper }}
		>
			<DialogTitle id="confirm-dialog" className={classes.dialogTitle}>
				{title}
			</DialogTitle>
			<DialogContent dividers className={classes.dialogContent}>
				<Typography>{children}</Typography>
			</DialogContent>
			<DialogActions className={classes.dialogActions}>
				<Button
					variant="contained"
					onClick={() => onClose(false)}
					color="default"
					className={classes.cancelButton}
				>
					{i18n.t("confirmationModal.buttons.cancel")}
				</Button>
				<Button
					variant="contained"
					onClick={() => {
						onClose(false);
						onConfirm();
					}}
					color="secondary"
					className={classes.confirmButton}
				>
					{i18n.t("confirmationModal.buttons.confirm")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmationModal;
