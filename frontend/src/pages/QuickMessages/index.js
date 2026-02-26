import React, { useState, useEffect, useReducer, useContext, useCallback } from "react";
import { toast } from "react-toastify";

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
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import QuickMessageDialog from "../../components/QuickMessageDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid } from "@material-ui/core";
import { isArray } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_QUICKMESSAGES") {
    const quickmessages = action.payload;
    const newQuickmessages = [];

    if (isArray(quickmessages)) {
      quickmessages.forEach((quickemessage) => {
        const quickemessageIndex = state.findIndex(
          (u) => u.id === quickemessage.id
        );
        if (quickemessageIndex !== -1) {
          state[quickemessageIndex] = quickemessage;
        } else {
          newQuickmessages.push(quickemessage);
        }
      });
    }

    return [...state, ...newQuickmessages];
  }

  if (action.type === "UPDATE_QUICKMESSAGES") {
    const quickemessage = action.payload;
    const quickemessageIndex = state.findIndex((u) => u.id === quickemessage.id);

    if (quickemessageIndex !== -1) {
      state[quickemessageIndex] = quickemessage;
      return [...state];
    } else {
      return [quickemessage, ...state];
    }
  }

  if (action.type === "DELETE_QUICKMESSAGE") {
    const quickemessageId = action.payload;

    const quickemessageIndex = state.findIndex((u) => u.id === quickemessageId);
    if (quickemessageIndex !== -1) {
      state.splice(quickemessageIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
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
        ? "linear-gradient(135deg, rgba(59,130,246,0.28), rgba(16,185,129,0.18))"
        : "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(16,185,129,0.16))",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.2)"
        : "1px solid rgba(148, 163, 184, 0.35)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 18px 40px rgba(0,0,0,0.4)"
        : "0 18px 40px rgba(15,23,42,0.08)",
  },
  headerMeta: {
    fontSize: 12,
    color: theme.palette.mode === "dark" ? "rgba(226,232,240,0.7)" : "#64748b",
  },
  searchField: {
    "& .MuiInputBase-root": {
      borderRadius: 12,
      background:
        theme.palette.mode === "dark"
          ? "rgba(15, 23, 42, 0.7)"
          : "rgba(255, 255, 255, 0.9)",
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 12px 24px rgba(0,0,0,0.35)"
          : "0 12px 24px rgba(15,23,42,0.08)",
    },
  },
  addButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    borderRadius: 18,
    background:
      theme.palette.mode === "dark"
        ? "rgba(15, 23, 42, 0.7)"
        : "rgba(255, 255, 255, 0.82)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.2)"
        : "1px solid rgba(148, 163, 184, 0.35)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 18px 40px rgba(0,0,0,0.4)"
        : "0 18px 40px rgba(15,23,42,0.08)",
    backdropFilter: "blur(10px)",
    ...theme.scrollbarStyles,
  },
  tableHeadCell: {
    fontWeight: 700,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: theme.palette.mode === "dark" ? "#e2e8f0" : "#0f172a",
    borderBottom:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.2)"
        : "1px solid rgba(148, 163, 184, 0.35)",
    background:
      theme.palette.mode === "dark"
        ? "rgba(30, 41, 59, 0.7)"
        : "rgba(248, 250, 252, 0.9)",
  },
  tableRow: {
    "&:hover": {
      background:
        theme.palette.mode === "dark"
          ? "rgba(30, 41, 59, 0.5)"
          : "rgba(226, 232, 240, 0.6)",
    },
  },
  tableCell: {
    borderBottom:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.15)"
        : "1px solid rgba(148, 163, 184, 0.25)",
  },
  actionButton: {
    borderRadius: 12,
    padding: 6,
    marginLeft: 6,
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
        ? "0 10px 24px rgba(0,0,0,0.35)"
        : "0 10px 24px rgba(15,23,42,0.08)",
  },
  mediaChip: {
    fontSize: '0.75rem',
    height: 24
  }
}));

const Quickemessages = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedQuickemessage, setSelectedQuickemessage] = useState(null);
  const [deletingQuickemessage, setDeletingQuickemessage] = useState(null);
  const [quickemessageModalOpen, setQuickMessageDialogOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [quickemessages, dispatch] = useReducer(reducer, []);
  const { user, socket } = useContext(AuthContext);

  const { profile } = user;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchQuickemessages();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;

    const onQuickMessageEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUICKMESSAGES", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUICKMESSAGE", payload: +data.id });
      }
    };
    socket.on(`company-${companyId}-quickemessage`, onQuickMessageEvent);

    return () => {
      socket.off(`company-${companyId}-quickemessage`, onQuickMessageEvent);
    };
  }, [socket]);

  const fetchQuickemessages = async () => {
    try {
      const companyId = user.companyId;
      const { data } = await api.get("/quick-messages", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_QUICKMESSAGES", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenQuickMessageDialog = () => {
    setSelectedQuickemessage(null);
    setQuickMessageDialogOpen(true);
  };

  const handleCloseQuickMessageDialog = () => {
    setSelectedQuickemessage(null);
    setQuickMessageDialogOpen(false);
    fetchQuickemessages();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditQuickemessage = (quickemessage) => {
    setSelectedQuickemessage(quickemessage);
    setQuickMessageDialogOpen(true);
  };

  const handleDeleteQuickemessage = async (quickemessageId) => {
    try {
      await api.delete(`/quick-messages/${quickemessageId}`);
      toast.success(i18n.t("quickemessages.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingQuickemessage(null);
    setSearchParam("");
    setPageNumber(1);
    fetchQuickemessages();
    dispatch({ type: "RESET" });
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

  const getMediaTypeDisplay = (quickmessage) => {
    if (!quickmessage.mediaName) {
      return i18n.t("quickMessages.noAttachment");
    }

    const mediaType = quickmessage.mediaType || 'document';
    const getIcon = (type) => {
      switch (type) {
        case 'audio': return '🎵';
        case 'image': return '🖼️';
        case 'video': return '🎥';
        default: return '📎';
      }
    };

    const getColor = (type) => {
      switch (type) {
        case 'audio': return 'secondary';
        case 'image': return 'primary';
        case 'video': return 'default';
        default: return 'default';
      }
    };

    return (
      <Box display="flex" alignItems="center" gap={1}>
        <span>{getIcon(mediaType)}</span>
        <Chip 
          size="small" 
          label={mediaType} 
          color={getColor(mediaType)}
          className={classes.mediaChip}
        />
      </Box>
    );
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={deletingQuickemessage && `${i18n.t("quickMessages.confirmationModal.deleteTitle")} ${deletingQuickemessage.shortcode}?`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteQuickemessage(deletingQuickemessage.id)}
      >
        {i18n.t("quickMessages.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <QuickMessageDialog
        resetPagination={() => {
          setPageNumber(1);
          fetchQuickemessages();
        }}
        open={quickemessageModalOpen}
        onClose={handleCloseQuickMessageDialog}
        aria-labelledby="form-dialog-title"
        quickemessageId={selectedQuickemessage && selectedQuickemessage.id}
      />
      <MainHeader>
        <div className={classes.headerCard}>
          <div>
            <Title>{i18n.t("quickMessages.title")}</Title>
            <div className={classes.headerMeta}>
              {i18n.t("quickMessages.searchPlaceholder")}
            </div>
          </div>
          <Grid container spacing={2} style={{ maxWidth: 420 }}>
            <Grid xs={12} sm={7} item>
              <TextField
                fullWidth
                className={classes.searchField}
                placeholder={i18n.t("quickMessages.searchPlaceholder")}
                type="search"
                value={searchParam}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "gray" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid xs={12} sm={5} item>
              <Button
                fullWidth
                variant="contained"
                onClick={handleOpenQuickMessageDialog}
                color="primary"
                className={classes.addButton}
              >
                {i18n.t("quickMessages.buttons.add")}
              </Button>
            </Grid>
          </Grid>
        </div>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center" className={classes.tableHeadCell}>
                {i18n.t("quickMessages.table.shortcode")}
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                {i18n.t("quickMessages.table.media")}
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                {i18n.t("quickMessages.table.status")}
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                {i18n.t("quickMessages.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {quickemessages.map((quickemessage) => (
                <TableRow key={quickemessage.id} className={classes.tableRow}>
                  <TableCell align="center" className={classes.tableCell}>{quickemessage.shortcode}</TableCell>
                  <TableCell align="center" className={classes.tableCell}>
                    {getMediaTypeDisplay(quickemessage)}
                  </TableCell>
                  <TableCell align="center" className={classes.tableCell}>
                    {quickemessage.geral === true ? (
                      <CheckCircleIcon style={{ color: 'green' }} />
                    ) : (
                      ''
                    )}
                  </TableCell>
                  <TableCell align="center" className={classes.tableCell}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditQuickemessage(quickemessage)}
                      className={classes.actionButton}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingQuickemessage(quickemessage);
                      }}
                      className={classes.actionButton}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Quickemessages;
