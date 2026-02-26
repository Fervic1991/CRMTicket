import React, {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useContext,
} from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom"; // Importe o useHistory

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

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Chip } from "@material-ui/core";
// import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { CheckCircle } from "@material-ui/icons";

const reducer = (state, action) => {
  if (action.type === "LOAD_TAGS") {
    const tags = action.payload;
    const newTags = [];

    tags.forEach((tag) => {
      const tagIndex = state.findIndex((s) => s.id === tag.id);
      if (tagIndex !== -1) {
        state[tagIndex] = tag;
      } else {
        newTags.push(tag);
      }
    });

    return [...state, ...newTags];
  }

  if (action.type === "UPDATE_TAGS") {
    const tag = action.payload;
    const tagIndex = state.findIndex((s) => s.id === tag.id);

    if (tagIndex !== -1) {
      state[tagIndex] = tag;
      return [...state];
    } else {
      return [tag, ...state];
    }
  }

  if (action.type === "DELETE_TAGS") {
    const tagId = action.payload;

    const tagIndex = state.findIndex((s) => s.id === tagId);
    if (tagIndex !== -1) {
      state.splice(tagIndex, 1);
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
    minWidth: 220,
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
  outlineButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    background:
      theme.palette.mode === "dark"
        ? "rgba(15, 23, 42, 0.7)"
        : "rgba(255, 255, 255, 0.9)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148, 163, 184, 0.2)"
        : "1px solid rgba(148, 163, 184, 0.35)",
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
}));

const Tags = () => {
  const classes = useStyles();
  const history = useHistory(); // Inicialize o useHistory

  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTags = async () => {
        try {
          const { data } = await api.get("/tags/", {
            params: { searchParam, pageNumber, kanban: 1 },
          });
          dispatch({ type: "LOAD_TAGS", payload: data.tags });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchTags();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    // const socket = socketManager.GetSocket(user.companyId, user.id);

    const onTagsEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tag });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TAGS", payload: +data.tagId });
      }
    };
    socket.on(`company${user.companyId}-tag`, onTagsEvent);

    return () => {
      socket.off(`company${user.companyId}-tag`, onTagsEvent);
    };
  }, [socket]);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);
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

  const handleReturnToKanban = () => {
    history.push("/kanban");
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingTag && `${i18n.t("tagsKanban.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteTag(deletingTag.id)}
      >
        {i18n.t("tagsKanban.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      {tagModalOpen && (
        <TagModal
          open={tagModalOpen}
          onClose={handleCloseTagModal}
          aria-labelledby="form-dialog-title"
          tagId={selectedTag && selectedTag.id}
          kanban={1}
        />
      )}
      <MainHeader>
        <div className={classes.headerCard}>
          <div>
            <Title>
              {i18n.t("tagsKanban.title")} ({tags.length})
            </Title>
            <div className={classes.headerMeta}>
              {i18n.t("contacts.searchPlaceholder")}
            </div>
          </div>
          <MainHeaderButtonsWrapper>
            <TextField
              className={classes.searchField}
              placeholder={i18n.t("contacts.searchPlaceholder")}
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenTagModal}
              className={classes.addButton}
            >
              {i18n.t("tagsKanban.buttons.add")}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleReturnToKanban}
              className={classes.outlineButton}
            >
              {i18n.t("tagsKanban.backToKanban")}
            </Button>
          </MainHeaderButtonsWrapper>
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
                {i18n.t("tagsKanban.table.name")}
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                {i18n.t("tagsKanban.table.tickets")}
              </TableCell>
              <TableCell align="center" className={classes.tableHeadCell}>
                {i18n.t("tagsKanban.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {tags.map((tag) => (
                <TableRow key={tag.id} className={classes.tableRow}>
                  <TableCell align="center" className={classes.tableCell}>
                    <Chip
                      variant="outlined"
                      style={{
                        backgroundColor: tag.color,
                        textShadow: "1px 1px 1px #000",
                        color: "white",
                      }}
                      label={tag.name}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center" className={classes.tableCell}>
                    {tag?.ticketTags ? (
                      <span>{tag?.ticketTags?.length}</span>
                    ) : (
                      <span>0</span>
                    )}
                  </TableCell>
                  <TableCell align="center" className={classes.tableCell}>
                    <IconButton size="small" onClick={() => handleEditTag(tag)} className={classes.actionButton}>
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingTag(tag);
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

export default Tags;
