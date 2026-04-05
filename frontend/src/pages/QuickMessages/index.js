import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { isArray } from "lodash";

import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import InsertDriveFileOutlinedIcon from "@material-ui/icons/InsertDriveFileOutlined";
import ImageOutlinedIcon from "@material-ui/icons/ImageOutlined";
import MusicNoteOutlinedIcon from "@material-ui/icons/MusicNoteOutlined";
import SearchIcon from "@material-ui/icons/Search";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import QuickMessageDialog from "../../components/QuickMessageDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
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
    }

    return [quickemessage, ...state];
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
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: theme.spacing(2),
    flexWrap: "wrap",
    width: "100%",
  },
  titleBlock: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.75),
  },
  pageTitle: {
    fontSize: "1.95rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "#1E293B",
    lineHeight: 1.1,
  },
  pageDescription: {
    fontSize: "0.92rem",
    color: "#64748B",
    lineHeight: 1.6,
  },
  toolbar: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    flexWrap: "wrap",
    padding: theme.spacing(2.25),
    borderRadius: 20,
    background:
      theme.palette.mode === "dark"
        ? "rgba(15, 23, 42, 0.78)"
        : "rgba(255, 255, 255, 0.96)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 20px 44px rgba(0,0,0,0.28)"
        : "0 12px 32px rgba(15, 23, 42, 0.06)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.12)"
        : "1px solid rgba(226, 232, 240, 0.9)",
  },
  searchField: {
    minWidth: 280,
    maxWidth: 420,
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 999,
      background: "#F1F5F9",
      boxShadow: "none",
      minHeight: 46,
      "& fieldset": {
        borderColor: "transparent",
      },
      "&:hover fieldset": {
        borderColor: "#CBD5E1",
      },
      "&.Mui-focused": {
        background: "#FFFFFF",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#BFDBFE",
      },
    },
    "& .MuiOutlinedInput-input": {
      paddingTop: 13,
      paddingBottom: 13,
    },
  },
  searchIcon: {
    color: "#94A3B8",
    fontSize: 20,
  },
  addButton: {
    minHeight: 44,
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 700,
    padding: theme.spacing(0.9, 2),
    color: "#FFFFFF",
    background: "linear-gradient(135deg, #2563EB, #60A5FA)",
    boxShadow: "0 14px 28px rgba(37, 99, 235, 0.22)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: "0 18px 34px rgba(37, 99, 235, 0.28)",
      background: "linear-gradient(135deg, #2563EB, #60A5FA)",
    },
  },
  mainPaper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1.5),
    overflow: "hidden",
    borderRadius: 20,
    background:
      theme.palette.mode === "dark"
        ? "rgba(15, 23, 42, 0.78)"
        : "rgba(255, 255, 255, 0.96)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.12)"
        : "1px solid rgba(226, 232, 240, 0.9)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 20px 44px rgba(0,0,0,0.28)"
        : "0 12px 32px rgba(15, 23, 42, 0.06)",
    ...theme.scrollbarStyles,
  },
  tableContainer: {
    flex: 1,
    overflowX: "auto",
    borderRadius: 18,
  },
  table: {
    minWidth: 760,
  },
  tableHeadCell: {
    background: "#F8FAFC",
    color: "#64748B",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: "1px solid #E2E8F0",
    paddingTop: 14,
    paddingBottom: 14,
  },
  tableRow: {
    transition: "background-color 0.18s ease",
    "&:hover": {
      background: theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.48)" : "#F8FAFC",
    },
  },
  tableCell: {
    borderBottom: "1px solid #F1F5F9",
    paddingTop: 16,
    paddingBottom: 16,
    color: theme.palette.mode === "dark" ? "#E2E8F0" : "#334155",
  },
  shortcodeBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    background: "#DBEAFE",
    color: "#1E3A8A",
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.01em",
  },
  messagePreview: {
    color: theme.palette.mode === "dark" ? "#CBD5E1" : "#475569",
    lineHeight: 1.55,
  },
  mediaWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  mediaChip: {
    fontSize: "0.72rem",
    height: 26,
    borderRadius: 999,
    fontWeight: 700,
    background: "#F8FAFC",
    color: "#334155",
    border: "1px solid #E2E8F0",
  },
  statusIcon: {
    color: "#10B981",
  },
  actionGroup: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    color: "#64748B",
    border: "1px solid #E2E8F0",
    background: "rgba(255,255,255,0.92)",
    transition: "transform 0.16s ease, background-color 0.16s ease, color 0.16s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      background: "#F8FAFC",
      color: "#1E293B",
    },
  },
  emptyState: {
    minHeight: 420,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(5, 2),
  },
  emptyTitle: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#1E293B",
  },
  emptyDescription: {
    maxWidth: 420,
    color: "#64748B",
    lineHeight: 1.65,
  },
  emptyArt: {
    width: 180,
    height: 140,
  },
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
  }, [socket, user.companyId]);

  const fetchQuickemessages = async () => {
    try {
      const { data } = await api.get("/quick-messages", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_QUICKMESSAGES", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      setLoading(false);
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

  const getMediaMeta = (quickmessage) => {
    if (!quickmessage.mediaName) {
      return {
        icon: <InsertDriveFileOutlinedIcon fontSize="small" />,
        label: i18n.t("quickMessages.noAttachment"),
      };
    }

    const mediaType = quickmessage.mediaType || "document";

    const byType = {
      audio: {
        icon: <MusicNoteOutlinedIcon fontSize="small" />,
        label: mediaType,
      },
      image: {
        icon: <ImageOutlinedIcon fontSize="small" />,
        label: mediaType,
      },
      video: {
        icon: <VideocamOutlinedIcon fontSize="small" />,
        label: mediaType,
      },
      document: {
        icon: <InsertDriveFileOutlinedIcon fontSize="small" />,
        label: mediaType,
      },
    };

    return byType[mediaType] || byType.document;
  };

  const renderEmptyState = () => (
    <div className={classes.emptyState}>
      <svg
        viewBox="0 0 220 160"
        className={classes.emptyArt}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="34" y="36" width="152" height="92" rx="20" fill="#F8FAFC" />
        <rect x="54" y="56" width="70" height="12" rx="6" fill="#DBEAFE" />
        <rect x="54" y="78" width="104" height="10" rx="5" fill="#E2E8F0" />
        <rect x="54" y="96" width="88" height="10" rx="5" fill="#E2E8F0" />
        <rect x="148" y="94" width="22" height="22" rx="11" fill="#BFDBFE" />
        <path
          d="M159 99V111M153 105H165"
          stroke="#2563EB"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="72" cy="30" r="10" fill="#EFF6FF" />
        <circle cx="154" cy="24" r="6" fill="#DBEAFE" />
      </svg>
      <div className={classes.emptyTitle}>Ancora nessuna risposta rapida</div>
      <div className={classes.emptyDescription}>
        Crea scorciatoie riutilizzabili per rispondere più velocemente alle domande frequenti e mantenere il team allineato.
      </div>
      <Button
        variant="contained"
        className={classes.addButton}
        startIcon={<AddIcon />}
        onClick={handleOpenQuickMessageDialog}
      >
        Crea la tua prima risposta rapida
      </Button>
    </div>
  );

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingQuickemessage &&
          `${i18n.t("quickMessages.confirmationModal.deleteTitle")} ${deletingQuickemessage.shortcode}?`
        }
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
        <div className={classes.pageHeader}>
          <div className={classes.titleBlock}>
            <Title className={classes.pageTitle}>
              {i18n.t("quickMessages.title")}
            </Title>
            <div className={classes.pageDescription}>
              Gestisci e crea scorciatoie per i messaggi frequenti
            </div>
          </div>
        </div>
      </MainHeader>

      <Paper className={classes.toolbar} elevation={0}>
        <TextField
          fullWidth
          variant="outlined"
          className={classes.searchField}
          placeholder={i18n.t("quickMessages.searchPlaceholder")}
          type="search"
          value={searchParam}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className={classes.searchIcon} />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          onClick={handleOpenQuickMessageDialog}
          className={classes.addButton}
          startIcon={<AddIcon />}
        >
          {i18n.t("quickMessages.buttons.add")}
        </Button>
      </Paper>

      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        {quickemessages.length === 0 && !loading ? (
          renderEmptyState()
        ) : (
          <TableContainer className={classes.tableContainer}>
            <Table size="small" className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell align="left" className={classes.tableHeadCell}>
                    {i18n.t("quickMessages.table.shortcode")}
                  </TableCell>
                  <TableCell align="left" className={classes.tableHeadCell}>
                    Messaggio
                  </TableCell>
                  <TableCell align="left" className={classes.tableHeadCell}>
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
                {quickemessages.map((quickemessage) => {
                  const mediaMeta = getMediaMeta(quickemessage);

                  return (
                    <TableRow key={quickemessage.id} className={classes.tableRow}>
                      <TableCell align="left" className={classes.tableCell}>
                        <span className={classes.shortcodeBadge}>
                          /{String(quickemessage.shortcode || "").replace(/^\//, "")}
                        </span>
                      </TableCell>

                      <TableCell align="left" className={classes.tableCell}>
                        <div className={classes.messagePreview}>
                          {quickemessage.message || "—"}
                        </div>
                      </TableCell>

                      <TableCell align="left" className={classes.tableCell}>
                        <div className={classes.mediaWrap}>
                          {mediaMeta.icon}
                          <Chip
                            size="small"
                            label={mediaMeta.label}
                            className={classes.mediaChip}
                          />
                        </div>
                      </TableCell>

                      <TableCell align="center" className={classes.tableCell}>
                        {quickemessage.geral === true ? (
                          <Tooltip title="Disponibile">
                            <CheckCircleIcon className={classes.statusIcon} />
                          </Tooltip>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell align="center" className={classes.tableCell}>
                        <div className={classes.actionGroup}>
                          <Tooltip title="Modifica">
                            <IconButton
                              size="small"
                              onClick={() => handleEditQuickemessage(quickemessage)}
                              className={classes.actionButton}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Elimina">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setConfirmModalOpen(true);
                                setDeletingQuickemessage(quickemessage);
                              }}
                              className={classes.actionButton}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {loading && <TableRowSkeleton columns={5} />}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Quickemessages;
