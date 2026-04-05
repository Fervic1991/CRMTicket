import React, { useContext, useState, useEffect, useMemo, useCallback, memo, useRef } from "react";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import { Groups } from "@mui/icons-material";

import CallIcon from "@material-ui/icons/Call";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from "@material-ui/icons/Send";
import MessageIcon from "@material-ui/icons/Message";
import AccessAlarmIcon from "@material-ui/icons/AccessAlarm";
import TimerIcon from "@material-ui/icons/Timer";
import * as XLSX from "xlsx";
import CheckCircleOutlineIcon from "@material-ui/icons/RecordVoiceOver";
import ErrorOutlineIcon from "@material-ui/icons/RecordVoiceOver";

import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";

import useDashboard from "../../hooks/useDashboard";
import { ChatsUser } from "./ChartsUser";

import Filters from "./Filters";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";
import { Button, Container, Box } from "@mui/material";
import { i18n } from "../../translate/i18n";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import ForbiddenPage from "../../components/ForbiddenPage";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  dashboardTitle: {
    fontFamily: "Inter, sans-serif",
    fontSize: "1.95rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: theme.palette.mode === "dark" ? "#F8FAFC" : "#1E293B",
    marginBottom: theme.spacing(0.75),
  },
  dashboardSubtitle: {
    fontFamily: "Inter, sans-serif",
    fontSize: "0.95rem",
    color: theme.palette.mode === "dark" ? "rgba(203,213,225,0.74)" : "#64748B",
    marginBottom: theme.spacing(2.5),
  },
  dashboardBackground: {
    minHeight: "100%",
    padding: theme.appTokens?.spacing?.lg || theme.spacing(2),
    background:
      theme.palette.mode === "dark"
        ? "radial-gradient(1200px 600px at 8% -10%, rgba(59,130,246,0.16), transparent 55%), radial-gradient(900px 500px at 110% 10%, rgba(16,185,129,0.14), transparent 60%), linear-gradient(180deg, rgba(2,6,23,0.98), rgba(15,23,42,0.98))"
        : "radial-gradient(1200px 600px at 8% -10%, rgba(59,130,246,0.14), transparent 55%), radial-gradient(900px 500px at 110% 10%, rgba(16,185,129,0.12), transparent 60%), linear-gradient(180deg, rgba(248,250,252,0.98), rgba(241,245,249,0.98))",
  },
  selected: {}, // Adiciona a classe selected vazia para referência
  tab: {
    minWidth: "auto",
    width: "auto",
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.appTokens?.radius?.md || 8,
    transition: "0.3s",
    borderWidth: "1px",
    borderStyle: "solid",
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),

    [theme.breakpoints.down("lg")]: {
      fontSize: "0.9rem",
      padding: theme.spacing(0.4, 0.8),
      marginRight: theme.spacing(0.4),
      marginLeft: theme.spacing(0.4),
    },
    [theme.breakpoints.down("md")]: {
      fontSize: "0.8rem",
      padding: theme.spacing(0.3, 0.6),
      marginRight: theme.spacing(0.3),
      marginLeft: theme.spacing(0.3),
    },
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(148,163,184,0.14)"
        : "rgba(15,23,42,0.06)",
    },
    "&$selected": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
    },
  },
  tabIndicator: {
    borderWidth: "2px",
    borderStyle: "solid",
    height: 6,
    bottom: 0,
    color:
      theme.palette.mode === "light"
        ? theme.palette.primary.main
        : theme.palette.primary.contrastText,
  },
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  nps: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.padding,
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 240,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  cardAvatar: {
    fontSize: "55px",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: theme.palette.primary.main,
  },
  cardSubtitle: {
    color: theme.palette.text.secondary,
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  iframeDashboard: {
    width: "100%",
    height: "calc(100vh - 64px)",
    border: "none",
  },
  customFixedHeightPaperLg: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  mainPaper: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
    backgroundColor: "transparent !important",
    borderRadius: theme.appTokens?.radius?.lg || 18,
  },
  paper: {
    padding: theme.spacing(2),
    borderRadius: theme.appTokens?.radius?.lg || 18,
    background: theme.appTokens?.glass?.background,
    border: theme.appTokens?.glass?.border,
    boxShadow: theme.appTokens?.glass?.shadow,
    backdropFilter: theme.appTokens?.glass?.blur,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(1.75),
    paddingTop: theme.spacing(1),
  },
  sectionTitle: {
    fontFamily: "Inter, sans-serif",
    fontSize: "1.35rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: theme.palette.mode === "dark" ? "#E2E8F0" : "#1E293B",
  },
  sectionHint: {
    fontSize: 12,
    color: theme.appTokens?.colors?.textMuted || (theme.palette.mode === "dark" ? "rgba(226,232,240,0.65)" : "#64748b"),
  },
  barContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.25),
    marginBottom: theme.spacing(1.25),
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.palette.mode === "dark" ? "rgba(51,65,85,0.7)" : "#E2E8F0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 900ms ease, transform 900ms ease",
    transformOrigin: "left center",
    boxShadow: "0 6px 16px rgba(59,130,246,0.18)",
  },
  progressLabel: {
    minWidth: 82,
    textAlign: "left",
    fontWeight: 600,
    color: theme.palette.mode === "light" ? "#475569" : "#CBD5E1",
  },
  progressValue: {
    minWidth: 48,
    textAlign: "right",
    fontWeight: 700,
    color: theme.palette.mode === "light" ? "#1E293B" : "#F8FAFC",
  },
  kpiCard: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(2.25),
    borderRadius: 20,
    background: theme.palette.mode === "dark"
      ? "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(15,23,42,0.74))"
      : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94))",
    border: theme.palette.mode === "dark"
      ? "1px solid rgba(148,163,184,0.16)"
      : "1px solid rgba(226,232,240,0.9)",
    boxShadow: theme.palette.mode === "dark"
      ? "0 18px 40px rgba(2,6,23,0.32)"
      : "0 18px 40px rgba(15,23,42,0.08)",
    overflow: "hidden",
    height: "100%",
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: 'var(--card-accent, linear-gradient(90deg, #2563EB, #60A5FA))',
    },
  },
  infoCard: {
    padding: theme.spacing(2.25),
    borderRadius: 20,
    background: theme.palette.mode === "dark"
      ? "linear-gradient(180deg, rgba(15,23,42,0.88), rgba(15,23,42,0.72))"
      : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94))",
    border: theme.palette.mode === "dark"
      ? "1px solid rgba(148,163,184,0.16)"
      : "1px solid rgba(226,232,240,0.92)",
    boxShadow: theme.palette.mode === "dark"
      ? "0 18px 40px rgba(2,6,23,0.3)"
      : "0 18px 40px rgba(15,23,42,0.08)",
    backdropFilter: "blur(12px)",
    marginBottom: theme.spacing(2),
    height: "100%",
  },
  infoIcon: {
    fontSize: "2rem",
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      theme.palette.mode === "dark"
        ? "rgba(30, 41, 59, 0.8)"
        : "rgba(248, 250, 252, 0.9)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.2)"
        : "1px solid rgba(148, 163, 184, 0.35)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 12px 24px rgba(0,0,0,0.35)"
        : "0 12px 24px rgba(15,23,42,0.08)",
  },
  iconModern: {
    fontSize: 28,
    color: theme.palette.mode === "dark" ? "#e2e8f0" : "#0f172a",
    filter: theme.palette.mode === "dark"
      ? "drop-shadow(0 6px 10px rgba(0,0,0,0.45))"
      : "drop-shadow(0 6px 10px rgba(15,23,42,0.15))",
  },
  iconAccent: {
    color: theme.palette.mode === "dark" ? "#38bdf8" : "#2563eb",
  },
  iconSuccess: {
    color: theme.palette.mode === "dark" ? "#34d399" : "#10b981",
  },
  iconWarning: {
    color: theme.palette.mode === "dark" ? "#f59e0b" : "#d97706",
  },
  iconDanger: {
    color: theme.palette.mode === "dark" ? "#fb7185" : "#e11d48",
  },
  filterButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(0.8, 2),
    background:
      theme.palette.mode === "dark"
        ? "rgba(15, 23, 42, 0.7)"
        : "rgba(255, 255, 255, 0.85)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.2)"
        : "1px solid rgba(148, 163, 184, 0.35)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 12px 24px rgba(0,0,0,0.35)"
        : "0 12px 24px rgba(15,23,42,0.08)",
  },
  metricValue: {
    fontFamily: "Inter, sans-serif",
    fontSize: "1.85rem",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.04em",
    color: theme.palette.mode === "dark" ? "#F8FAFC" : "#1E293B",
  },
  metricLabel: {
    marginTop: theme.spacing(0.5),
    fontSize: "0.95rem",
    fontWeight: 600,
    color: theme.palette.mode === "dark" ? "rgba(203,213,225,0.78)" : "#64748B",
  },
  ratingSummaryCard: {
    textAlign: "center",
    padding: theme.spacing(1.5),
    borderRadius: 18,
    background: theme.palette.mode === "dark" ? "rgba(245,158,11,0.14)" : "linear-gradient(180deg, rgba(255,247,237,0.98), rgba(255,237,213,0.95))",
    border: theme.palette.mode === "dark" ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(251,191,36,0.3)",
  },
}));

const indicatorThemes = {
  primary: { accent: "linear-gradient(90deg, #2563EB, #60A5FA)", soft: "rgba(59,130,246,0.12)" },
  warning: { accent: "linear-gradient(90deg, #F59E0B, #FCD34D)", soft: "rgba(245,158,11,0.14)" },
  success: { accent: "linear-gradient(90deg, #10B981, #6EE7B7)", soft: "rgba(16,185,129,0.14)" },
  danger: { accent: "linear-gradient(90deg, #F97316, #FB7185)", soft: "rgba(249,115,22,0.14)" },
};

const IndicatorCard = memo(({ label, value, icon, tone = "primary" }) => {
  const classes = useStyles();
  const cardTheme = indicatorThemes[tone] || indicatorThemes.primary;
  return (
    <Grid2 xs={12} sm={6} md={4} lg={3}>
      <Paper className={classes.kpiCard} style={{ "--card-accent": cardTheme.accent }}>
        <div className={classes.iconBadge} style={{ background: cardTheme.soft }}>
          {icon}
        </div>
        <Box>
          <Typography className={classes.metricValue}>{value}</Typography>
          <Typography className={classes.metricLabel}>{label}</Typography>
        </Box>
      </Paper>
    </Grid2>
  );
});

const NPSCard = memo(({ label, value, color }) => {
  const classes = useStyles();
  return (
    <Grid2 xs={12} md={6}>
      <Paper className={classes.paper}>
        <Box className={classes.barContainer}>
          <Typography className={classes.progressLabel}>{label}</Typography>
          <Box className={classes.progressTrack}>
            <Box className={classes.progressFill} style={{ width: `${value}%`, background: color }} />
          </Box>
          <Typography className={classes.progressValue}>{value}%</Typography>
        </Box>
      </Paper>
    </Grid2>
  );
});

const AttendanceCard = memo(({ label, value, icon, tone = "primary" }) => {
  const classes = useStyles();
  const cardTheme = indicatorThemes[tone] || indicatorThemes.primary;
  return (
    <Grid2 xs={12} sm={6} md={3}>
      <Paper className={classes.infoCard}>
        <Box display="flex" alignItems="center" gap={2}>
          <div className={classes.iconBadge} style={{ background: cardTheme.soft }}>{icon}</div>
          <Box>
            <Typography className={classes.metricValue}>{value}</Typography>
            <Typography className={classes.metricLabel}>{label}</Typography>
          </Box>
        </Box>
      </Paper>
    </Grid2>
  );
});

const Dashboard = () => {
  const theme = useTheme();
  const classes = useStyles();
  
  // Estados principais
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [messagesCount, setMessagesCount] = useState({
    sent: 0,
    received: 0,
    sentAll: 0,
    receivedAll: 0
  });
  const [contactsCount, setContactsCount] = useState({
    period: 0,
    all: 0
  });
  const [loading, setLoading] = useState(false);
  
  // Usar ref para controlar se já foi carregado
  const hasLoadedRef = useRef(false);
  const isMountedRef = useRef(true);
  
  const { find } = useDashboard();

  // Datas iniciais
  const initialDates = useMemo(() => {
    const newDate = new Date();
    const date = newDate.getDate();
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();
    const nowIni = `${year}-${month < 10 ? `0${month}` : `${month}`}-01`;
    const now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${date < 10 ? `0${date}` : `${date}`}`;
    return { nowIni, now };
  }, []);

  const [showFilter, setShowFilter] = useState(false);
  const [dateStartTicket, setDateStartTicket] = useState(initialDates.nowIni);
  const [dateEndTicket, setDateEndTicket] = useState(initialDates.now);
  const [queueTicket, setQueueTicket] = useState(false);
  const [fetchDataFilter, setFetchDataFilter] = useState(0);

  const { user } = useContext(AuthContext);

  const renderIcon = useCallback((IconComponent, accentClass = null) => {
    const className = accentClass
      ? `${classes.iconModern} ${accentClass}`
      : classes.iconModern;
    return <IconComponent className={className} />;
  }, [classes.iconModern, classes.iconAccent, classes.iconSuccess, classes.iconWarning, classes.iconDanger]);

  // Função memoizada para formatar tempo
  const formatTime = useCallback((minutes) => {
    return moment().startOf("day").add(minutes, "minutes").format("HH[h] mm[m]");
  }, []);

  // Função memoizada para contar usuários online
  const getUsersOnlineCount = useMemo(() => {
    return attendants.filter(user => user.online === true).length;
  }, [attendants]);

  // Função para buscar contagem de mensagens - otimizada
  const fetchMessagesCount = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const [sentPeriod, receivedPeriod, sentAll, receivedAll] = await Promise.all([
        api.get("/messages-allMe", {
          params: { fromMe: true, dateStart: dateStartTicket, dateEnd: dateEndTicket }
        }),
        api.get("/messages-allMe", {
          params: { fromMe: false, dateStart: dateStartTicket, dateEnd: dateEndTicket }
        }),
        api.get("/messages-allMe", {
          params: { fromMe: true }
        }),
        api.get("/messages-allMe", {
          params: { fromMe: false }
        })
      ]);

      if (isMountedRef.current) {
        setMessagesCount({
          sent: sentPeriod.data.count[0]?.count || 0,
          received: receivedPeriod.data.count[0]?.count || 0,
          sentAll: sentAll.data.count[0]?.count || 0,
          receivedAll: receivedAll.data.count[0]?.count || 0
        });
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  }, [dateStartTicket, dateEndTicket]);

  // Função para buscar contagem de contatos - otimizada
  const fetchContactsCount = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const [contactsPeriod, contactsAll] = await Promise.all([
        api.get("/contacts", {
          params: { dateStart: dateStartTicket, dateEnd: dateEndTicket }
        }),
        api.get("/contacts", {})
      ]);

      if (isMountedRef.current) {
        setContactsCount({
          period: contactsPeriod.data.count || 0,
          all: contactsAll.data.count || 0
        });
      }
    } catch (error) {
      console.error("Erro ao buscar contatos:", error);
    }
  }, [dateStartTicket, dateEndTicket]);

  // Função principal de busca de dados - otimizada
  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    
    let params = {};
    
    if (!isEmpty(dateStartTicket) && moment(dateStartTicket).isValid()) {
      params.date_from = moment(dateStartTicket).format("YYYY-MM-DD");
    }
    
    if (!isEmpty(dateEndTicket) && moment(dateEndTicket).isValid()) {
      params.date_to = moment(dateEndTicket).format("YYYY-MM-DD");
    }
    
    if (Object.keys(params).length === 0) {
      params = { days: 30 };
    }
    
    try {
      const [dashboardData] = await Promise.all([
        find(params),
        fetchMessagesCount(),
        fetchContactsCount()
      ]);
      
      if (isMountedRef.current) {
        const safeCounters = {
          avgSupportTime: 0,
          avgWaitTime: 0,
          supportFinished: 0,
          supportHappening: 0,
          supportPending: 0,
          supportGroups: 0,
          leads: 0,
          activeTickets: 0,
          passiveTickets: 0,
          tickets: 0,
          waitRating: 0,
          withoutRating: 0,
          withRating: 0,
          percRating: 0,
          npsPromotersPerc: 0,
          npsPassivePerc: 0,
          npsDetractorsPerc: 0,
          npsScore: 0,
          ...dashboardData.counters
        };
        
        setCounters(safeCounters);
        setAttendants(isArray(dashboardData.attendants) ? dashboardData.attendants : []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      if (isMountedRef.current) {
        toast.error('Erro ao carregar dados do dashboard');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [dateStartTicket, dateEndTicket, find, fetchMessagesCount, fetchContactsCount]);

  // UseEffect único e otimizado - só executa uma vez
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      const timeoutId = setTimeout(() => {
        fetchData();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, []);

  // UseEffect para mudança de filtros
  useEffect(() => {
    if (fetchDataFilter > 0) {
      fetchData();
    }
  }, [fetchDataFilter, fetchData]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Callback para toggle do filtro
  const toggleShowFilter = useCallback(() => {
    setShowFilter(prev => !prev);
  }, []);

  // Dados memoizados para os indicadores
  const indicators = useMemo(() => [
    { label: i18n.t("dashboard.cards.inAttendance"), value: counters.supportHappening || 0, icon: renderIcon(CallIcon, classes.iconAccent), tone: "primary" },
    { label: i18n.t("dashboard.cards.waiting"), value: counters.supportPending || 0, icon: renderIcon(HourglassEmptyIcon, classes.iconWarning), tone: "warning" },
    { label: i18n.t("dashboard.cards.finalized"), value: counters.supportFinished || 0, icon: renderIcon(CheckCircleIcon, classes.iconSuccess), tone: "success" },
    { label: i18n.t("dashboard.cards.groups"), value: counters.supportGroups || 0, icon: renderIcon(Groups, classes.iconAccent), tone: "primary" },
    { label: i18n.t("dashboard.cards.activeAttendants"), value: `${getUsersOnlineCount}/${attendants.length}`, icon: renderIcon(RecordVoiceOverIcon, classes.iconAccent), tone: "primary" },
    { label: i18n.t("dashboard.cards.newContacts"), value: counters.leads || 0, icon: renderIcon(GroupAddIcon, classes.iconAccent), tone: "success" },
    { label: i18n.t("dashboard.cards.totalReceivedMessages"), value: `${messagesCount.received}/${messagesCount.receivedAll}`, icon: renderIcon(MessageIcon, classes.iconAccent), tone: "primary" },
    { label: i18n.t("dashboard.cards.totalSentMessages"), value: `${messagesCount.sent}/${messagesCount.sentAll}`, icon: renderIcon(SendIcon, classes.iconSuccess), tone: "success" },
    { label: i18n.t("dashboard.cards.averageServiceTime"), value: formatTime(counters.avgSupportTime), icon: renderIcon(AccessAlarmIcon, classes.iconWarning), tone: "warning" },
    { label: i18n.t("dashboard.cards.averageWaitingTime"), value: formatTime(counters.avgWaitTime), icon: renderIcon(TimerIcon, classes.iconDanger), tone: "danger" },
    { label: i18n.t("dashboard.cards.activeTickets"), value: counters.activeTickets || 0, icon: renderIcon(ArrowUpward, classes.iconAccent), tone: "primary" },
    { label: i18n.t("dashboard.cards.passiveTickets"), value: counters.passiveTickets || 0, icon: renderIcon(ArrowDownward, classes.iconSuccess), tone: "success" },
  ], [counters, getUsersOnlineCount, attendants.length, messagesCount, formatTime, renderIcon, classes.iconAccent, classes.iconSuccess, classes.iconWarning, classes.iconDanger]);

  // Dados memoizados para NPS
  const npsData = useMemo(() => [
    { label: i18n.t("dashboard.nps.promoters"), value: counters.npsPromotersPerc || 0, color: "linear-gradient(90deg, #059669, #34D399)" },
    { label: i18n.t("dashboard.nps.neutrals"), value: counters.npsPassivePerc || 0, color: "linear-gradient(90deg, #F59E0B, #FCD34D)" },
    { label: i18n.t("dashboard.nps.detractors"), value: counters.npsDetractorsPerc || 0, color: "linear-gradient(90deg, #F97316, #FB7185)" },
  ], [counters]);

  // Dados memoizados para atendimentos
  const attendanceData = useMemo(() => [
    { label: i18n.t("dashboard.attendances.total"), value: counters.tickets || 0, icon: renderIcon(CallIcon, classes.iconAccent), tone: "primary" },
    { label: i18n.t("dashboard.attendances.waitingRating"), value: counters.waitRating || 0, icon: renderIcon(HourglassEmptyIcon, classes.iconWarning), tone: "warning" },
    { label: i18n.t("dashboard.attendances.withoutRating"), value: counters.withoutRating || 0, icon: renderIcon(ErrorOutlineIcon, classes.iconDanger), tone: "danger" },
    { label: i18n.t("dashboard.attendances.withRating"), value: counters.withRating || 0, icon: renderIcon(CheckCircleOutlineIcon, classes.iconSuccess), tone: "success" },
  ], [counters, renderIcon, classes.iconAccent, classes.iconWarning, classes.iconDanger, classes.iconSuccess]);

  // Verificação de perfil memoizada
  const shouldShowDashboard = useMemo(() => {
    return !(user?.profile === "user" && user?.showDashboard === "disabled");
  }, [user?.profile, user?.showDashboard]);

  if (!shouldShowDashboard) {
    return <ForbiddenPage />;
  }

  return (
    <MainContainer>
      <Paper className={classes.mainPaper} variant="outlined">
        <Container maxWidth={false} className={classes.dashboardBackground} style={{ maxWidth: '100%', overflowX: 'hidden' }}>
          <Grid2 container spacing={2} className={classes.container} style={{ margin: 0, width: '100%' }}>
            <Grid2 xs={12}>
              <Typography className={classes.dashboardTitle}>{i18n.t("dashboard.sections.indicators")}</Typography>
              <Typography className={classes.dashboardSubtitle}>Monitora andamento, soddisfazione e performance del team in un colpo d'occhio.</Typography>
            </Grid2>
            {/* FILTROS */}
            <Grid2 xs={12} container justifyContent="flex-end">
              <Button
                onClick={toggleShowFilter}
                color="primary"
                startIcon={!showFilter ? <FilterListIcon /> : <ClearIcon />}
                className={classes.filterButton}
              >
                {showFilter ? i18n.t("dashboard.filters.hide") : i18n.t("dashboard.filters.show")}
              </Button>
            </Grid2>

            {showFilter && (
              <Grid2 xs={12} style={{ marginBottom: "20px" }}>
                <Filters
                  classes={classes}
                  setDateStartTicket={setDateStartTicket}
                  setDateEndTicket={setDateEndTicket}
                  dateStartTicket={dateStartTicket}
                  dateEndTicket={dateEndTicket}
                  setQueueTicket={setQueueTicket}
                  queueTicket={queueTicket}
                  fetchData={setFetchDataFilter}
                />
              </Grid2>
            )}
            
            {/* Indicadores Gerais */}
            <Grid2 xs={12} className={classes.sectionHeader}>
              <Typography className={classes.sectionTitle}>
                {i18n.t("dashboard.sections.indicators")}
              </Typography>
              <Typography className={classes.sectionHint}>
                {moment(dateStartTicket).format("DD/MM")} → {moment(dateEndTicket).format("DD/MM")}
              </Typography>
            </Grid2>
            {indicators.map((indicator, index) => (
              <IndicatorCard key={`indicator-${index}`} {...indicator} />
            ))}

            {/* Pesquisa de Satisfação (NPS) */}
            <Grid2 xs={12} className={classes.sectionHeader}>
              <Typography className={classes.sectionTitle}>
                {i18n.t("dashboard.sections.satisfactionSurvey")}
              </Typography>
              <Typography className={classes.sectionHint}>
                NPS
              </Typography>
            </Grid2>
            {npsData.map((nps, index) => (
              <NPSCard key={`nps-${index}`} {...nps} />
            ))}

            {/* Informações de Atendimento */}
            <Grid2 xs={12} className={classes.sectionHeader}>
              <Typography className={classes.sectionTitle}>
                {i18n.t("dashboard.sections.attendances")}
              </Typography>
              <Typography className={classes.sectionHint}>
                {i18n.t("dashboard.cards.activeTickets")} · {i18n.t("dashboard.cards.passiveTickets")}
              </Typography>
            </Grid2>
            {attendanceData.map((attInfo, index) => (
              <AttendanceCard key={`attendance-${index}`} {...attInfo} />
            ))}

            {/* Índice de Avaliação */}
            <Grid2 xs={12} style={{ marginTop: '24px', paddingLeft: '4px', paddingRight: '4px' }}>
              <Typography className={classes.sectionTitle} style={{ marginBottom: '15px' }}>
                {i18n.t("dashboard.sections.ratingIndex")}
              </Typography>
              <Grid2 container alignItems="center" spacing={2}>
                <Grid2 xs={12} sm={2}>
                  <Paper className={classes.ratingSummaryCard}>
                    <Typography variant="h6" style={{ color: theme.palette.mode === "dark" ? "#fbbf24" : "#b45309", fontWeight: 800 }}>
                      {Number(counters.percRating / 100).toLocaleString(undefined, { style: 'percent' }) || "0%"}
                    </Typography>
                  </Paper>
                </Grid2>
                <Grid2 xs={12} sm={10}>
                  <Box className={classes.progressTrack}>
                    <Box className={classes.progressFill} style={{ width: `${counters.percRating || 0}%`, background: "linear-gradient(90deg, #F59E0B, #FCD34D)" }} />
                  </Box>
                </Grid2>
              </Grid2>
            </Grid2>

            {/* Tabela de Atendentes */}
            <Grid2 xs={12} className={classes.sectionHeader}>
              <Typography className={classes.sectionTitle}>
                {i18n.t("dashboard.sections.attendants")}
              </Typography>
              <Typography className={classes.sectionHint}>
                {i18n.t("dashboard.cards.activeAttendants")}
              </Typography>
            </Grid2>
            <Grid2 xs={12} style={{ marginTop: '4px', paddingLeft: '4px' }}>
              <Paper className={classes.paper}>
                <TableAttendantsStatus
                  attendants={attendants}
                  loading={loading}
                />
              </Paper>
            </Grid2>

            {/* Gráficos */}
            <Grid2 container spacing={3} xs={12}>
              <Grid2 xs={12} md={6}>
                <Paper className={classes.paper} style={{ marginBottom: "16px" }}>
                  <ChatsUser />
                </Paper>
              </Grid2>
              <Grid2 xs={12} md={6}>
                <Paper className={classes.paper}>
                  <ChartsDate />
                </Paper>
              </Grid2>
            </Grid2>
          </Grid2>
        </Container>
      </Paper>
    </MainContainer>
  );
};

export default Dashboard;
