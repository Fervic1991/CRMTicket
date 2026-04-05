import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import { green, grey } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { List, Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { v4 as uuidv4 } from "uuid";

import GroupIcon from "@material-ui/icons/Group";
import ContactTag from "../ContactTag";
import ConnectionIcon from "../ConnectionIcon";
import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import ShowTicketOpen from "../ShowTicketOpenModal";
import FinalizacaoVendaModal from "../FinalizacaoVendaModal";
import { isNil } from "lodash";
import { toast } from "react-toastify";
import { Done, HighlightOff, Replay, SwapHoriz } from "@material-ui/icons";
import VisibilityIcon from "@material-ui/icons/Visibility"; // Ícone de spy
import useCompanySettings from "../../hooks/useSettings/companySettings";
import {
  Avatar,
  Badge,
  ListItemAvatar,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  DialogContent,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
    margin: theme.spacing(0, 0, 0.5),
    padding: theme.spacing(1.25, 1.5),
    borderRadius: 16,
    alignItems: "flex-start",
    background: theme.palette.mode === "dark" ? "rgba(15, 23, 42, 0.82)" : "#FFFFFF",
    border: "1px solid transparent",
    borderBottom: "1px solid #F1F5F9",
    boxShadow: "none",
    transition: "background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
    "&:hover": {
      background: theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.88)" : "#F8FAFC",
    },
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 10,
      bottom: 10,
      width: 0,
      borderRadius: 999,
      background: "#2563EB",
      transition: "width 0.2s ease",
    },
    "&$selectedTicket": {
      background: theme.palette.mode === "dark" ? "rgba(30, 64, 175, 0.14)" : "#EFF6FF",
      boxShadow: "inset 0 0 0 1px rgba(37, 99, 235, 0.08)",
    },
    "&$selectedTicket::before": {
      width: 4,
    },
    "&:hover $hoverActions": {
      opacity: 1,
      pointerEvents: "auto",
      transform: "translateY(0)",
    },
  },
  selectedTicket: {},

  pendingTicket: {
    cursor: "unset",
    borderColor: "rgba(245, 158, 11, 0.28)",
  },
  queueTag: {
    background: "#F8FAFC",
    color: "#334155",
    marginRight: 6,
    padding: "4px 10px",
    fontWeight: 700,
    borderRadius: 20,
    fontSize: "0.66rem",
    whiteSpace: "nowrap",
    border: "1px solid rgba(226, 232, 240, 0.95)",
  },
  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  newMessagesCount: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: 0,
    color: "#047857",
    fontWeight: 700,
    marginRight: "10px",
    borderRadius: 999,
  },
  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  connectionTag: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
    color: "#334155",
    marginRight: 6,
    marginTop: 6,
    padding: "0 10px",
    fontWeight: 700,
    borderRadius: 20,
    fontSize: "0.66rem",
    letterSpacing: "0.01em",
    boxShadow: "none",
    border: "1px solid rgba(226, 232, 240, 0.95)",
  },
  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(1),
    marginLeft: theme.spacing(1),
    fontWeight: "bold",
    color: theme.mode === "light" ? "#0F172A" : "#F8FAFC",
  },

  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: -4,
    marginRight: "1px",
    color: theme.mode === "light" ? "#64748B" : grey[400],
    fontWeight: 600,
  },

  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: -4,
    color: "#0F766E",
    fontWeight: 700,
    marginRight: "1px",
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
    paddingRight: "0%",
    marginLeft: theme.spacing(1),
    color: theme.mode === "light" ? "#334155" : grey[400],
  },

  contactLastMessageUnread: {
    paddingRight: 20,
    fontWeight: 700,
    color: theme.mode === "light" ? "#0F172A" : grey[400],
    width: "50%",
  },

  badgeStyle: {
    color: "#064E3B",
    backgroundColor: "#D1FAE5",
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    fontWeight: 700,
    boxShadow: "0 6px 14px rgba(16, 185, 129, 0.18)",
  },

  acceptButton: {
    position: "absolute",
    right: "1px",
  },

  ticketQueueColor: {
    flex: "none",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
  },

  ticketInfo: {
    position: "relative",
    top: -13,
  },
  secondaryContentSecond: {
    display: "flex",
    alignItems: "flex-start",
    flexWrap: "nowrap",
    flexDirection: "row",
    alignContent: "flex-start",
  },
  secondaryContentSecond1: {
    display: "flex",
    alignItems: "flex-start",
    flexWrap: "nowrap",
    flexDirection: "row",
    alignContent: "flex-start",
  },
  ticketInfo1: {
    position: "relative",
    top: 13,
    right: 0,
  },
  headerIdentity: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    minWidth: 0,
  },
  statusDot: {
    width: 12,
    height: 12,
    minWidth: 12,
    borderRadius: "50%",
    boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.7)",
  },
  titleText: {
    fontWeight: 700,
    color: theme.palette.mode === "dark" ? "#F8FAFC" : "#0F172A",
    letterSpacing: "-0.01em",
  },
  metaWrap: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  sideActions: {
    top: 14,
    right: 14,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
  },
  sideTools: {
    top: "auto",
    right: 14,
    bottom: 12,
  },
  quickActionRail: {
    top: "auto",
    right: 52,
    bottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  hoverActions: {
    opacity: 1,
    pointerEvents: "auto",
    transform: "translateY(0)",
    transition: "opacity 0.18s ease, transform 0.18s ease",
  },
  quickActionButton: {
    minWidth: 30,
    width: 30,
    height: 30,
    padding: 0,
    borderRadius: 10,
    border: "1px solid rgba(203, 213, 225, 0.9)",
    background: "rgba(255,255,255,0.92)",
    color: "#475569",
    boxShadow: "0 8px 16px rgba(15, 23, 42, 0.08)",
    transition: "all 0.18s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 12px 20px rgba(15, 23, 42, 0.12)",
      background: "#FFFFFF",
    },
    "& .MuiSvgIcon-root": {
      fontSize: 16,
    },
  },
  acceptQuickAction: {
    color: "#047857",
    "&:hover": {
      borderColor: "rgba(16, 185, 129, 0.45)",
      background: "rgba(236, 253, 245, 0.95)",
    },
  },
  transferQuickAction: {
    color: "#1D4ED8",
    "&:hover": {
      borderColor: "rgba(59, 130, 246, 0.45)",
      background: "rgba(239, 246, 255, 0.95)",
    },
  },
  closeQuickAction: {
    color: "#DC2626",
    "&:hover": {
      borderColor: "rgba(239, 68, 68, 0.45)",
      background: "rgba(254, 242, 242, 0.96)",
    },
  },
  spyQuickAction: {
    color: "#7C3AED",
    "&:hover": {
      borderColor: "rgba(139, 92, 246, 0.45)",
      background: "rgba(245, 243, 255, 0.96)",
    },
  },
  reopenQuickAction: {
    color: "#0F766E",
    "&:hover": {
      borderColor: "rgba(20, 184, 166, 0.45)",
      background: "rgba(240, 253, 250, 0.96)",
    },
  },
  Radiusdot: {
    "& .MuiBadge-badge": {
      borderRadius: 2,
      position: "inherit",
      height: 16,
      margin: 2,
      padding: 3,
    },
    "& .MuiBadge-anchorOriginTopRightRectangle": {
      transform: "scale(1) translate(0%, -40%)",
    },
  },
  connectionIcon: {
    marginRight: theme.spacing(1),
  },

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
}));

const TicketListItemCustom = ({ setTabOpen, ticket }) => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [
    acceptTicketWithouSelectQueueOpen,
    setAcceptTicketWithouSelectQueueOpen,
  ] = useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);

  const [openAlert, setOpenAlert] = useState(false);
  const [userTicketOpen, setUserTicketOpen] = useState("");
  const [queueTicketOpen, setQueueTicketOpen] = useState("");

  // Estados para o modal de finalização de venda
  const [openFinalizacaoVenda, setOpenFinalizacaoVenda] = useState(false);
  const [finalizacaoTipo, setFinalizacaoTipo] = useState(null);
  const [ticketDataToFinalize, setTicketDataToFinalize] = useState(null);
  const [showFinalizacaoOptions, setShowFinalizacaoOptions] = useState(false);

  const [imageModalOpen, setImageModalOpen] = useState(false); // Estado para o modal da imagem

  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);

  const { get: getSetting } = useCompanySettings();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Função para abrir modal da imagem
  const handleImageClick = (e) => {
    e.stopPropagation(); // Prevenir que o clique no avatar selecione o ticket
    if (ticket?.contact?.urlPicture) {
      setImageModalOpen(true);
    }
  };

  // Função para fechar modal da imagem
  const handleImageModalClose = () => {
    setImageModalOpen(false);
  };

  const handleOpenAcceptTicketWithouSelectQueue = useCallback(() => {
    setAcceptTicketWithouSelectQueueOpen(true);
  }, []);

  const handleCloseTicket = async (id) => {
    // Verificar se a finalização com valor de venda está ativa
    if (
      user.finalizacaoComValorVendaAtiva === true ||
      user.finalizacaoComValorVendaAtiva === "true"
    ) {
      // Se estiver ativa, abrir o modal de finalização de venda
      setFinalizacaoTipo("comDespedida");
      setOpenFinalizacaoVenda(true);
      handleSelectTicket(ticket);
      history.push(`/tickets/${ticket.uuid}`);
    } else {
      // Comportamento original
      const setting = await getSetting({
        column: "requiredTag",
      });

      if (setting.requiredTag === "enabled") {
        //verificar se tem uma tag
        try {
          const contactTags = await api.get(
            `/contactTags/${ticket.contact.id}`
          );
          if (!contactTags.data.tags) {
            toast.warning(i18n.t("messagesList.header.buttons.requiredTag"));
          } else {
            await api.put(`/tickets/${id}`, {
              status: "closed",
              userId: user?.id || null,
            });

            if (isMounted.current) {
              setLoading(false);
            }

            history.push(`/tickets/`);
          }
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      } else {
        setLoading(true);
        try {
          await api.put(`/tickets/${id}`, {
            status: "closed",
            userId: user?.id || null,
          });
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
        if (isMounted.current) {
          setLoading(false);
        }

        history.push(`/tickets/`);
      }
    }
  };

  const handleCloseIgnoreTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        userId: user?.id || null,
        sendFarewellMessage: false,
        amountUsedBotQueues: 0,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }

    history.push(`/tickets/`);
  };

  const truncate = (str, len) => {
    if (!isNil(str)) {
      if (str.length > len) {
        return str.substring(0, len) + "...";
      }
      return str;
    }
  };

  const handleCloseTransferTicketModal = useCallback(() => {
    if (isMounted.current) {
      setTransferTicketModalOpen(false);
    }
  }, []);

  const handleOpenTransferModal = () => {
    setLoading(true);
    setTransferTicketModalOpen(true);
    if (isMounted.current) {
      setLoading(false);
    }
    handleSelectTicket(ticket);
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      const otherTicket = await api.put(`/tickets/${id}`, {
        status:
          ticket.isGroup && ticket.channel === "whatsapp" ? "group" : "open",
        userId: user?.id,
      });

      if (otherTicket.data.id !== ticket.id) {
        if (otherTicket.data.userId !== user?.id) {
          setOpenAlert(true);
          setUserTicketOpen(otherTicket.data.user.name);
          setQueueTicketOpen(otherTicket.data.queue.name);
        } else {
          setLoading(false);
          setTabOpen(ticket.isGroup ? "group" : "open");
          handleSelectTicket(otherTicket.data);
          history.push(`/tickets/${otherTicket.uuid}`);
        }
      } else {
        let setting;

        try {
          setting = await getSetting({
            column: "sendGreetingAccepted",
          });
        } catch (err) {
          toastError(err);
        }

        if (
          setting.sendGreetingAccepted === "enabled" &&
          (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled")
        ) {
          handleSendMessage(ticket.id);
        }
        if (isMounted.current) {
          setLoading(false);
        }

        setTabOpen(ticket.isGroup ? "group" : "open");
        handleSelectTicket(ticket);
        history.push(`/tickets/${ticket.uuid}`);
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleSendMessage = async (id) => {
    let setting;

    try {
      setting = await getSetting({
        column: "greetingAcceptedMessage",
      });
    } catch (err) {
      toastError(err);
    }
    if (!setting.greetingAcceptedMessage) {
      toast.warning(
        i18n.t("messagesList.header.buttons.greetingAcceptedMessage")
      );
      return;
    }
    const msg = `${setting.greetingAcceptedMessage}`;
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: `${msg.trim()}`,
    };
    try {
      await api.post(`/messages/${id}`, message);
    } catch (err) {
      toastError(err);
    }
  };

  const handleCloseAlert = useCallback(() => {
    setOpenAlert(false);
    setLoading(false);
  }, []);

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const handleUpdateTicketStatusWithData = async (
    ticketData,
    sendFarewellMessage,
    finalizacaoMessage
  ) => {
    try {
      await api.put(`/tickets/${ticket.id}`, {
        ...ticketData,
        sendFarewellMessage,
        finalizacaoMessage,
      });
      toast.success("Ticket finalizado com sucesso!");
      history.push(`/tickets/`);
    } catch (err) {
      toastError(err);
    }
  };

  // Função para espionar ticket chatbot
  const handleSpyTicket = () => {
    handleSelectTicket(ticket);
    history.push(`/tickets/${ticket.uuid}`);
  };

  const renderQuickActions = () => {
    if (ticket.status === "chatbot") {
      return (
        <Tooltip title="Apri conversazione chatbot">
          <ButtonWithSpinner
            variant="contained"
            className={`${classes.quickActionButton} ${classes.spyQuickAction}`}
            size="small"
            loading={loading}
            onClick={(e) => {
              e.stopPropagation();
              handleSpyTicket();
            }}
          >
            <VisibilityIcon />
          </ButtonWithSpinner>
        </Tooltip>
      );
    }

    return (
      <>
        {ticket.status === "pending" &&
          (ticket.queueId === null || ticket.queueId === undefined) && (
            <Tooltip title={i18n.t("ticketsList.buttons.accept")}>
              <ButtonWithSpinner
                variant="contained"
                className={`${classes.quickActionButton} ${classes.acceptQuickAction}`}
                size="small"
                loading={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAcceptTicketWithouSelectQueue();
                }}
              >
                <Done />
              </ButtonWithSpinner>
            </Tooltip>
          )}

        {ticket.status === "pending" && ticket.queueId !== null && (
          <Tooltip title={i18n.t("ticketsList.buttons.accept")}>
            <ButtonWithSpinner
              variant="contained"
              className={`${classes.quickActionButton} ${classes.acceptQuickAction}`}
              size="small"
              loading={loading}
              onClick={(e) => {
                e.stopPropagation();
                handleAcepptTicket(ticket.id);
              }}
            >
              <Done />
            </ButtonWithSpinner>
          </Tooltip>
        )}

        {(ticket.status === "pending" ||
          ticket.status === "open" ||
          ticket.status === "group") && (
          <Tooltip title={i18n.t("ticketsList.buttons.transfer")}>
            <ButtonWithSpinner
              variant="contained"
              className={`${classes.quickActionButton} ${classes.transferQuickAction}`}
              size="small"
              loading={loading}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenTransferModal();
              }}
            >
              <SwapHoriz />
            </ButtonWithSpinner>
          </Tooltip>
        )}

        {(ticket.status === "open" || ticket.status === "group") && (
          <Tooltip title={i18n.t("ticketsList.buttons.closed")}>
            <ButtonWithSpinner
              variant="contained"
              className={`${classes.quickActionButton} ${classes.closeQuickAction}`}
              size="small"
              loading={loading}
              onClick={(e) => {
                e.stopPropagation();
                handleCloseTicket(ticket.id);
              }}
            >
              <HighlightOff />
            </ButtonWithSpinner>
          </Tooltip>
        )}

        {(ticket.status === "pending" || ticket.status === "lgpd") &&
          (user.userClosePendingTicket === "enabled" ||
            user.profile === "admin") && (
            <Tooltip title={i18n.t("ticketsList.buttons.ignore")}>
              <ButtonWithSpinner
                variant="contained"
                className={`${classes.quickActionButton} ${classes.closeQuickAction}`}
                size="small"
                loading={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseIgnoreTicket(ticket.id);
                }}
              >
                <HighlightOff />
              </ButtonWithSpinner>
            </Tooltip>
          )}

        {ticket.status === "closed" &&
          (ticket.queueId === null || ticket.queueId === undefined) && (
            <Tooltip title={i18n.t("ticketsList.buttons.reopen")}>
              <ButtonWithSpinner
                variant="contained"
                className={`${classes.quickActionButton} ${classes.reopenQuickAction}`}
                size="small"
                loading={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAcceptTicketWithouSelectQueue();
                }}
              >
                <Replay />
              </ButtonWithSpinner>
            </Tooltip>
          )}

        {ticket.status === "closed" && ticket.queueId !== null && (
          <Tooltip title={i18n.t("ticketsList.buttons.reopen")}>
            <ButtonWithSpinner
              variant="contained"
              className={`${classes.quickActionButton} ${classes.reopenQuickAction}`}
              size="small"
              loading={loading}
              onClick={(e) => {
                e.stopPropagation();
                handleAcepptTicket(ticket.id);
              }}
            >
              <Replay />
            </ButtonWithSpinner>
          </Tooltip>
        )}
      </>
    );
  };

  // Lógica de permissão para mensagens pending - MOVIDA PARA DEPOIS DE TODAS AS FUNÇÕES
  const shouldBlurMessages = ticket.status === "pending" && user?.allowSeeMessagesInPendingTickets === "disabled";

  const statusConfig = {
    open: { label: i18n.t("tickets.tabs.open") || "Aperto", color: "#6EE7B7" },
    pending: { label: i18n.t("tickets.tabs.pending") || "In attesa", color: "#FBBF24" },
    group: { label: i18n.t("tickets.tabs.group") || "Gruppo", color: "#93C5FD" },
    closed: { label: i18n.t("tickets.tabs.closed") || "Chiuso", color: "#CBD5E1" },
    chatbot: { label: "Bot", color: "#C4B5FD" },
    lgpd: { label: "LGPD", color: "#FCA5A5" },
  }[ticket.status] || { label: ticket.status, color: "#CBD5E1" };

  // Função para renderizar a mensagem com base na permissão - MOVIDA PARA DEPOIS DE TODAS AS FUNÇÕES
  const renderLastMessage = () => {
    if (shouldBlurMessages) {
      return (
        <MarkdownWrapper>
          {i18n.t("tickets.messageHidden") || "Mensagem oculta"}
        </MarkdownWrapper>
      );
    }

    if (!ticket.lastMessage) {
      return <br />;
    }

    if (ticket.lastMessage.includes("data:image/png;base64")) {
      return <MarkdownWrapper>Localização</MarkdownWrapper>;
    }

    if (ticket.lastMessage.includes("BEGIN:VCARD")) {
      return <MarkdownWrapper>Contato</MarkdownWrapper>;
    }

    return (
      <MarkdownWrapper>
        {truncate(ticket.lastMessage, 40)}
      </MarkdownWrapper>
    );
  };

  return (
    <React.Fragment key={ticket.id}>
      {openAlert && (
        <ShowTicketOpen
          isOpen={openAlert}
          handleClose={handleCloseAlert}
          user={userTicketOpen}
          queue={queueTicketOpen}
        />
      )}
      {acceptTicketWithouSelectQueueOpen && (
        <AcceptTicketWithouSelectQueue
          modalOpen={acceptTicketWithouSelectQueueOpen}
          onClose={(e) => setAcceptTicketWithouSelectQueueOpen(false)}
          ticketId={ticket.id}
          ticket={ticket}
        />
      )}
      {transferTicketModalOpen && (
        <TransferTicketModalCustom
          modalOpen={transferTicketModalOpen}
          onClose={handleCloseTransferTicketModal}
          ticketid={ticket.id}
          ticket={ticket}
        />
      )}
        <ListItem
        button
        dense
        onClick={(e) => {
          console.log("e", e);
          const isCheckboxClicked =
            (e.target.tagName.toLowerCase() === "input" &&
              e.target.type === "checkbox") ||
            (e.target.tagName.toLowerCase() === "svg" &&
              e.target.type === undefined) ||
            (e.target.tagName.toLowerCase() === "path" &&
              e.target.type === undefined);

          if (isCheckboxClicked) return;

          handleSelectTicket(ticket);
        }}
        selected={ticketId && ticketId === ticket.uuid}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === "pending",
          [classes.selectedTicket]: ticketId && ticketId === ticket.uuid,
        })}
      >
        <ListItemAvatar style={{ marginLeft: 0, minWidth: 58 }}>
          <Avatar
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
            }}
            src={`${ticket?.contact?.urlPicture}`}
            className={classes.clickableAvatar}
            onClick={handleImageClick}
          />
        </ListItemAvatar>
        <ListItemText
          disableTypography
          primary={
            <span className={classes.contactNameWrapper}>
              <Typography
                noWrap
                component="span"
                variant="body2"
                className={classes.headerIdentity}
              >
                <span
                  className={classes.statusDot}
                  title={statusConfig.label}
                  style={{ backgroundColor: statusConfig.color }}
                />
                {ticket.isGroup && ticket.channel === "whatsapp" && (
                  <GroupIcon
                    fontSize="small"
                    style={{
                      color: grey[700],
                      marginBottom: "-1px",
                    }}
                  />
                )}
                {ticket.channel && (
                  <ConnectionIcon
                    width="20"
                    height="20"
                    className={classes.connectionIcon}
                    connectionType={ticket.channel}
                  />
                )}
                <span className={classes.titleText}>
                  {truncate(ticket.contact?.name, 60)}
                </span>
              </Typography>
            </span>
          }
          secondary={
            <span className={classes.contactNameWrapper}>
              <Typography
                className={
                  Number(ticket.unreadMessages) > 0
                    ? classes.contactLastMessageUnread
                    : classes.contactLastMessage
                }
                noWrap
                component="span"
                variant="body2"
              >
                {renderLastMessage()}
                <span className={classes.metaWrap}>
                  {ticket?.whatsapp ? (
                    <Badge
                      className={classes.connectionTag}
                      style={{
                        backgroundColor:
                          ticket.channel === "whatsapp"
                            ? "#DCFCE7"
                            : ticket.channel === "facebook"
                            ? "#DBEAFE"
                            : "#FCE7F3",
                        color:
                          ticket.channel === "whatsapp"
                            ? "#166534"
                            : ticket.channel === "facebook"
                            ? "#1D4ED8"
                            : "#9D174D",
                      }}
                    >
                      {ticket.whatsapp?.name.toUpperCase()}
                    </Badge>
                  ) : (
                    <br></br>
                  )}
                  {
                    <Badge
                      style={{
                        backgroundColor: ticket.queueId ? `${ticket.queue?.color || "#CBD5E1"}22` : "#FEF3C7",
                        color: ticket.queueId ? (ticket.queue?.color || "#475569") : "#92400E",
                      }}
                      className={classes.connectionTag}
                    >
                      {ticket.queueId
                        ? ticket.queue?.name.toUpperCase()
                        : ticket.status === "lgpd"
                        ? "LGPD"
                        : `${i18n.t("momentsUser.noqueue")}`}
                    </Badge>
                  }
                  {ticket?.user && (
                    <Badge
                      style={{ backgroundColor: "#E2E8F0", color: "#334155" }}
                      className={classes.connectionTag}
                    >
                      {ticket.user?.name.toUpperCase()}
                    </Badge>
                  )}
                </span>
                <span className={classes.secondaryContentSecond}>
                  {ticket?.contact?.tags?.map((tag) => {
                    return (
                      <ContactTag
                        tag={tag}
                        key={`ticket-contact-tag-${ticket.id}-${tag.id}`}
                      />
                    );
                  })}
                </span>
                <span className={classes.secondaryContentSecond}>
                  {ticket.tags?.map((tag) => {
                    return (
                      <ContactTag
                        tag={tag}
                        key={`ticket-contact-tag-${ticket.id}-${tag.id}`}
                      />
                    );
                  })}
                </span>
              </Typography>

            </span>
          }
        />
        <ListItemSecondaryAction className={classes.sideActions}>
          {ticket.lastMessage && (
            <>
              <Typography
                className={
                  Number(ticket.unreadMessages) > 0
                    ? classes.lastMessageTimeUnread
                    : classes.lastMessageTime
                }
                component="span"
                variant="body2"
              >
                {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                  <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                ) : (
                  <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                )}
              </Typography>
            </>
          )}
        </ListItemSecondaryAction>
        <ListItemSecondaryAction className={classes.sideTools}>
          <Badge
            badgeContent={shouldBlurMessages ? "?" : ticket.unreadMessages}
            invisible={!shouldBlurMessages && !Number(ticket.unreadMessages)}
            classes={{
              badge: classes.badgeStyle,
            }}
          />
        </ListItemSecondaryAction>
        <ListItemSecondaryAction
          className={clsx(classes.quickActionRail, classes.hoverActions)}
        >
          {renderQuickActions()}
        </ListItemSecondaryAction>
      </ListItem>

      {/* Modal de Finalização de Venda */}
      {openFinalizacaoVenda && (
        <FinalizacaoVendaModal
          open={openFinalizacaoVenda}
          onClose={() => setOpenFinalizacaoVenda(false)}
          ticket={ticket}
          onFinalizar={(ticketData) => {
            setOpenFinalizacaoVenda(false);
            setTicketDataToFinalize(ticketData);
            setShowFinalizacaoOptions(true);
          }}
        />
      )}

      {/* Modal de Opções de Finalização */}
      {showFinalizacaoOptions && (
        <Dialog
          open={showFinalizacaoOptions}
          onClose={() => setShowFinalizacaoOptions(false)}
          aria-labelledby="finalizacao-options-title"
        >
          <DialogTitle id="finalizacao-options-title">
            Como deseja finalizar?
          </DialogTitle>
          <DialogActions>
            <Button
              onClick={async () => {
                setShowFinalizacaoOptions(false);
                await handleUpdateTicketStatusWithData(
                  ticketDataToFinalize,
                  false,
                  null
                );
              }}
              style={{ background: theme.palette.primary.main, color: "white" }}
            >
              {i18n.t("messagesList.header.dialogRatingWithoutFarewellMsg")}
            </Button>
            <Button
              onClick={async () => {
                setShowFinalizacaoOptions(false);
                await handleUpdateTicketStatusWithData(
                  ticketDataToFinalize,
                  true,
                  null
                );
              }}
              style={{ background: theme.palette.primary.main, color: "white" }}
            >
              {i18n.t("messagesList.header.dialogRatingCancel")}
            </Button>
          </DialogActions>
        </Dialog>
      )}

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
            src={ticket?.contact?.urlPicture} 
            alt={ticket?.contact?.name || "Foto do contato"}
            className={classes.expandedImage}
          />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

// Memoizar o componente para evitar re-renderizações desnecessárias
export default React.memo(TicketListItemCustom, (prevProps, nextProps) => {
  // Comparar apenas as props que realmente importam para a renderização
  return (
    prevProps.ticket?.id === nextProps.ticket?.id &&
    prevProps.ticket?.status === nextProps.ticket?.status &&
    prevProps.ticket?.unreadMessages === nextProps.ticket?.unreadMessages &&
    prevProps.ticket?.lastMessage === nextProps.ticket?.lastMessage &&
    prevProps.ticket?.updatedAt === nextProps.ticket?.updatedAt &&
    prevProps.ticket?.userId === nextProps.ticket?.userId &&
    prevProps.ticket?.contact?.name === nextProps.ticket?.contact?.name &&
    prevProps.ticket?.contact?.profilePicUrl === nextProps.ticket?.contact?.profilePicUrl &&
    prevProps.ticket?.whatsapp?.name === nextProps.ticket?.whatsapp?.name
  );
});
