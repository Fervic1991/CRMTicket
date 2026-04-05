import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useHelps from "../hooks/useHelps";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import CodeRoundedIcon from "@material-ui/icons/CodeRounded";
import ViewKanban from "@mui/icons-material/ViewKanban";
import Schedule from "@material-ui/icons/Schedule";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PeopleIcon from "@material-ui/icons/People";
import ListIcon from "@material-ui/icons/ListAlt";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import ForumIcon from "@material-ui/icons/Forum";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import BusinessIcon from "@material-ui/icons/Business";
import CakeIcon from "@material-ui/icons/Cake";
import {
  AllInclusive,
  AttachFile,
  Dashboard,
  Description,
  DeviceHubOutlined,
  GridOn,
  PhonelinkSetup,
} from "@material-ui/icons";

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { useActiveMenu } from "../context/ActiveMenuContext";

import { Can } from "../components/Can";

import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import { i18n } from "../translate/i18n";
import { Campaign, ShapeLine, Webhook } from "@mui/icons-material";
import {
  LuBadgeHelp,
  LuBarChart3,
  LuClock3,
  LuContact,
  LuContact2,
  LuFileText,
  LuKanbanSquare,
  LuLayoutDashboard,
  LuMegaphone,
  LuMessageCircle,
  LuMessagesSquare,
  LuSettings2,
  LuTags,
  LuWallet,
  LuWorkflow,
  LuZap
} from "react-icons/lu";

import useCompanySettings from "../hooks/useSettings/companySettings";

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: "46px",
    width: "auto",
    margin: "6px 10px",
    paddingLeft: 6,
    paddingRight: 8,
    borderRadius: 12,
    transition: "background-color 0.28s ease, transform 0.28s ease, box-shadow 0.28s ease",
    position: "relative",
    "&:hover": {
      backgroundColor: theme.mode === "light"
        ? "rgba(248,250,252,0.1)"
        : "rgba(63,81,181,0.08)",
      transform: "translateX(2px)",
    },
    "&:hover $iconHoverActive": {
      background: "linear-gradient(135deg, rgba(63,81,181,0.9), rgba(33,150,243,0.95))",
      color: "#fff",
      transform: "translateY(-1px)",
      boxShadow: "0 10px 22px rgba(63,81,181,0.3)",
    },
    "&:hover $listItemText": {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  },
  listItemActive: {
    background: theme.mode === "light"
      ? "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(30,58,138,0.88))"
      : "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(30,64,175,0.28))",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: theme.mode === "light"
      ? "0 8px 20px rgba(15,23,42,0.16)"
      : "0 10px 22px rgba(15,23,42,0.18)",
    "& $listItemText": {
      color: "#F1F5F9",
      fontWeight: 600,
    },
    "&::before": {
      content: '""',
      position: "absolute",
      left: -6,
      top: 8,
      bottom: 8,
      width: 3,
      borderRadius: 999,
      background: "linear-gradient(180deg, #60a5fa 0%, #38bdf8 100%)",
      boxShadow: "0 0 12px rgba(96,165,250,0.45)",
    }
  },

  listItemText: {
    fontSize: "13.5px",
    color: theme.mode === "light" ? "rgba(226,232,240,0.86)" : "#FFF",
    transition: "color 0.3s ease",
    fontWeight: 500,
    "& .MuiTypography-root": {
      fontFamily: "'Inter', 'Roboto', sans-serif",
    }
  },
  listItemTextCollapsed: {
    opacity: 0,
    width: 0,
    margin: 0,
    overflow: "hidden",
    transition: "opacity 0.18s ease, width 0.18s ease",
  },

  avatarActive: {
    backgroundColor: "transparent",
  },

  avatarHover: {
    backgroundColor: "transparent",
  },

  iconHoverActive: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.appTokens?.radius?.md || 12,
    height: 38,
    width: 38,
    backgroundColor:
      theme.mode === "light"
        ? "rgba(248,250,252,0.08)"
        : "rgba(120,120,120,0.35)",
    border: theme.mode === "light"
      ? "1px solid rgba(226,232,240,0.12)"
      : `1px solid ${theme.appTokens?.colors?.border || "rgba(120,130,160,0.2)"}`,
    color: theme.mode === "light"
      ? "#e2e8f0"
      : theme.appTokens?.colors?.textMuted || "#FFF",
    transition: "all 0.28s ease",
    "&.active": {
      background: theme.mode === "light"
        ? "linear-gradient(135deg, rgba(37,99,235,0.96), rgba(56,189,248,0.9))"
        : "linear-gradient(135deg, rgba(37,99,235,0.88), rgba(56,189,248,0.78))",
      color: "#FFFFFF",
      boxShadow: theme.mode === "light"
        ? "0 10px 22px rgba(15,23,42,0.2)"
        : theme.appTokens?.shadows?.md || `0 10px 22px ${theme.palette.primary.main}30`,
      borderColor: "rgba(255,255,255,0.14)",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.25rem",
      width: 20,
      height: 20,
      transition: "transform 0.3s ease",
    },
    "& svg": {
      width: 18,
      height: 18,
      strokeWidth: 1.85,
    },
    "&:hover .MuiSvgIcon-root": {
      transform: "scale(1.1)", // Pequena animação no hover
    }
  },

  // Badge melhorado mas mantendo funcionalidade
  badge: {
    "& .MuiBadge-badge": {
      backgroundColor: "#ef4444",
      color: "#fff",
      fontSize: "0.75rem",
      fontWeight: 600,
      animation: "$pulse 2s infinite",
    }
  },

  "@keyframes pulse": {
    "0%, 100%": {
      opacity: 1,
    },
    "50%": {
      opacity: 0.7,
    }
  },

  // Melhorias para submenus mantendo estrutura original
  submenuContainer: {
    backgroundColor: theme.mode === "light"
      ? "rgba(248,250,252,0.04)"
      : "rgba(255, 255, 255, 0.02)",
    borderRadius: 12,
    margin: "2px 8px 6px",
    overflow: "hidden",
    transition: "all 0.28s ease",
  },
  submenuCollapse: {
    transition: "all 0.32s ease",
  },

  // Tooltip melhorado
  customTooltip: {
    backgroundColor: theme.mode === "light" ? "#1e293b" : "#374151",
    color: "#fff",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    "& .MuiTooltip-arrow": {
      color: theme.mode === "light" ? "#1e293b" : "#374151",
    }
  },

  // Versão com destaque sutil
  versionContainer: {
    textAlign: "center",
    padding: "10px",
    color: theme.palette.primary.main, // Usa cor do tema
    fontSize: "12px",
    fontWeight: "bold",
    borderTop: `1px solid ${theme.mode === "light" ? "#f0f0f0" : "#333"}`,
    marginTop: "auto",
  },

  // Seções de administração com destaque sutil
  adminSection: {
    "& .MuiListSubheader-root": {
      color: theme.palette.primary.main, // Usa cor do tema
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }
  },

  // Efeitos suaves para expand/collapse
  expandIcon: {
    transition: "transform 0.32s ease, color 0.28s ease",
    color: theme.mode === "light" ? "rgba(226,232,240,0.82)" : theme.palette.primary.main,
    "&.expanded": {
      transform: "rotate(180deg)",
    }
  },

  // Menu container com melhorias sutis
  menuContainer: {
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: theme.mode === "light"
        ? "rgba(226,232,240,0.22)"
        : "rgba(255, 255, 255, 0.1)",
      borderRadius: "3px",
      "&:hover": {
        background: theme.mode === "light"
          ? "rgba(0, 0, 0, 0.2)"
          : "rgba(255, 255, 255, 0.2)",
      }
    },
  },

  // Estado ativo melhorado mantendo funcionalidade original
  activeItem: {
    "& $iconHoverActive": {
      background: "linear-gradient(135deg, rgba(63,81,181,0.9), rgba(33,150,243,0.95))",
      color: "#fff",
    },
    "& $listItemText": {
      color: theme.palette.primary.main,
      fontWeight: 700,
    }
  }
}));

function ListItemLink(props) {
  const { icon, primary, to, tooltip, showBadge, collapsed } = props;
  const classes = useStyles();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip title={primary} placement="right">
        {children}
      </Tooltip>
    ) : (
      children
    );

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip}>
      <li>
        <ListItem
          button
          component={renderLink}
          className={`${classes.listItem} ${isActive ? classes.listItemActive : ""}`}
        >
          {icon ? (
            <ListItemIcon>
              {showBadge ? (
                <Badge
                  badgeContent="!"
                  color="error"
                  overlap="circular"
                  className={classes.badge}
                >
                  <Avatar
                    className={`${classes.iconHoverActive} ${isActive ? "active" : ""
                      }`}
                  >
                    {icon}
                  </Avatar>
                </Badge>
              ) : (
                <Avatar
                  className={`${classes.iconHoverActive} ${isActive ? "active" : ""
                    }`}
                >
                  {icon}
                </Avatar>
              )}
            </ListItemIcon>
          ) : null}
          <ListItemText
            className={collapsed ? classes.listItemTextCollapsed : ""}
            primary={
              <Typography className={classes.listItemText}>
                {primary}
              </Typography>
            }
          />
        </ListItem>
      </li>
    </ConditionalTooltip>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = ({ collapsed, drawerClose }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, socket } = useContext(AuthContext);

  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openDashboardSubmenu, setOpenDashboardSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);

  // novas features
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const version = "4.7.9";
  const [managementHover, setManagementHover] = useState(false);
  const [campaignHover, setCampaignHover] = useState(false);
  const { list } = useHelps(); // INSERIR
  const [hasHelps, setHasHelps] = useState(false);

  const [openFlowSubmenu, setOpenFlowSubmenu] = useState(false);
  const [flowHover, setFlowHover] = useState(false);

  const { get: getSetting } = useCompanySettings();
  const [showWallets, setShowWallets] = useState(false);

  const isFlowbuilderRouteActive =
    location.pathname.startsWith("/phrase-lists");
  location.pathname.startsWith("/flowbuilders");

  useEffect(() => {
    // INSERIR ESSE EFFECT INTEIRO
    async function checkHelps() {
      try {
        // Verificar se o usuário está autenticado antes de fazer a requisição
        const token = localStorage.getItem("token");
        if (!token || !user.id) {
          return;
        }
        const helps = await list();
        setHasHelps(helps.length > 0);
      } catch (error) {
        // Silenciar erro se for de autenticação
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.error("Erro ao verificar helps:", error);
        }
      }
    }
    checkHelps();
  }, [user.id]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Verificar se o usuário está autenticado antes de fazer a requisição
        const token = localStorage.getItem("token");
        if (!token || !user.id) {
          return;
        }
        
        const setting = await getSetting(
          {
            "column": "DirectTicketsToWallets"
          }
        );

        setShowWallets(setting.DirectTicketsToWallets);

      } catch (err) {
        // Silenciar erro se for de autenticação durante logout
        if (err?.response?.status !== 401 && err?.response?.status !== 403) {
          toastError(err);
        }
      }
    }

    fetchSettings();
  }, [setShowWallets, user.id]);

  const isManagementActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/reports") ||
    location.pathname.startsWith("/moments");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) {
      setActiveMenu("/tickets");
    } else {
      setActiveMenu("");
    }
  }, [location, setActiveMenu]);

  const { getPlanCompany } = usePlans();

  

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      if (!user?.companyId) {
        console.log("CompanyId ainda não disponível, aguardando...");
        return;
      }
      
      try {
        const companyId = user.companyId;
        const planConfigs = await getPlanCompany(undefined, companyId);

        if (planConfigs?.plan) {
          setShowCampaigns(planConfigs.plan.useCampaigns);
          setShowKanban(planConfigs.plan.useKanban);
          setShowOpenAi(planConfigs.plan.useOpenAi);
          setShowIntegrations(planConfigs.plan.useIntegrations);
          setShowSchedules(planConfigs.plan.useSchedules);
          setShowInternalChat(planConfigs.plan.useInternalChat);
          setShowExternalApi(planConfigs.plan.useExternalApi);
        }
      } catch (error) {
        console.error("Erro ao buscar configurações do plano:", error);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.companyId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

useEffect(() => {
  if (user.id && socket && typeof socket.on === 'function') {
    const companyId = user.companyId;
    
    const onCompanyChatMainListItems = (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    };

    const eventName = `company-${companyId}-chat`;
    console.log('Registrando listener para:', eventName);
    
    socket.on(eventName, onCompanyChatMainListItems);
    
    return () => {
      if (socket && typeof socket.off === 'function') {
        console.log('Removendo listener para:', eventName);
        socket.off(eventName, onCompanyChatMainListItems);
      }
    };
  }
}, [socket, user.id, user.companyId]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  // useEffect(() => {
  //   if (localStorage.getItem("cshow")) {
  //     setShowCampaigns(true);
  //   }
  // }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div onClick={drawerClose}>
      <Can
        role={
          (user.profile === "user" && user.showDashboard === "enabled") ||
            user.allowRealTime === "enabled"
            ? "admin"
            : user.profile
        }
        perform={"drawer-admin-items:view"}
        yes={() => (
          <>
            <Tooltip
              title={collapsed ? i18n.t("mainDrawer.listItems.management") : ""}
              placement="right"
            >
              <ListItem
                dense
                button
                onClick={() => setOpenDashboardSubmenu((prev) => !prev)}
                onMouseEnter={() => setManagementHover(true)}
                onMouseLeave={() => setManagementHover(false)}
              >
                <ListItemIcon>
                  <Avatar
                    className={`${classes.iconHoverActive} ${isManagementActive || managementHover ? "active" : ""
                      }`}
                  >
                    <LuLayoutDashboard />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  className={collapsed ? classes.listItemTextCollapsed : ""}
                  primary={
                    <Typography className={classes.listItemText}>
                      {i18n.t("mainDrawer.listItems.management")}
                    </Typography>
                  }
                />
                {!collapsed && (openDashboardSubmenu ? <ExpandLessIcon className={classes.expandIcon} /> : <ExpandMoreIcon className={classes.expandIcon} />)}
              </ListItem>
            </Tooltip>
            <Collapse
              in={openDashboardSubmenu}
              timeout="auto"
              unmountOnExit
              className={classes.submenuCollapse}
              style={{
                backgroundColor:
                  theme.mode === "light"
                    ? "rgba(120,120,120,0.1)"
                    : "rgba(120,120,120,0.5)",
              }}
            >
              <Can
                role={
                  user.profile === "user" && user.showDashboard === "enabled"
                    ? "admin"
                    : user.profile
                }
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <>
                    <ListItemLink
                      small
                      to="/"
                      primary={i18n.t("mainDrawer.listItems.dashboard")}
                      icon={<LuLayoutDashboard />}
                      tooltip={collapsed}
                      collapsed={collapsed}
                    />
                    <ListItemLink
                      small
                      to="/reports"
                      primary={i18n.t("mainDrawer.listItems.reports")}
                      icon={<LuBarChart3 />}
                      tooltip={collapsed}
                      collapsed={collapsed}
                    />
                  </>
                )}
              />
              <Can
                role={
                  user.profile === "user" && user.allowRealTime === "enabled"
                    ? "admin"
                    : user.profile
                }
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <ListItemLink
                    to="/moments"
                    primary={i18n.t("mainDrawer.listItems.chatsTempoReal")}
                    icon={<GridOn />}
                    tooltip={collapsed}
                    collapsed={collapsed}
                  />
                )}
              />
              {user.profile === "admin" && showWallets && (
                <>
                  <ListItemLink
                    to="/wallets"
                    primary={i18n.t("mainDrawer.listItems.wallets")}
                    icon={<LuWallet />}
                    tooltip={collapsed}
                    collapsed={collapsed}
                  />
                </>
              )}
            </Collapse>
          </>
        )}
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<LuMessagesSquare />}
        tooltip={collapsed}
        collapsed={collapsed}
      />

      <ListItemLink
        to="/quick-messages"
        primary={i18n.t("mainDrawer.listItems.quickMessages")}
        icon={<LuZap />}
        tooltip={collapsed}
        collapsed={collapsed}
      />

      {showKanban && (
        <>
          <ListItemLink
            to="/kanban"
            primary={i18n.t("mainDrawer.listItems.kanban")}
            icon={<LuKanbanSquare />}
            tooltip={collapsed}
            collapsed={collapsed}
          />
        </>
      )}

      {user.showContacts === "enabled" && (
        <ListItemLink
          to="/contacts"
          primary={i18n.t("mainDrawer.listItems.contacts")}
          icon={<LuContact2 />}
          tooltip={collapsed}
          collapsed={collapsed}
        />
      )}

      {showSchedules && (
        <>
          <ListItemLink
            to="/schedules"
            primary={i18n.t("mainDrawer.listItems.schedules")}
            icon={<LuClock3 />}
            tooltip={collapsed}
            collapsed={collapsed}
          />
        </>
      )}

      <ListItemLink
        to="/tags"
        primary={i18n.t("mainDrawer.listItems.tags")}
        icon={<LuTags />}
        tooltip={collapsed}
        collapsed={collapsed}
      />

      {showInternalChat && (
        <>
          <ListItemLink
            to="/chats"
            primary={i18n.t("mainDrawer.listItems.chats")}
            icon={
              <Badge color="secondary" variant="dot" invisible={invisible}>
                <LuMessageCircle />
              </Badge>
            }
            tooltip={collapsed}
            collapsed={collapsed}
          />
        </>
      )}

      {/* 
      <ListItemLink
        to="/todolist"
        primary={i18n.t("ToDoList")}
        icon={<EventAvailableIcon />}
      /> 
      */}

      {hasHelps && (
        <ListItemLink
          to="/helps"
          primary={i18n.t("mainDrawer.listItems.helps")}
          icon={<LuBadgeHelp />}
          tooltip={collapsed}
          collapsed={collapsed}
        />
      )}

      {user?.showCampaign === "enabled" && showCampaigns && (
        <>
          <Tooltip
            title={collapsed ? i18n.t("mainDrawer.listItems.campaigns") : ""}
            placement="right"
          >
            <ListItem
              dense
              button
              onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
              onMouseEnter={() => setCampaignHover(true)}
              onMouseLeave={() => setCampaignHover(false)}
            >
              <ListItemIcon>
                <Avatar
                  className={`${classes.iconHoverActive} ${isCampaignRouteActive || campaignHover ? "active" : ""}`}
                >
                  <LuMegaphone />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                className={collapsed ? classes.listItemTextCollapsed : ""}
                primary={
                  <Typography className={classes.listItemText}>
                    {i18n.t("mainDrawer.listItems.campaigns")}
                  </Typography>
                }
              />
              {!collapsed && (openCampaignSubmenu ? <ExpandLessIcon className={classes.expandIcon} /> : <ExpandMoreIcon className={classes.expandIcon} />)}
            </ListItem>
          </Tooltip>
          <Collapse
            in={openCampaignSubmenu}
            timeout="auto"
            unmountOnExit
            className={classes.submenuCollapse}
            style={{
              backgroundColor:
                theme.mode === "light"
                  ? "rgba(120,120,120,0.1)"
                  : "rgba(120,120,120,0.5)",
            }}
          >
            <List dense component="div" disablePadding>
              <ListItemLink
                to="/campaigns"
                primary={i18n.t("campaigns.subMenus.list")}
                icon={<LuMegaphone />}
                tooltip={collapsed}
                collapsed={collapsed}
              />
              <ListItemLink
                to="/contact-lists"
                primary={i18n.t("campaigns.subMenus.listContacts")}
                icon={<LuContact />}
                tooltip={collapsed}
                collapsed={collapsed}
              />
              <ListItemLink
                to="/campaigns-config"
                primary={i18n.t("campaigns.subMenus.settings")}
                icon={<LuSettings2 />}
                tooltip={collapsed}
                collapsed={collapsed}
              />
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/files"
                    primary={i18n.t("mainDrawer.listItems.files")}
                    icon={<LuFileText />}
                    tooltip={collapsed}
                    collapsed={collapsed}
                  />
                )}
              />
            </List>
          </Collapse>
        </>
      )}

      {/* FLOWBUILDER */}
      {user.showFlow === "enabled" && (
        <>
          <Tooltip
            title={
              collapsed ? i18n.t("mainDrawer.listItems.campaigns") : ""
            }
            placement="right"
          >
            <ListItem
              dense
              button
              onClick={() => setOpenFlowSubmenu((prev) => !prev)}
              onMouseEnter={() => setFlowHover(true)}
              onMouseLeave={() => setFlowHover(false)}
            >
              <ListItemIcon>
                <Avatar
                  className={`${classes.iconHoverActive} ${isFlowbuilderRouteActive || flowHover
                    ? "active"
                    : ""
                    }`}
                >
                  <LuWorkflow />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                className={collapsed ? classes.listItemTextCollapsed : ""}
                primary={
                  <Typography className={classes.listItemText}>
                    {i18n.t("mainDrawer.submenuLabels.flowbuilder")}
                  </Typography>
                }
              />
              {!collapsed && (openFlowSubmenu ? (
                <ExpandLessIcon className={classes.expandIcon} />
              ) : (
                <ExpandMoreIcon className={classes.expandIcon} />
              ))}
            </ListItem>
          </Tooltip>

          <Collapse
            in={openFlowSubmenu}
            timeout="auto"
            unmountOnExit
            className={classes.submenuCollapse}
            style={{
              backgroundColor:
                theme.mode === "light"
                  ? "rgba(120,120,120,0.1)"
                  : "rgba(120,120,120,0.5)",
            }}
          >
            <List dense component="div" disablePadding>
              <ListItemLink
                to="/phrase-lists"
                primary={i18n.t("mainDrawer.submenuLabels.flowCampaign")}
                icon={<LuMegaphone />}
                tooltip={collapsed}
                collapsed={collapsed}
              />

              <ListItemLink
                to="/flowbuilders"
                primary={i18n.t("mainDrawer.submenuLabels.flowConversation")}
                icon={<LuWorkflow />}
                tooltip={collapsed}
                collapsed={collapsed}
              />
            </List>
          </Collapse>
        </>
      )}

      <Can
        role={
          user.profile === "user" && user.allowConnections === "enabled"
            ? "admin"
            : user.profile
        }
        perform="dashboard:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader inset>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>

            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<AnnouncementIcon />}
                tooltip={collapsed}
                collapsed={collapsed}
              />
            )}

            {showExternalApi && (
              <>
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                  <ListItemLink
                    to="/messages-api"
                    primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                    icon={<CodeRoundedIcon />}
                    tooltip={collapsed}
                    collapsed={collapsed}
                  />
                  )}
                />
              </>
            )}

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/users"
                  primary={i18n.t("mainDrawer.listItems.users")}
                  icon={<PeopleAltOutlinedIcon />}
                  tooltip={collapsed}
                  collapsed={collapsed}
                />
              )}
            />

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/queues"
                  primary={i18n.t("mainDrawer.listItems.queues")}
                  icon={<AccountTreeOutlinedIcon />}
                  tooltip={collapsed}
                  collapsed={collapsed}
                />
              )}
            />

            {showOpenAi && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/prompts"
                    primary={i18n.t("mainDrawer.listItems.prompts")}
                    icon={<AllInclusive />}
                    tooltip={collapsed}
                    collapsed={collapsed}
                  />
                )}
              />
            )}

            {showIntegrations && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/queue-integration"
                    primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                    icon={<DeviceHubOutlined />}
                    tooltip={collapsed}
                    collapsed={collapsed}
                  />
                )}
              />
            )}
            <Can
              role={
                user.profile === "user" && user.allowConnections === "enabled"
                  ? "admin"
                  : user.profile
              }
              perform={"drawer-admin-items:view"}
              yes={() => (
                <ListItemLink
                  to="/connections"
                  primary={i18n.t("mainDrawer.listItems.connections")}
                  icon={<SyncAltIcon />}
                  showBadge={connectionWarning}
                  tooltip={collapsed}
                  collapsed={collapsed}
                />
              )}
            />
            {user.super && (
              <ListItemLink
                to="/allConnections"
                primary={i18n.t("mainDrawer.listItems.allConnections")}
                icon={<PhonelinkSetup />}
                tooltip={collapsed}
                collapsed={collapsed}
              />
            )}
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/financeiro"
                  primary={i18n.t("mainDrawer.listItems.financeiro")}
                  icon={<LocalAtmIcon />}
                  tooltip={collapsed}
                  collapsed={collapsed}
                />
              )}
            />
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/settings"
                  primary={i18n.t("mainDrawer.listItems.settings")}
                  icon={<SettingsOutlinedIcon />}
                  tooltip={collapsed}
                  collapsed={collapsed}
                />
              )}
            />
            {user.super && (
              <ListItemLink
                to="/companies"
                primary={i18n.t("mainDrawer.listItems.companies")}
                icon={<BusinessIcon />}
                tooltip={collapsed}
                collapsed={collapsed}
              />
            )}
          </>
        )}
      />
      {!collapsed && (
        <React.Fragment>
          <Divider />
          <Typography
            style={{
              fontSize: "12px",
              padding: "10px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {`${version}`}
          </Typography>
        </React.Fragment>
      )}
    </div>
  );
};

export default MainListItems;
