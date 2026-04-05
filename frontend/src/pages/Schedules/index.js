import React, {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useContext,
} from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ScheduleModal from "../../components/ScheduleModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import moment from "moment";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "moment/locale/it";
import "react-big-calendar/lib/css/react-big-calendar.css";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import AddIcon from "@material-ui/icons/Add";

import "./Schedules.css";

function getUrlParam(paramName) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(paramName);
}

const eventTitleStyle = {
  fontSize: "13px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  fontWeight: 600,
};

moment.locale("it");
const localizer = momentLocalizer(moment);

const defaultMessages = {
  date: i18n.t("schedules.date"),
  time: i18n.t("schedules.time"),
  event: i18n.t("schedules.event"),
  allDay: i18n.t("schedules.allDay"),
  week: i18n.t("schedules.week"),
  work_week: i18n.t("schedules.work_week"),
  day: i18n.t("schedules.day"),
  month: i18n.t("schedules.month"),
  previous: i18n.t("schedules.previous"),
  next: i18n.t("schedules.next"),
  yesterday: i18n.t("schedules.yesterday"),
  tomorrow: i18n.t("schedules.tomorrow"),
  today: i18n.t("schedules.today"),
  agenda: i18n.t("schedules.agenda"),
  noEventsInRange: i18n.t("schedules.noEventsInRange"),
  showMore: total => `+${total} altri`,
};

const reducer = (state, action) => {
  if (action.type === "LOAD_SCHEDULES") {
    const schedules = action.payload;
    const newSchedules = [];

    schedules.forEach(schedule => {
      const scheduleIndex = state.findIndex(s => s.id === schedule.id);
      if (scheduleIndex !== -1) {
        state[scheduleIndex] = schedule;
      } else {
        newSchedules.push(schedule);
      }
    });

    return [...state, ...newSchedules];
  }

  if (action.type === "UPDATE_SCHEDULES") {
    const schedule = action.payload;
    const scheduleIndex = state.findIndex(s => s.id === schedule.id);

    if (scheduleIndex !== -1) {
      state[scheduleIndex] = schedule;
      return [...state];
    }

    return [schedule, ...state];
  }

  if (action.type === "DELETE_SCHEDULE") {
    const scheduleId = action.payload;
    const scheduleIndex = state.findIndex(s => s.id === scheduleId);
    if (scheduleIndex !== -1) {
      state.splice(scheduleIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  return state;
};

const capitalize = value => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const CustomToolbar = ({ label, onNavigate, onView, view }) => {
  const viewOptions = [
    { value: Views.MONTH, label: i18n.t("schedules.month") },
    { value: Views.WEEK, label: i18n.t("schedules.week") },
    { value: Views.DAY, label: i18n.t("schedules.day") },
    { value: Views.AGENDA, label: i18n.t("schedules.agenda") },
  ];

  return (
    <div className="modern-schedules-toolbar">
      <div className="modern-schedules-toolbar__left">
        <div className="modern-schedules-toolbar__period">{capitalize(label)}</div>
        <div className="modern-schedules-toolbar__nav">
          <Button
            className="modern-schedules-toolbar__today"
            onClick={() => onNavigate("TODAY")}
          >
            {i18n.t("schedules.today")}
          </Button>
          <div className="modern-schedules-toolbar__icon-group">
            <IconButton
              size="small"
              className="modern-schedules-toolbar__icon-button"
              onClick={() => onNavigate("PREV")}
              aria-label={i18n.t("schedules.previous")}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              className="modern-schedules-toolbar__icon-button"
              onClick={() => onNavigate("NEXT")}
              aria-label={i18n.t("schedules.next")}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </div>
      <div className="modern-schedules-toolbar__views">
        {viewOptions.map(option => (
          <button
            key={option.value}
            type="button"
            className={`modern-schedules-toolbar__view ${view === option.value ? "is-active" : ""}`}
            onClick={() => onView(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const DateCellWrapper = ({ children, value, onQuickAdd }) => {
  return (
    <div className="modern-date-cell-wrapper">
      {children}
      <button
        type="button"
        className="modern-date-cell-wrapper__add"
        aria-label={`${i18n.t("schedules.buttons.add")} ${moment(value).format("DD/MM")}`}
        onClick={event => {
          event.stopPropagation();
          onQuickAdd(value);
        }}
      >
        <AddIcon style={{ fontSize: 16 }} />
      </button>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2.5),
    overflowY: "auto",
    ...theme.scrollbarStyles,
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(180deg, rgba(20,24,38,0.98) 0%, rgba(12,14,22,0.98) 100%)"
        : "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    border: theme.palette.mode === "dark"
      ? "1px solid rgba(255,255,255,0.06)"
      : "1px solid rgba(226,232,240,0.9)",
    borderRadius: 18,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 24px 48px rgba(0,0,0,0.35)"
        : "0 24px 48px rgba(15,23,42,0.08)",
  },
  headerCard: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: 18,
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, rgba(76,110,245,0.35) 0%, rgba(15,118,110,0.25) 100%)"
        : "linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(14,165,233,0.1) 45%, rgba(16,185,129,0.08) 100%)",
    border: theme.palette.mode === "dark"
      ? "1px solid rgba(148,163,184,0.18)"
      : "1px solid rgba(148,163,184,0.24)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 18px 36px rgba(0,0,0,0.35)"
        : "0 18px 36px rgba(15,23,42,0.06)",
  },
  headerTitle: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    color: theme.palette.mode === "dark" ? "#f8fafc" : "#1E293B",
    '& h2, & h1, & .MuiTypography-root': {
      color: "inherit",
    },
  },
  headerMeta: {
    fontSize: 13,
    fontWeight: 500,
    color: theme.palette.mode === "dark" ? "rgba(248,250,252,0.72)" : "#64748B",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  searchField: {
    minWidth: 240,
    '& .MuiOutlinedInput-root': {
      minHeight: 42,
      borderRadius: 999,
      background: theme.palette.mode === "dark" ? "rgba(15,23,42,0.7)" : "#F8FAFC",
      transition: "all 0.2s ease",
      '& fieldset': {
        borderColor: theme.palette.mode === "dark" ? "rgba(148,163,184,0.2)" : "rgba(226,232,240,0.95)",
      },
      '&:hover fieldset': {
        borderColor: theme.palette.mode === "dark" ? "rgba(56,189,248,0.35)" : "rgba(59,130,246,0.28)",
      },
      '&.Mui-focused': {
        background: theme.palette.mode === "dark" ? "rgba(15,23,42,0.9)" : "#fff",
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.mode === "dark" ? "rgba(56,189,248,0.45)" : "rgba(59,130,246,0.4)",
      },
    },
  },
  addButton: {
    borderRadius: 12,
    padding: theme.spacing(1.2, 2.4),
    minHeight: 42,
    fontWeight: 700,
    textTransform: "none",
    color: "#fff",
    background: "linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 12px 30px rgba(56,189,248,0.35)"
        : "0 12px 30px rgba(59,130,246,0.22)",
    '&:hover': {
      background: "linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)",
      transform: "translateY(-1px)",
    },
  },
  calendarShell: {
    '& .rbc-calendar': {
      minHeight: 640,
    },
  },
}));

const Schedules = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, dispatch] = useReducer(reducer, []);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(+getUrlParam("contactId"));

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useSchedules) {
        toast.error(i18n.t("schedules.errors.noPermission"));
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
  }, [user, history, getPlanCompany]);

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_SCHEDULES", payload: data.schedules });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const handleOpenScheduleModalFromContactId = useCallback(() => {
    if (contactId) {
      handleOpenScheduleModal();
    }
  }, [contactId]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchSchedules();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [
    searchParam,
    pageNumber,
    contactId,
    fetchSchedules,
    handleOpenScheduleModalFromContactId,
  ]);

  useEffect(() => {
    const onCompanySchedule = data => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedule });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_SCHEDULE", payload: +data.scheduleId });
      }
    };

    socket.on(`company${user.companyId}-schedule`, onCompanySchedule);

    return () => {
      socket.off(`company${user.companyId}-schedule`, onCompanySchedule);
    };
  }, [socket, user.companyId]);

  const cleanContact = () => {
    setContactId("");
  };

  const handleOpenScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(false);
  };

  const handleQuickAddSchedule = date => {
    setSelectedSchedule({ sendAt: date });
    setScheduleModalOpen(true);
  };

  const handleSearch = event => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditSchedule = schedule => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async scheduleId => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingSchedule(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchSchedules();
  };

  const loadMore = () => {
    setPageNumber(prevState => prevState + 1);
  };

  const handleScroll = e => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const dayPropGetter = date => ({
    className: moment().isSame(date, "day") ? "rbc-day-slot--today" : "",
  });

  const eventPropGetter = () => ({
    className: "modern-schedule-event",
  });

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingSchedule && `${i18n.t("schedules.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteSchedule(deletingSchedule.id)}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      {scheduleModalOpen && (
        <ScheduleModal
          open={scheduleModalOpen}
          onClose={handleCloseScheduleModal}
          reload={fetchSchedules}
          scheduleId={selectedSchedule ? selectedSchedule.id : null}
          contactId={contactId}
          cleanContact={cleanContact}
          user={user}
        />
      )}
      <MainHeader>
        <div className={classes.headerCard}>
          <div className={classes.headerTitle}>
            <Title>
              {i18n.t("schedules.title")} ({schedules.length})
            </Title>
            <span className={classes.headerMeta}>
              {i18n.t("schedules.month")} - {i18n.t("schedules.week")} - {i18n.t("schedules.day")}
            </span>
          </div>
          <div className={classes.headerActions}>
            <MainHeaderButtonsWrapper>
              <TextField
                className={classes.searchField}
                placeholder={i18n.t("contacts.searchPlaceholder")}
                type="search"
                value={searchParam}
                onChange={handleSearch}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "#94A3B8", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                className={classes.addButton}
                variant="contained"
                color="primary"
                onClick={handleOpenScheduleModal}
                startIcon={<AddIcon />}
              >
                {i18n.t("schedules.buttons.add")}
              </Button>
            </MainHeaderButtonsWrapper>
          </div>
        </div>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <div className={classes.calendarShell}>
          <Calendar
            messages={defaultMessages}
            formats={{
              agendaDateFormat: "DD/MM ddd",
              weekdayFormat: date => capitalize(moment(date).format("dddd")),
              dayHeaderFormat: date => capitalize(moment(date).format("dddd D MMMM")),
              dayFormat: date => moment(date).format("D"),
            }}
            components={{
              toolbar: CustomToolbar,
              dateCellWrapper: props => (
                <DateCellWrapper {...props} onQuickAdd={handleQuickAddSchedule} />
              ),
            }}
            localizer={localizer}
            events={schedules.map(schedule => ({
              title: (
                <div key={schedule.id} className="event-container">
                  <div style={eventTitleStyle}>{schedule?.contact?.name}</div>
                  <DeleteOutlineIcon
                    onClick={event => {
                      event.stopPropagation();
                      setDeletingSchedule(schedule);
                      setConfirmModalOpen(true);
                    }}
                    className="delete-icon"
                  />
                  <EditIcon
                    onClick={event => {
                      event.stopPropagation();
                      handleEditSchedule(schedule);
                    }}
                    className="edit-icon"
                  />
                </div>
              ),
              start: new Date(schedule.sendAt),
              end: new Date(schedule.sendAt),
            }))}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 720 }}
            className="modern-schedules-calendar"
            dayPropGetter={dayPropGetter}
            eventPropGetter={eventPropGetter}
          />
        </div>
      </Paper>
    </MainContainer>
  );
};

export default Schedules;
