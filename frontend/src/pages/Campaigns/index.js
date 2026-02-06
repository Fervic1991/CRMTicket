/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";

import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Tooltip from "@material-ui/core/Tooltip";
import Chip from "@material-ui/core/Chip";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import DescriptionIcon from "@material-ui/icons/Description";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import RepeatIcon from "@material-ui/icons/Repeat";
import StopIcon from "@material-ui/icons/Stop";
import ScheduleIcon from "@material-ui/icons/Schedule";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CampaignModal from "../../components/CampaignModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid, FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import { isArray } from "lodash";
import { useDate } from "../../hooks/useDate";
import ForbiddenPage from "../../components/ForbiddenPage";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CAMPAIGNS") {
    const campaigns = action.payload;
    const newCampaigns = [];

    if (isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const campaignIndex = state.findIndex((u) => u.id === campaign.id);
        if (campaignIndex !== -1) {
          state[campaignIndex] = campaign;
        } else {
          newCampaigns.push(campaign);
        }
      });
    }

    return [...state, ...newCampaigns];
  }

  if (action.type === "UPDATE_CAMPAIGNS") {
    const campaign = action.payload;
    const campaignIndex = state.findIndex((u) => u.id === campaign.id);

    if (campaignIndex !== -1) {
      state[campaignIndex] = campaign;
      return [...state];
    } else {
      return [campaign, ...state];
    }
  }

  if (action.type === "DELETE_CAMPAIGN") {
    const campaignId = action.payload;

    const campaignIndex = state.findIndex((u) => u.id === campaignId);
    if (campaignIndex !== -1) {
      state.splice(campaignIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  pageShell: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  headerCard: {
    width: "100%",
    borderRadius: 18,
    padding: theme.spacing(2),
    background: "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(245,248,255,0.9))",
    border: "1px solid rgba(120,130,160,0.18)",
    boxShadow: "0 18px 45px rgba(31, 45, 61, 0.08)",
  },
  headerTitle: {
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  headerActions: {
    alignItems: "center",
  },
  searchField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.85)",
      border: "1px solid rgba(120,130,160,0.25)",
      transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      "&:hover": {
        borderColor: "rgba(120,130,160,0.45)",
      },
      "&.Mui-focused": {
        boxShadow: "0 0 0 3px rgba(63,81,181,0.12)",
        borderColor: theme.palette.primary.main,
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "10px 12px",
    },
  },
  addButton: {
    height: 44,
    borderRadius: 14,
    fontWeight: 600,
    textTransform: "none",
    background: "linear-gradient(135deg, rgba(63,81,181,0.9), rgba(25,118,210,0.95))",
    boxShadow: "0 12px 28px rgba(63,81,181,0.3)",
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1.5),
    borderRadius: 18,
    background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,255,0.95) 100%)",
    border: "1px solid rgba(120,130,160,0.18)",
    boxShadow: "0 20px 55px rgba(31, 45, 61, 0.08)",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  recurringChip: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: '0.75rem',
  },
  statusChip: {
    borderRadius: 999,
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  statusInactive: {
    background: "linear-gradient(135deg, rgba(120,130,160,0.2), rgba(200,205,220,0.35))",
    color: theme.palette.text.primary,
  },
  statusScheduled: {
    background: "linear-gradient(135deg, rgba(63,81,181,0.2), rgba(98,125,240,0.35))",
    color: theme.palette.primary.dark,
  },
  statusRunning: {
    background: "linear-gradient(135deg, rgba(233,30,99,0.18), rgba(255,128,171,0.35))",
    color: theme.palette.secondary.dark,
  },
  statusCanceled: {
    background: "linear-gradient(135deg, rgba(244,67,54,0.18), rgba(255,171,145,0.35))",
    color: "#b71c1c",
  },
  statusFinished: {
    background: "linear-gradient(135deg, rgba(76,175,80,0.18), rgba(165,214,167,0.35))",
    color: "#1b5e20",
  },
  nextExecutionCell: {
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  filterContainer: {
    borderRadius: 16,
    padding: theme.spacing(2),
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(120,130,160,0.18)",
    boxShadow: "0 12px 30px rgba(31, 45, 61, 0.06)",
  },
  filterSelect: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.9)",
    },
  },
  summaryBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    alignItems: "center",
    padding: theme.spacing(1.5),
    borderRadius: 16,
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(120,130,160,0.18)",
    boxShadow: "0 12px 30px rgba(31, 45, 61, 0.06)",
  },
  summaryChip: {
    borderRadius: 999,
    padding: "2px 6px",
    background: "rgba(63,81,181,0.08)",
    border: "1px solid rgba(63,81,181,0.2)",
    fontWeight: 600,
  },
  summaryCount: {
    marginLeft: 6,
    fontWeight: 700,
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: "rgba(243,246,252,0.9)",
    color: theme.palette.text.secondary,
    borderBottom: "1px solid rgba(120,130,160,0.2)",
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: "0 10px",
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
  emptyState: {
    padding: theme.spacing(3),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const Campaigns = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [stopRecurrenceModalOpen, setStopRecurrenceModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [recurrenceFilter, setRecurrenceFilter] = useState("");
  const [campaigns, dispatch] = useReducer(reducer, []);
  const { user, socket } = useContext(AuthContext);

  const { datetimeToClient } = useDate();
  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useCampaigns) {
        toast.error(i18n.t("campaigns.permissionError"));
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam, statusFilter, recurrenceFilter]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchCampaigns();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, statusFilter, recurrenceFilter]);

  useEffect(() => {
    const companyId = user.companyId;

    const onCompanyCampaign = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CAMPAIGNS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CAMPAIGN", payload: +data.id });
      }
    }

    socket.on(`company-${companyId}-campaign`, onCompanyCampaign);
    return () => {
      socket.off(`company-${companyId}-campaign`, onCompanyCampaign);
    };
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get("/campaigns/", {
        params: { 
          searchParam, 
          pageNumber, 
          status: statusFilter,
          isRecurring: recurrenceFilter 
        },
      });
      dispatch({ type: "LOAD_CAMPAIGNS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(true);
  };

  const handleCloseCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(false);
    fetchCampaigns();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleRecurrenceFilterChange = (event) => {
    setRecurrenceFilter(event.target.value);
  };

  const handleEditCampaign = (campaign) => {
    console.log('Editing campaign:', campaign);
    setSelectedCampaign(campaign);
    setCampaignModalOpen(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/campaigns/${campaignId}`);
      toast.success(i18n.t("campaigns.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingCampaign(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleStopRecurrence = async (campaignId) => {
    try {
      await api.post(`/campaigns/${campaignId}/stop-recurrence`);
      toast.success(i18n.t("campaigns.recurrence.stopSuccess"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toastError(err);
    }
    setStopRecurrenceModalOpen(false);
    setSelectedCampaign(null);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const formatStatus = (val) => {
    switch (val) {
      case "INATIVA":
        return i18n.t("campaigns.status.inactive");
      case "PROGRAMADA":
        return i18n.t("campaigns.status.scheduled");
      case "EM_ANDAMENTO":
        return i18n.t("campaigns.status.inProgress");
      case "CANCELADA":
        return i18n.t("campaigns.status.canceled");
      case "FINALIZADA":
        return i18n.t("campaigns.status.finished");
      default:
        return val;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "INATIVA":
        return "default";
      case "PROGRAMADA":
        return "primary";
      case "EM_ANDAMENTO":
        return "secondary";
      case "CANCELADA":
        return "default";
      case "FINALIZADA":
        return "default";
      default:
        return "default";
    }
  };

  const formatRecurrenceType = (type) => {
    switch (type) {
      case "daily":
        return i18n.t("campaigns.recurrence.type.daily");
      case "weekly":
        return i18n.t("campaigns.recurrence.type.weekly");
      case "biweekly":
        return i18n.t("campaigns.recurrence.type.biweekly");
      case "monthly":
        return i18n.t("campaigns.recurrence.type.monthly");
      case "yearly":
        return i18n.t("campaigns.recurrence.type.yearly");
      default:
        return type;
    }
  };

  const campaignStats = campaigns.reduce(
    (acc, campaign) => {
      acc.total += 1;
      switch (campaign.status) {
        case "INATIVA":
          acc.inactive += 1;
          break;
        case "PROGRAMADA":
          acc.scheduled += 1;
          break;
        case "EM_ANDAMENTO":
          acc.inProgress += 1;
          break;
        case "CANCELADA":
          acc.canceled += 1;
          break;
        case "FINALIZADA":
          acc.finished += 1;
          break;
        default:
          break;
      }
      return acc;
    },
    {
      total: 0,
      inactive: 0,
      scheduled: 0,
      inProgress: 0,
      canceled: 0,
      finished: 0,
    }
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "INATIVA":
        return classes.statusInactive;
      case "PROGRAMADA":
        return classes.statusScheduled;
      case "EM_ANDAMENTO":
        return classes.statusRunning;
      case "CANCELADA":
        return classes.statusCanceled;
      case "FINALIZADA":
        return classes.statusFinished;
      default:
        return classes.statusInactive;
    }
  };

  const cancelCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingCampaign &&
          `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${deletingCampaign.name}?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCampaign(deletingCampaign.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <ConfirmationModal
        title={i18n.t("campaigns.recurrence.stopTitle")}
        open={stopRecurrenceModalOpen}
        onClose={() => setStopRecurrenceModalOpen(false)}
        onConfirm={() => handleStopRecurrence(selectedCampaign?.id)}
      >
        {i18n.t("campaigns.recurrence.stopMessage")}
      </ConfirmationModal>

      {campaignModalOpen && (
        <CampaignModal
          resetPagination={() => {
            setPageNumber(1);
            fetchCampaigns();
          }}
          open={campaignModalOpen}
          onClose={handleCloseCampaignModal}
          aria-labelledby="form-dialog-title"
          campaignId={selectedCampaign && selectedCampaign.id}
        />
      )}
      {
        user.profile === "user" && user?.showCampaign === "disabled" ?
          <ForbiddenPage />
          :
          <>
            <MainHeader>
              <Grid style={{ width: "100%" }} container className={classes.headerCard} spacing={2}>
                <Grid xs={12} sm={8} item>
                  <Title className={classes.headerTitle}>{i18n.t("campaigns.title")}</Title>
                </Grid>
                <Grid xs={12} sm={4} item>
                  <Grid spacing={2} container className={classes.headerActions}>
                    <Grid xs={12} sm={6} item>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder={i18n.t("campaigns.searchPlaceholder")}
                        type="search"
                        value={searchParam}
                        onChange={handleSearch}
                        className={classes.searchField}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon style={{ color: "gray" }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid xs={12} sm={6} item>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleOpenCampaignModal}
                        color="primary"
                        className={classes.addButton}
                      >
                        {i18n.t("campaigns.buttons.add")}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </MainHeader>

            <Paper className={classes.summaryBar}>
              <span className={classes.summaryChip}>
                {i18n.t("campaigns.summary.total")}
                <span className={classes.summaryCount}>{campaignStats.total}</span>
              </span>
              <span className={classes.summaryChip}>
                {i18n.t("campaigns.summary.scheduled")}
                <span className={classes.summaryCount}>{campaignStats.scheduled}</span>
              </span>
              <span className={classes.summaryChip}>
                {i18n.t("campaigns.summary.inProgress")}
                <span className={classes.summaryCount}>{campaignStats.inProgress}</span>
              </span>
              <span className={classes.summaryChip}>
                {i18n.t("campaigns.summary.finished")}
                <span className={classes.summaryCount}>{campaignStats.finished}</span>
              </span>
              <span className={classes.summaryChip}>
                {i18n.t("campaigns.summary.canceled")}
                <span className={classes.summaryCount}>{campaignStats.canceled}</span>
              </span>
              <span className={classes.summaryChip}>
                {i18n.t("campaigns.summary.inactive")}
                <span className={classes.summaryCount}>{campaignStats.inactive}</span>
              </span>
            </Paper>

            {/* Filtros */}
            <Paper className={classes.filterContainer} style={{ marginBottom: 8 }}>
              <Grid spacing={2} container>
                <Grid xs={12} sm={4} item>
                  <FormControl fullWidth variant="outlined" size="small" className={classes.filterSelect}>
                    <InputLabel>{i18n.t("campaigns.filters.statusFilter")}</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      label={i18n.t("campaigns.filters.statusFilter")}
                    >
                      <MenuItem value="">{i18n.t("campaigns.filters.all")}</MenuItem>
                      <MenuItem value="INATIVA">{i18n.t("campaigns.status.inactive")}</MenuItem>
                      <MenuItem value="PROGRAMADA">{i18n.t("campaigns.status.scheduled")}</MenuItem>
                      <MenuItem value="EM_ANDAMENTO">{i18n.t("campaigns.status.inProgress")}</MenuItem>
                      <MenuItem value="CANCELADA">{i18n.t("campaigns.status.canceled")}</MenuItem>
                      <MenuItem value="FINALIZADA">{i18n.t("campaigns.status.finished")}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={4} item>
                  <FormControl fullWidth variant="outlined" size="small" className={classes.filterSelect}>
                    <InputLabel>{i18n.t("campaigns.filters.recurrenceFilter")}</InputLabel>
                    <Select
                      value={recurrenceFilter}
                      onChange={handleRecurrenceFilterChange}
                      label={i18n.t("campaigns.filters.recurrenceFilter")}
                    >
                      <MenuItem value="">{i18n.t("campaigns.filters.allRecurrence")}</MenuItem>
                      <MenuItem value="true">{i18n.t("campaigns.filters.recurring")}</MenuItem>
                      <MenuItem value="false">{i18n.t("campaigns.filters.single")}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            <Paper
              className={classes.mainPaper}
              variant="outlined"
              onScroll={handleScroll}
            >
              <Table size="small" className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("campaigns.table.name")}
                    </TableCell>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("campaigns.table.status")}
                    </TableCell>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("campaigns.table.recurrence")}
                    </TableCell>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("campaigns.table.contactList")}
                    </TableCell>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("campaigns.table.whatsapp")}
                    </TableCell>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("campaigns.table.scheduledAt")}
                    </TableCell>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("campaigns.table.nextExecution")}
                    </TableCell>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("campaigns.table.completedAt")}
                    </TableCell>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("campaigns.table.confirmation")}
                    </TableCell>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("campaigns.table.actions")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id} className={classes.tableRow}>
                        <TableCell align="center">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {campaign.isRecurring && (
                              <Tooltip title={i18n.t("campaigns.tooltips.recurringCampaign")}>
                                <RepeatIcon color="primary" fontSize="small" />
                              </Tooltip>
                            )}
                            {campaign.name}
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={formatStatus(campaign.status)}
                            color={getStatusColor(campaign.status)}
                            size="small"
                            className={`${classes.statusChip} ${getStatusClass(campaign.status)}`}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {campaign.isRecurring ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <Chip
                                label={formatRecurrenceType(campaign.recurrenceType)}
                                className={classes.recurringChip}
                                size="small"
                              />
                              <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                {campaign.executionCount || 0} {i18n.t("campaigns.recurrence.executions")}
                              </span>
                            </div>
                          ) : (
                            <Chip
                              label={i18n.t("campaigns.recurrence.single")}
                              variant="outlined"
                              size="small"
                              className={classes.statusChip}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {campaign.contactListId
                            ? campaign.contactList?.name || i18n.t("campaigns.listRemoved")
                            : campaign.tagListId && campaign.tagListId !== "Nenhuma"
                            ? `${i18n.t("campaigns.tag")}: ${campaign.tagListId}`
                            : i18n.t("campaigns.notDefinedFemale")}
                        </TableCell>
                        <TableCell align="center">
                          {campaign.whatsappId
                            ? campaign.whatsapp?.name || i18n.t("campaigns.whatsappRemoved")
                            : i18n.t("campaigns.notDefined")}
                        </TableCell>
                        <TableCell align="center">
                          {campaign.scheduledAt
                            ? datetimeToClient(campaign.scheduledAt)
                            : i18n.t("campaigns.noSchedule")}
                        </TableCell>
                        <TableCell align="center" className={classes.nextExecutionCell}>
                          {campaign.isRecurring && campaign.nextScheduledAt ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                              <ScheduleIcon fontSize="small" color="primary" />
                              {datetimeToClient(campaign.nextScheduledAt)}
                            </div>
                          ) : campaign.isRecurring && campaign.status === 'FINALIZADA' ? (
                            <span style={{ color: '#666', fontSize: '0.875rem' }}>
                              {i18n.t("campaigns.recurrence.finished")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {campaign.completedAt
                            ? datetimeToClient(campaign.completedAt)
                            : i18n.t("campaigns.notCompleted")}
                        </TableCell>
                        <TableCell align="center">
                          {campaign.confirmation ? i18n.t("campaigns.enabled") : i18n.t("campaigns.disabled")}
                        </TableCell>
                        <TableCell align="center">
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                            {campaign.status === "EM_ANDAMENTO" && (
                              <Tooltip title={i18n.t("campaigns.tooltips.stop")}>
                                <IconButton
                                  onClick={() => cancelCampaign(campaign)}
                                  size="small"
                                  className={classes.actionButton}
                                >
                                  <PauseCircleOutlineIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {campaign.status === "CANCELADA" && (
                              <Tooltip title={i18n.t("campaigns.tooltips.restart")}>
                                <IconButton
                                  onClick={() => restartCampaign(campaign)}
                                  size="small"
                                  className={classes.actionButton}
                                >
                                  <PlayCircleOutlineIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {campaign.isRecurring && campaign.status !== "FINALIZADA" && (
                              <Tooltip title={i18n.t("campaigns.tooltips.stopRecurrence")}>
                                <IconButton
                                  onClick={() => {
                                    setSelectedCampaign(campaign);
                                    setStopRecurrenceModalOpen(true);
                                  }}
                                  size="small"
                                  color="secondary"
                                  className={classes.actionButton}
                                >
                                  <StopIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title={i18n.t("campaigns.tooltips.report")}>
                              <IconButton
                                onClick={() =>
                                  history.push(`/campaign/${campaign.id}/report`)
                                }
                                size="small"
                                className={classes.actionButton}
                              >
                                <DescriptionIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={i18n.t("campaigns.tooltips.edit")}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleEditCampaign(campaign)}
                                    disabled={campaign.status === "EM_ANDAMENTO"}  // ✅ DISABILITA SE IN CORSO
                                    className={classes.actionButton}
                                  >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={i18n.t("campaigns.tooltips.delete")}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  setConfirmModalOpen(true);
                                  setDeletingCampaign(campaign);
                                }}
                                className={classes.actionButton}
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {loading && <TableRowSkeleton columns={10} />}
                    {!loading && campaigns.length === 0 && (
                      <TableRow>
                        <TableCell align="center" colSpan={10} className={classes.emptyState}>
                          <div style={{ fontWeight: 600, marginBottom: 6 }}>
                            {i18n.t("campaigns.emptyState.title")}
                          </div>
                          <div>{i18n.t("campaigns.emptyState.description")}</div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                </TableBody>
              </Table>
            </Paper>
          </>}
    </MainContainer>
  );
};

export default Campaigns;
