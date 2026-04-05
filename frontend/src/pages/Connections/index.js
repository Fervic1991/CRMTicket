import React, { useState, useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { add, format, parseISO } from "date-fns";

// import { SocketContext } from "../../context/Socket/SocketContext";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Button,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Table,
  TableHead,
  Paper,
  Tooltip,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Avatar,
} from "@material-ui/core";
import {
  Edit,
  CheckCircle,
  SignalCellularConnectedNoInternet2Bar,
  SignalCellularConnectedNoInternet0Bar,
  SignalCellular4Bar,
  CropFree,
  DeleteOutline,
  Facebook,
  Instagram,
  WhatsApp,
  Sync,
  LinkOff,
} from "@material-ui/icons";
import WebhookIcon from '@mui/icons-material/Webhook';
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import formatSerializedId from '../../utils/formatSerializedId';
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";
import { Can } from "../../components/Can";

const useStyles = makeStyles((theme) => ({
  headerCard: {
    width: "100%",
    borderRadius: 18,
    padding: theme.spacing(2),
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, rgba(59,130,246,0.28), rgba(16,185,129,0.18))"
        : "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(245,248,255,0.9))",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.2)"
        : "1px solid rgba(120,130,160,0.18)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 18px 45px rgba(0,0,0,0.35)"
        : "0 18px 45px rgba(31, 45, 61, 0.08)",
  },
  headerTitle: {
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1.5),
    overflowY: "auto",
    borderRadius: 18,
    background:
      theme.palette.mode === "dark"
        ? "rgba(15, 23, 42, 0.7)"
        : "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,255,0.95) 100%)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.2)"
        : "1px solid rgba(120,130,160,0.18)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 20px 55px rgba(0,0,0,0.35)"
        : "0 20px 55px rgba(31, 45, 61, 0.08)",
    ...theme.scrollbarStyles,
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: "0 10px",
  },
  tableHeader: {
    fontWeight: 700,
    backgroundColor: "rgba(243,246,252,0.9)",
    color: theme.palette.text.secondary,
    borderBottom: "1px solid rgba(120,130,160,0.2)",
  },
  tableRow: {
    backgroundColor: "rgba(255,255,255,0.85)",
    boxShadow: "0 8px 18px rgba(31,45,61,0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 16px 30px rgba(31,45,61,0.12)",
    },
    "& > td": {
      borderBottom: "none",
    },
    "& td:first-child": {
      borderTopLeftRadius: 14,
      borderBottomLeftRadius: 14,
    },
    "& td:last-child": {
      borderTopRightRadius: 14,
      borderBottomRightRadius: 14,
    },
  },
  actionButton: {
    borderRadius: 10,
    padding: 6,
    border: "1px solid rgba(120,130,160,0.2)",
    backgroundColor: "rgba(255,255,255,0.8)",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(63,81,181,0.08)",
      borderColor: "rgba(63,81,181,0.35)",
    },
  },
  menuPaper: {
    borderRadius: 16,
    padding: theme.spacing(0.5),
    background:
      theme.palette.mode === "dark"
        ? "rgba(15, 23, 42, 0.92)"
        : "rgba(255, 255, 255, 0.95)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.2)"
        : "1px solid rgba(148, 163, 184, 0.25)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 18px 40px rgba(0,0,0,0.45)"
        : "0 18px 40px rgba(15,23,42,0.12)",
    backdropFilter: "blur(12px)",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: theme.spacing(1, 1.5),
    marginBottom: 4,
    "&:hover": {
      background:
        theme.palette.mode === "dark"
          ? "rgba(30, 41, 59, 0.8)"
          : "rgba(226, 232, 240, 0.7)",
    },
  },
  menuItemText: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
  },
  menuItemTitle: {
    fontWeight: 600,
    color: theme.palette.mode === "dark" ? "#e2e8f0" : "#0f172a",
  },
  menuItemSubtitle: {
    fontSize: 11,
    color: theme.palette.mode === "dark" ? "rgba(226,232,240,0.65)" : "#64748b",
  },
  primaryButton: {
    height: 42,
    borderRadius: 12,
    fontWeight: 600,
    textTransform: "none",
    background: "linear-gradient(135deg, rgba(63,81,181,0.9), rgba(25,118,210,0.95))",
    boxShadow: "0 12px 28px rgba(63,81,181,0.3)",
  },
  secondaryButton: {
    height: 42,
    borderRadius: 12,
    fontWeight: 600,
    textTransform: "none",
    background:
      theme.palette.mode === "dark"
        ? "rgba(15, 23, 42, 0.7)"
        : "rgba(255,255,255,0.9)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.2)"
        : "1px solid rgba(120,130,160,0.2)",
    color: theme.palette.mode === "dark" ? "#e2e8f0" : "#0f172a",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 12px 28px rgba(0,0,0,0.35)"
        : "0 12px 28px rgba(31,45,61,0.08)",
    "&:hover": {
      background:
        theme.palette.mode === "dark"
          ? "rgba(30, 41, 59, 0.8)"
          : "rgba(241, 245, 249, 0.9)",
      borderColor:
        theme.palette.mode === "dark"
          ? "rgba(148, 163, 184, 0.4)"
          : "rgba(63,81,181,0.35)",
    },
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: theme.typography.pxToRem(14),
    border: "1px solid #dadde9",
    maxWidth: 450,
  },
  tooltipPopper: {
    textAlign: "center",
  },
  buttonProgress: {
    color: green[500],
  },

  connectDialogPaper: {
    borderRadius: 24,
    overflow: "hidden",
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96))"
        : "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148,163,184,0.2)"
        : "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 30px 70px rgba(15,23,42,0.18)",
  },
  connectDialogTitle: {
    padding: theme.spacing(3, 4, 2),
    background: "linear-gradient(135deg, rgba(59,130,246,0.10), rgba(14,165,233,0.06))",
  },
  connectDialogSubtitle: {
    color: "#64748B",
    marginTop: theme.spacing(0.75),
    fontSize: 13,
  },
  channelGrid: {
    marginTop: theme.spacing(1),
  },
  channelCard: {
    height: "100%",
    borderRadius: 20,
    padding: theme.spacing(2.25),
    cursor: "pointer",
    border: "1px solid rgba(226,232,240,0.9)",
    boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
    background: "rgba(255,255,255,0.94)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 20px 36px rgba(15,23,42,0.10)",
      borderColor: "rgba(59,130,246,0.28)",
    },
  },
  channelCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.25),
    marginBottom: theme.spacing(1.5),
  },
  channelIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: "0 16px 30px rgba(15,23,42,0.16)",
  },
  whatsappGradient: {
    background: "linear-gradient(135deg, #16A34A, #22C55E)",
  },
  messengerGradient: {
    background: "linear-gradient(135deg, #1877F2, #7C3AED)",
  },
  instagramGradient: {
    background: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)",
  },
  channelTitle: {
    fontWeight: 700,
    color: "#0F172A",
  },
  channelDescription: {
    color: "#64748B",
    lineHeight: 1.6,
    fontSize: 13,
  },
  loginMetaButton: {
    minHeight: 42,
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 700,
    color: "#fff",
    background: "#1877F2",
    boxShadow: "0 12px 24px rgba(24,119,242,0.24)",
    "&:hover": {
      background: "#1666D8",
    },
  },
  stepCard: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: 18,
    background: "rgba(248,250,252,0.95)",
    border: "1px solid rgba(226,232,240,0.95)",
  },
  stepTimeline: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 800,
    color: "#fff",
    background: "linear-gradient(135deg, #2563EB, #38BDF8)",
    boxShadow: "0 10px 20px rgba(37,99,235,0.2)",
  },
  stepConnector: {
    flex: 1,
    height: 2,
    borderRadius: 999,
    background: "linear-gradient(90deg, rgba(37,99,235,0.65), rgba(148,163,184,0.22))",
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 0),
  },
  stepBadge: {
    minWidth: 84,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#1D4ED8",
    background: "rgba(219,234,254,0.9)",
  },
  linkedBadge: {
    borderRadius: 999,
    background: "rgba(220,252,231,0.9)",
    color: "#166534",
    fontWeight: 700,
    marginRight: theme.spacing(1),
    border: "1px solid rgba(134,239,172,0.9)",
  },
  disconnectGhost: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 700,
    color: "#DC2626",
    border: "1px solid rgba(248,113,113,0.28)",
    background: "transparent",
    "&:hover": {
      background: "rgba(254,242,242,0.92)",
    },
  },
  socialIdentityRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.25),
    justifyContent: "center",
  },
  socialAvatar: {
    width: 38,
    height: 38,
    fontSize: 13,
    fontWeight: 800,
    color: "#fff",
    boxShadow: "0 10px 20px rgba(15,23,42,0.12)",
  },
  socialIdentity: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    lineHeight: 1.2,
    textAlign: "left",
  },
  socialIdentityLabel: {
    fontWeight: 700,
    color: "#0F172A",
  },
  socialIdentityMeta: {
    fontSize: 12,
    color: "#64748B",
  },
}));

function CircularProgressWithLabel(props) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const CustomToolTip = ({ title, content, children }) => {
  const classes = useStyles();

  return (
    <Tooltip
      arrow
      classes={{
        tooltip: classes.tooltip,
        popper: classes.tooltipPopper,
      }}
      title={
        <React.Fragment>
          <Typography gutterBottom color="inherit">
            {title}
          </Typography>
          {content && <Typography>{content}</Typography>}
        </React.Fragment>
      }
    >
      {children}
    </Tooltip>
  );
};

const IconChannel = (channel) => {
  switch (channel) {
    case "facebook":
      return <Facebook style={{ color: "#3b5998" }} />;
    case "instagram":
      return <Instagram style={{ color: "#e1306c" }} />;
    case "whatsapp":
      return <WhatsApp style={{ color: "#25d366" }} />;
    case "whatsapp_oficial":
      return <WhatsApp style={{ color: "#25d366" }} />;
    default:
      return "error";
  }
};


const getChannelIdentity = (whatsApp) => {
  return whatsApp.pageName || whatsApp.instagramUser || whatsApp.name || "-";
};

const getInitials = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "--";

const getSocialAvatarStyle = (channel) => ({
  background:
    channel === "facebook"
      ? "linear-gradient(135deg, #1877F2, #7C3AED)"
      : "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)",
});

const Connections = () => {
  const classes = useStyles();

  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [statusImport, setStatusImport] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [channel, setChannel] = useState("whatsapp");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const history = useHistory();
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(confirmationModalInitialState);
  const [planConfig, setPlanConfig] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [sourceConnection, setSourceConnection] = useState("");
  const [targetConnection, setTargetConnection] = useState("");
  const [preDeleteModalOpen, setPreDeleteModalOpen] = useState(false);
  const [whatsAppToDelete, setWhatsAppToDelete] = useState(null);
  const [transferProgressModalOpen, setTransferProgressModalOpen] = useState(false);
  const [transferProgress, setTransferProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);

  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  const companyId = user.companyId;

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      setPlanConfig(planConfigs)
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const responseFacebook = (response) => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  const responseInstagram = (response) => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          addInstagram: true,
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  useEffect(() => {
    // const socket = socketManager.GetSocket();

    socket.on(`importMessages-${user.companyId}`, (data) => {
      if (data.action === "refresh") {
        setStatusImport([]);
        history.go(0);
      }
      if (data.action === "update") {
        setStatusImport(data.status);
      }
    });

    socket.on(`transferTickets-${user.companyId}`, (data) => {
      if (data.action === "progress") {
        setTransferProgress({
          current: data.current,
          total: data.total,
          percentage: Math.round((data.current / data.total) * 100)
        });
      }
      if (data.action === "completed") {
        setTransferProgressModalOpen(false);
        setTransferProgress({ current: 0, total: 0, percentage: 0 });
        toast.success(i18n.t("connections.transfer.transferComplete") + ` ${data.transferred} ` + i18n.t("connections.transfer.successMessage"));
        handleCloseTransferModal();
      }
      if (data.action === "error") {
        setTransferProgressModalOpen(false);
        setTransferProgress({ current: 0, total: 0, percentage: 0 });
        toast.error(i18n.t("connections.transfer.transferError"));
      }
    });

    /* return () => {
      socket.disconnect();
    }; */
  }, [whatsApps]);

  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleRequestNewQrCode = async (whatsAppId) => {
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenWhatsAppModal = (channel) => {
    setChannel(channel)
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
    setConnectDialogOpen(false);
  };

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
  }, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleOpenQrModal = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, [setQrModalOpen, setSelectedWhatsApp]);

  const handleEditWhatsApp = (whatsApp) => {
    setChannel(whatsApp.channel)
    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
    setConnectDialogOpen(false);
  };

  const handleSyncTemplates = async (whatsAppId) => {
    await api.get(`/whatsapp/sync-templates/${whatsAppId}`);
  }

  const handleCopyWebhook = (url) => {
    navigator.clipboard.writeText(url); // Copia o token para a área de transferência    
  };

  const openInNewTab = url => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId,
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId,
      });
    }
    if (action === "closedImported") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.closedImportedTitle"),
        message: i18n.t("connections.confirmationModal.closedImportedMessage"),
        whatsAppId: whatsAppId,
      });
    }

    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.deleted"));
      } catch (err) {
        toastError(err);
      }
    }
    if (confirmModalInfo.action === "closedImported") {
      try {
        await api.post(`/closedimported/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.closedimported"));
      } catch (err) {
        toastError(err);
      }
    }


    setConfirmModalInfo(confirmationModalInitialState);
  };


  const renderImportButton = (whatsApp) => {
    if (whatsApp?.statusImportMessages === "renderButtonCloseTickets") {
      return (
        <Button
          style={{ marginLeft: 12 }}
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => {
            handleOpenConfirmationModal("closedImported", whatsApp.id);
          }}
        >
          {i18n.t("connections.buttons.closedImported")}
        </Button>
      );
    }

    if (whatsApp?.importOldMessages) {
      let isTimeStamp = !isNaN(
        new Date(Math.floor(whatsApp?.statusImportMessages)).getTime()
      );

      if (isTimeStamp) {
        const ultimoStatus = new Date(
          Math.floor(whatsApp?.statusImportMessages)
        ).getTime();
        const dataLimite = +add(ultimoStatus, { seconds: +35 }).getTime();
        if (dataLimite > new Date().getTime()) {
          return (
            <>
              <Button
                disabled
                style={{ marginLeft: 12 }}
                size="small"
                endIcon={
                  <CircularProgress
                    size={12}
                    className={classes.buttonProgress}
                  />
                }
                variant="outlined"
                color="primary"
              >
                {i18n.t("connections.buttons.preparing")}
              </Button>
            </>
          );
        }
      }
    }
  };

  const renderActionButtons = (whatsApp) => {
    if (whatsApp.channel === "facebook" || whatsApp.channel === "instagram") {
      const isLinked = whatsApp.status === "CONNECTED";
      return (
        <>
          {isLinked ? (
            <>
              <Chip
                icon={<CheckCircle style={{ color: "#166534" }} />}
                label={i18n.t("connections.badges.linked")}
                size="small"
                className={classes.linkedBadge}
              />
              <Button
                size="small"
                variant="outlined"
                startIcon={<LinkOff fontSize="small" />}
                className={classes.disconnectGhost}
                onClick={() => handleOpenConfirmationModal("disconnect", whatsApp.id)}
              >
                {i18n.t("connections.buttons.disconnectSocial")}
              </Button>
            </>
          ) : (
            <Button size="small" variant="outlined" color="primary" onClick={handleOpenConnectDialog}>
              {i18n.t("connections.buttons.connect")}
            </Button>
          )}
        </>
      );
    }

    return (
      <>
        {whatsApp.channel === "whatsapp" && whatsApp.status === "qrcode" && (
          <Can
            role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleOpenQrModal(whatsApp)}
              >
                {i18n.t("connections.buttons.qrcode")}
              </Button>
            )}
          />
        )}
        {whatsApp.channel === "whatsapp" && whatsApp.status === "DISCONNECTED" && (
          <Can
            role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleStartWhatsAppSession(whatsApp.id)}
                >
                  {i18n.t("connections.buttons.tryAgain")}
                </Button>{" "}
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleRequestNewQrCode(whatsApp.id)}
                >
                  {i18n.t("connections.buttons.newQr")}
                </Button>
              </>
            )}
          />
        )}
        {(whatsApp.channel === "whatsapp" && (whatsApp.status === "CONNECTED" ||
          whatsApp.status === "PAIRING" ||
          whatsApp.status === "TIMEOUT")) && (
            <Can
              role={user.profile}
              perform="connections-page:addConnection"
              yes={() => (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      handleOpenConfirmationModal("disconnect", whatsApp.id);
                    }}
                  >
                    {i18n.t("connections.buttons.disconnect")}
                  </Button>

                  {renderImportButton(whatsApp)}
                </>
              )}
            />
          )}
        {(whatsApp.channel === "whatsapp" && whatsApp.status === "OPENING") && (
          <Button size="small" variant="outlined" disabled color="default">
            {i18n.t("connections.buttons.connecting")}
          </Button>
        )}
      </>
    );
  };

  const renderStatusToolTips = (whatsApp) => {
    return (
      <div className={classes.customTableCell}>
        {whatsApp.status === "DISCONNECTED" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.disconnected.title")}
            content={i18n.t("connections.toolTips.disconnected.content")}
          >
            <SignalCellularConnectedNoInternet0Bar color="secondary" />
          </CustomToolTip>
        )}
        {whatsApp.status === "OPENING" && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
        {whatsApp.status === "qrcode" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.qrcode.title")}
            content={i18n.t("connections.toolTips.qrcode.content")}
          >
            <CropFree />
          </CustomToolTip>
        )}
        {whatsApp.status === "CONNECTED" && (
          <CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
            <SignalCellular4Bar style={{ color: green[500] }} />
          </CustomToolTip>
        )}
        {(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.timeout.title")}
            content={i18n.t("connections.toolTips.timeout.content")}
          >
            <SignalCellularConnectedNoInternet2Bar color="secondary" />
          </CustomToolTip>
        )}
      </div>
    );
  };

  const restartWhatsapps = async () => {

    try {
      await api.post(`/whatsapp-restart/`);
      toast.success(i18n.t("connections.waitConnection"));
    } catch (err) {
      toastError(err);
    }
  }

  const handleOpenTransferModal = () => {
    setTransferModalOpen(true);
  };

  const handleOpenConnectDialog = () => {
    setConnectDialogOpen(true);
  };

  const handleCloseConnectDialog = () => {
    setConnectDialogOpen(false);
  };

  const handleCloseTransferModal = () => {
    setTransferModalOpen(false);
    setSourceConnection("");
    setTargetConnection("");
  };

  const handleCloseTransferProgressModal = () => {
    setTransferProgressModalOpen(false);
    setTransferProgress({ current: 0, total: 0, percentage: 0 });
  };

  const handleTransferTickets = async () => {
    if (!sourceConnection || !targetConnection) {
      toast.error(i18n.t("connections.transfer.selectConnections"));
      return;
    }

    if (sourceConnection === targetConnection) {
      toast.error(i18n.t("connections.transfer.differentConnections"));
      return;
    }

    try {
      const response = await api.post(`/transfer-tickets`, {
        sourceConnectionId: sourceConnection,
        targetConnectionId: targetConnection
      });

      if (response.data.requiresProgress) {
        setTransferModalOpen(false);
        setTransferProgressModalOpen(true);
        setTransferProgress({ current: 0, total: response.data.totalTickets, percentage: 0 });
      } else {
        const transferredCount = response.data.transferred || 0;
        toast.success(
          i18n.t("connections.transfer.successMessageWithCount", { count: transferredCount })
        );
        handleCloseTransferModal();
      }
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenPreDeleteModal = (whatsAppId) => {
    setWhatsAppToDelete(whatsAppId);
    setPreDeleteModalOpen(true);
  };

  const handleClosePreDeleteModal = () => {
    setPreDeleteModalOpen(false);
    setWhatsAppToDelete(null);
  };

  const handleConfirmTransferDone = () => {
    setPreDeleteModalOpen(false);
    handleOpenConfirmationModal("delete", whatsAppToDelete);
    setWhatsAppToDelete(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>
      {qrModalOpen && (
        <QrcodeModal
          open={qrModalOpen}
          onClose={handleCloseQrModal}
          whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
        />
      )}
      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
        channel={channel}
      />
      <Dialog
        open={connectDialogOpen}
        onClose={handleCloseConnectDialog}
        maxWidth="md"
        fullWidth
        classes={{ paper: classes.connectDialogPaper }}
      >
        <DialogTitle className={classes.connectDialogTitle}>
          <Typography component="div" variant="h5" style={{ fontWeight: 800, color: "#0F172A" }}>
            {i18n.t("connections.connectNewAccount")}
          </Typography>
          <Typography className={classes.connectDialogSubtitle}>
            {i18n.t("connections.selectChannel")}
          </Typography>
        </DialogTitle>
        <DialogContent dividers style={{ padding: 24 }}>
          <Grid container spacing={3} className={classes.channelGrid}>
            <Grid item xs={12} md={4}>
              <Card className={classes.channelCard} onClick={() => handleOpenWhatsAppModal("whatsapp")}>
                <div className={classes.channelCardHeader}>
                  <div className={`${classes.channelIconWrap} ${classes.whatsappGradient}`}><WhatsApp /></div>
                  <div>
                    <Typography className={classes.channelTitle}>WhatsApp</Typography>
                    <Typography className={classes.channelDescription}>{i18n.t("connections.channelDescriptions.whatsapp")}</Typography>
                  </div>
                </div>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <FacebookLogin
                appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                autoLoad={false}
                fields="name,email,picture"
                version="25.0"
                scope={process.env.REACT_APP_REQUIRE_BUSINESS_MANAGEMENT?.toUpperCase() === "TRUE" ? "public_profile,pages_messaging,pages_show_list,pages_manage_metadata,business_management" : "public_profile,pages_messaging,pages_show_list,pages_manage_metadata"}
                callback={responseFacebook}
                render={(renderProps) => (
                  <Card className={classes.channelCard} onClick={renderProps.onClick}>
                    <div className={classes.channelCardHeader}>
                      <div className={`${classes.channelIconWrap} ${classes.messengerGradient}`}><Facebook /></div>
                      <div>
                        <Typography className={classes.channelTitle}>Facebook Messenger</Typography>
                        <Typography className={classes.channelDescription}>{i18n.t("connections.channelDescriptions.facebook")}</Typography>
                      </div>
                    </div>
                    <div className={classes.stepCard}>
                      <div className={classes.stepTimeline}>
                        <span className={classes.stepDot}>1</span>
                        <span className={classes.stepConnector} />
                        <span className={classes.stepDot}>2</span>
                      </div>
                      <div className={classes.stepRow}>
                        <span className={classes.stepBadge}>{i18n.t("connections.steps.stepOne")}</span>
                        <Typography variant="body2">{i18n.t("connections.steps.loginFacebook")}</Typography>
                      </div>
                      <div className={classes.stepRow}>
                        <span className={classes.stepBadge}>{i18n.t("connections.steps.stepTwo")}</span>
                        <Typography variant="body2">{i18n.t("connections.steps.selectPage")}</Typography>
                      </div>
                      <Button fullWidth className={classes.loginMetaButton}>{i18n.t("connections.buttons.loginWithFacebook")}</Button>
                    </div>
                  </Card>
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FacebookLogin
                appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                autoLoad={false}
                fields="name,email,picture"
                version="25.0"
                scope={process.env.REACT_APP_REQUIRE_BUSINESS_MANAGEMENT?.toUpperCase() === "TRUE" ? "public_profile,pages_messaging,pages_show_list,pages_manage_metadata,business_management" : "public_profile,pages_messaging,pages_show_list,pages_manage_metadata"}
                callback={responseInstagram}
                render={(renderProps) => (
                  <Card className={classes.channelCard} onClick={renderProps.onClick}>
                    <div className={classes.channelCardHeader}>
                      <div className={`${classes.channelIconWrap} ${classes.instagramGradient}`}><Instagram /></div>
                      <div>
                        <Typography className={classes.channelTitle}>Instagram</Typography>
                        <Typography className={classes.channelDescription}>{i18n.t("connections.channelDescriptions.instagram")}</Typography>
                      </div>
                    </div>
                    <div className={classes.stepCard}>
                      <div className={classes.stepTimeline}>
                        <span className={classes.stepDot}>1</span>
                        <span className={classes.stepConnector} />
                        <span className={classes.stepDot}>2</span>
                      </div>
                      <div className={classes.stepRow}>
                        <span className={classes.stepBadge}>{i18n.t("connections.steps.stepOne")}</span>
                        <Typography variant="body2">{i18n.t("connections.steps.loginFacebook")}</Typography>
                      </div>
                      <div className={classes.stepRow}>
                        <span className={classes.stepBadge}>{i18n.t("connections.steps.stepTwo")}</span>
                        <Typography variant="body2">{i18n.t("connections.steps.selectInstagram")}</Typography>
                      </div>
                      <Button fullWidth className={classes.loginMetaButton}>{i18n.t("connections.buttons.loginWithFacebook")}</Button>
                    </div>
                  </Card>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions style={{ padding: 20 }}>
          <Button onClick={handleCloseConnectDialog} className={classes.secondaryButton}>
            {i18n.t("common.cancel")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={transferModalOpen}
        onClose={handleCloseTransferModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{i18n.t("connections.transfer.title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" style={{ marginBottom: 24, lineHeight: 1.6 }}>
            {i18n.t("connections.transfer.description")} <strong>{i18n.t("connections.transfer.descriptionBold1")}</strong> {i18n.t("connections.transfer.descriptionMiddle")} 
            <strong>{i18n.t("connections.transfer.descriptionBold2")}</strong> {i18n.t("connections.transfer.descriptionEnd")}
          </Typography>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
            <FormControl fullWidth>
              <InputLabel>{i18n.t("connections.transfer.origin")}</InputLabel>
              <Select
                value={sourceConnection}
                onChange={(e) => setSourceConnection(e.target.value)}
                label={i18n.t("connections.transfer.origin")}
              >
                {whatsApps.map((whatsApp) => (
                  <MuiMenuItem key={whatsApp.id} value={whatsApp.id}>
                    {whatsApp.name}
                  </MuiMenuItem>
                ))}
              </Select>
            </FormControl>

            <div style={{ fontSize: 24, color: '#4caf50', fontWeight: 'bold' }}>
              →
            </div>

            <FormControl fullWidth>
              <InputLabel>{i18n.t("connections.transfer.destination")}</InputLabel>
              <Select
                value={targetConnection}
                onChange={(e) => setTargetConnection(e.target.value)}
                label={i18n.t("connections.transfer.destination")}
              >
                {whatsApps.map((whatsApp) => (
                  <MuiMenuItem key={whatsApp.id} value={whatsApp.id}>
                    {whatsApp.name}
                  </MuiMenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferModal} color="default">
            {i18n.t("connections.transfer.cancel")}
          </Button>
          <Button onClick={handleTransferTickets} color="primary" variant="contained">
            {i18n.t("connections.transfer.transferButton")}
          </Button>
         </DialogActions>
       </Dialog>
       <Dialog
         open={transferProgressModalOpen}
         onClose={handleCloseTransferProgressModal}
         maxWidth="sm"
         fullWidth
         disableBackdropClick
         disableEscapeKeyDown
       >
         <DialogTitle>{i18n.t("connections.transfer.progressTitle")}</DialogTitle>
         <DialogContent>
           <div style={{ textAlign: 'center', padding: '20px 0' }}>
             <Typography variant="h6" style={{ marginBottom: 16 }}>
               {i18n.t("connections.transfer.progressDescription")}
             </Typography>
             
             <Box position="relative" display="inline-flex" marginBottom={2}>
               <CircularProgress 
                 variant="determinate" 
                 value={transferProgress.percentage} 
                 size={80}
                 thickness={4}
               />
               <Box
                 top={0}
                 left={0}
                 bottom={0}
                 right={0}
                 position="absolute"
                 display="flex"
                 alignItems="center"
                 justifyContent="center"
               >
                 <Typography variant="caption" component="div" color="textSecondary" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                   {transferProgress.percentage}%
                 </Typography>
               </Box>
             </Box>

             <Typography variant="body1" style={{ marginTop: 16 }}>
               {transferProgress.current} {i18n.t("connections.transfer.progressMessage")} {transferProgress.total} {i18n.t("connections.transfer.progressMessageEnd")}
             </Typography>
             
             <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
               {i18n.t("connections.transfer.progressWait")}
             </Typography>
           </div>
         </DialogContent>
       </Dialog>
       <Dialog
         open={preDeleteModalOpen}
         onClose={handleClosePreDeleteModal}
         maxWidth="sm"
         fullWidth
       >
         <DialogTitle>{i18n.t("connections.transfer.title")}</DialogTitle>
         <DialogContent>
           <Typography variant="body1" style={{ marginBottom: 16 }}>
             {i18n.t("connections.transfer.preDeleteMessage")}
           </Typography>
         </DialogContent>
         <DialogActions>
           <Button onClick={handleClosePreDeleteModal} color="default">
             {i18n.t("connections.transfer.preDeleteNo")}
           </Button>
           <Button onClick={handleConfirmTransferDone} color="primary" variant="contained">
             {i18n.t("connections.transfer.preDeleteYes")}
           </Button>
         </DialogActions>
       </Dialog>
      {user.profile === "user" && user.allowConnections === "disabled" ?
        <ForbiddenPage />
        :
        <>
          <MainHeader>
            <div className={classes.headerCard}>
              <Title className={classes.headerTitle}>{i18n.t("connections.title")} ({whatsApps.length})</Title>
            </div>
            <MainHeaderButtonsWrapper>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenTransferModal}
                className={classes.primaryButton}
              >
                {i18n.t("connections.transferTickets")}
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={restartWhatsapps}
                className={classes.primaryButton}
              >
                {i18n.t("connections.restartConnections")}
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={() => openInNewTab(`https://wa.me/${process.env.REACT_APP_NUMBER_SUPPORT}`)}
                className={classes.primaryButton}
              >
                {i18n.t("connections.callSupport")}
              </Button>
              <Can
                role={user.profile}
                perform="connections-page:addConnection"
                yes={() => (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenConnectDialog}
                    className={classes.primaryButton}
                  >
                    {i18n.t("connections.connectNewAccount")}
                  </Button>
                )}
              />
            </MainHeaderButtonsWrapper>
          </MainHeader>

          {
            statusImport?.all ? (
              <>
                <div style={{ margin: "auto", marginBottom: 12 }}>
                  <Card className={classes.root}>
                    <CardContent className={classes.content}>
                      <Typography component="h5" variant="h5">

                        {statusImport?.this === -1 ? i18n.t("connections.buttons.preparing") : i18n.t("connections.buttons.importing")}

                      </Typography>
                      {statusImport?.this === -1 ?
                        <Typography component="h6" variant="h6" align="center">

                          <CircularProgress
                            size={24}
                          />

                        </Typography>
                        :
                        <>
                          <Typography component="h6" variant="h6" align="center">
                            {`${i18n.t(`connections.typography.processed`)} ${statusImport?.this} ${i18n.t(`connections.typography.in`)} ${statusImport?.all}  ${i18n.t(`connections.typography.date`)}: ${statusImport?.date} `}
                          </Typography>
                          <Typography align="center">
                            <CircularProgressWithLabel
                              style={{ margin: "auto" }}
                              value={(statusImport?.this / statusImport?.all) * 100}
                            />
                          </Typography>
                        </>
                      }
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null
          }

          <Paper className={classes.mainPaper} variant="outlined">
            <Table size="small" className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" className={classes.tableHeader}>{i18n.t("connections.table.channel")}</TableCell>
                  <TableCell align="center" className={classes.tableHeader}>{i18n.t("connections.table.color")}</TableCell>
                  <TableCell align="center" className={classes.tableHeader}>{i18n.t("connections.table.name")}</TableCell>
                  <TableCell align="center" className={classes.tableHeader}>{i18n.t("connections.table.number")}</TableCell>
                  <TableCell align="center" className={classes.tableHeader}>{i18n.t("connections.table.status")}</TableCell>
                  <TableCell align="center" className={classes.tableHeader}>{i18n.t("connections.table.session")}</TableCell>
                  <TableCell align="center" className={classes.tableHeader}>{i18n.t("connections.table.lastUpdate")}</TableCell>
                  <TableCell align="center" className={classes.tableHeader}>{i18n.t("connections.table.default")}</TableCell>
                  <Can
                    role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
                    perform="connections-page:addConnection"
                    yes={() => (
                      <TableCell align="center" className={classes.tableHeader}>{i18n.t("connections.table.actions")}</TableCell>
                    )}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRowSkeleton />
                ) : (
                  <>
                    {whatsApps?.length > 0 &&
                      whatsApps.map((whatsApp) => (
                        <TableRow key={whatsApp.id} className={classes.tableRow}>
                          <TableCell align="center">{IconChannel(whatsApp.channel)}</TableCell>
                          <TableCell align="center">
                            <div className={classes.customTableCell}>
                              <span
                                style={{
                                  backgroundColor: whatsApp.color,
                                  width: 60,
                                  height: 20,
                                  alignSelf: "center",
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell align="center">
                            {(whatsApp.channel === "facebook" || whatsApp.channel === "instagram") ? (
                              <div className={classes.socialIdentityRow}>
                                <Avatar
                                  className={classes.socialAvatar}
                                  style={getSocialAvatarStyle(whatsApp.channel)}
                                >
                                  {getInitials(getChannelIdentity(whatsApp))}
                                </Avatar>
                                <div className={classes.socialIdentity}>
                                  <span className={classes.socialIdentityLabel}>
                                    {getChannelIdentity(whatsApp)}
                                  </span>
                                  <span className={classes.socialIdentityMeta}>
                                    {whatsApp.channel === "facebook"
                                      ? i18n.t("connections.pageName")
                                      : i18n.t("connections.instagramHandle")}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              whatsApp.name
                            )}
                          </TableCell>
                          <TableCell align="center">{(whatsApp.channel === 'whatsapp' || whatsApp.channel === 'whatsapp_oficial') ? (whatsApp.number ? formatSerializedId(whatsApp.number) : "-") : (whatsApp.instagramUser || whatsApp.pageName || whatsApp.number || "-")}</TableCell>
                          <TableCell align="center">{renderStatusToolTips(whatsApp)}</TableCell>
                          <TableCell align="center">{renderActionButtons(whatsApp)}</TableCell>
                          <TableCell align="center">{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}</TableCell>
                          <TableCell align="center">
                            {whatsApp.isDefault && (
                              <div className={classes.customTableCell}>
                                <CheckCircle style={{ color: green[500] }} />
                              </div>
                            )}
                          </TableCell>
                          <Can
                            role={user.profile}
                            perform="connections-page:addConnection"
                            yes={() => (
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditWhatsApp(whatsApp)}
                                  className={classes.actionButton}
                                >
                                  <Edit />
                                </IconButton>

                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    handleOpenPreDeleteModal(whatsApp.id);
                                  }}
                                  className={classes.actionButton}
                                >
                                  <DeleteOutline />
                                </IconButton>
                                {whatsApp.channel === "whatsapp_oficial" && (
                                  <>
                                    <Tooltip title={i18n.t("connections.syncTemplates.tooltip")}>
                                      <IconButton
                                        size="small"
                                        aria-label="sync-templates"
                                        onClick={(e) => {
                                          handleSyncTemplates(whatsApp.id);
                                        }}
                                        className={classes.actionButton}
                                      >
                                        <Sync />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title={i18n.t("connections.copyWebhook.tooltip")}>
                                      <IconButton
                                        size="small"
                                        aria-label="copy-webhook"
                                        onClick={(e) => {
                                          handleCopyWebhook(whatsApp.waba_webhook);
                                        }}
                                        className={classes.actionButton}
                                      >
                                        <WebhookIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </TableCell>
                            )}
                          />
                        </TableRow>
                      ))}
                  </>
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      }
    </MainContainer >

  );
};

export default Connections;
