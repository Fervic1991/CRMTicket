import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import ContactImport from "../../components/ContactImport";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

const useStyles = makeStyles(theme => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(2),
        borderRadius: 16,
        overflowY: "scroll",
        background: "rgba(255, 255, 255, 0.78)",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        boxShadow: "0 14px 28px rgba(15, 23, 42, 0.08)",
        backdropFilter: "blur(10px)",
        ...theme.scrollbarStylesSoftBig
    },
}));

const ContactImportPage = () => {
    const classes = useStyles();
    return <MainContainer className={classes.mainContainer}>
        <MainHeader>
            <Title>Importar contatos de arquivo</Title>
        </MainHeader>
        <Paper
            className={classes.mainPaper}
            variant="outlined">
            <ContactImport />
        </Paper>
    </MainContainer>
}

export default ContactImportPage;
