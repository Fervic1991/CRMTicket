import React, { useState, useContext } from "react";
import { i18n } from "../../translate/i18n";
import { 
    Avatar, 
    CardHeader, 
    Grid,
    Dialog,
    DialogContent,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
    // Estilos para o modal da imagem
    imageModal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    imageModalContent: {
        outline: "none",
        maxWidth: "90vw",
        maxHeight: "90vh",
    },
    expandedImage: {
        width: "100%",
        height: "auto",
        maxWidth: "500px",
        borderRadius: theme.spacing(1),
    },
    clickableAvatar: {
        cursor: "pointer",
        "&:hover": {
            opacity: 0.8,
        },
    },
    statusPill: {
        padding: "6px 14px",
        borderRadius: 999,
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        border: "1px solid rgba(148, 163, 184, 0.5)",
        background: "rgba(255, 255, 255, 0.7)",
        color: "rgba(15, 23, 42, 0.8)",
        boxShadow: "0 6px 14px rgba(15, 23, 42, 0.08)",
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(0.5),
    },
    headerTitle: {
        fontWeight: 700,
        color: "rgba(15, 23, 42, 0.9)",
    },
    headerSub: {
        color: "rgba(71, 85, 105, 0.85)",
    }
}));

const TicketInfo = ({ contact, ticket, onClick }) => {
    const classes = useStyles();
    const [amount, setAmount] = useState("");
    const { user } = useContext(AuthContext);
    const [imageModalOpen, setImageModalOpen] = useState(false); // Estado para o modal da imagem

    // Função para abrir modal da imagem
    const handleImageClick = (e) => {
        e.stopPropagation(); // Prevenir que o clique no avatar execute outros handlers
        if (contact?.urlPicture) {
            setImageModalOpen(true);
        }
    };

    // Função para fechar modal da imagem
    const handleImageModalClose = () => {
        setImageModalOpen(false);
    };

    const renderCardReader = () => {
        const statusConfig = {
            open: {
                label: i18n.t("tickets.status.open"),
                color: "#1d4ed8",
                background: "rgba(59, 130, 246, 0.16)",
                border: "rgba(59, 130, 246, 0.45)",
            },
            pending: {
                label: i18n.t("tickets.status.pending"),
                color: "#b45309",
                background: "rgba(245, 158, 11, 0.18)",
                border: "rgba(245, 158, 11, 0.45)",
            },
            group: {
                label: i18n.t("tickets.status.group"),
                color: "#7c3aed",
                background: "rgba(139, 92, 246, 0.16)",
                border: "rgba(139, 92, 246, 0.45)",
            },
            closed: {
                label: i18n.t("tickets.status.closed"),
                color: "#0f766e",
                background: "rgba(20, 184, 166, 0.16)",
                border: "rgba(20, 184, 166, 0.45)",
            },
        };

        const statusKey = ticket?.status || "open";
        const statusStyle = statusConfig[statusKey] || statusConfig.open;

        return (
            <CardHeader
                onClick={onClick}
                style={{ cursor: "pointer" }}
                titleTypographyProps={{ noWrap: true, className: classes.headerTitle }}
                subheaderTypographyProps={{ noWrap: true, className: classes.headerSub }}
                avatar={
                    <Avatar 
                        src={contact?.urlPicture} 
                        alt="contact_image" 
                        className={classes.clickableAvatar}
                        onClick={handleImageClick}
                    />
                }
                title={`${contact?.name || '(sem contato)'} #${ticket?.id}`}
                subheader={[
                    ticket?.user && `${i18n.t("messagesList.header.assignedTo")} ${ticket?.user?.name}`,
                    contact?.contactWallets && contact.contactWallets.length > 0
                        ? `• ${i18n.t("wallets.wallet")}: ${contact.contactWallets[0].wallet?.name || 'N/A'}`
                        : null
                ].filter(Boolean).join(' ')}
                action={
                    <div
                        className={classes.statusPill}
                        style={{
                            color: statusStyle.color,
                            background: statusStyle.background,
                            borderColor: statusStyle.border,
                        }}
                    >
                        {statusStyle.label}
                    </div>
                }
            />
        );
    }

    const handleChange = (event) => {
        const value = event.target.value;
        setAmount(value);
    }

    return (
        <React.Fragment>
            <Grid container alignItems="center" spacing={10}>
                {/* Conteúdo do contato à esquerda */}
                <Grid item xs={6}>
                    {renderCardReader()}
                </Grid>
            </Grid>

            {/* Modal da Imagem */}
            <Dialog
                open={imageModalOpen}
                onClose={handleImageModalClose}
                className={classes.imageModal}
                maxWidth="md"
                fullWidth
            >
                <DialogContent className={classes.imageModalContent}>
                    <img 
                        src={contact?.urlPicture} 
                        alt={contact?.name || "Foto do contato"}
                        className={classes.expandedImage}
                    />
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
};

export default TicketInfo;
