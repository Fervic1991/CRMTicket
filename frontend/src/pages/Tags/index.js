import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
} from "react";
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
import { AuthContext } from "../../context/Auth/AuthContext";
import { MoreHoriz } from "@material-ui/icons";
import ContactTagListModal from "../../components/ContactTagListModal";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_TAGS":
      return [...state, ...action.payload];
    case "UPDATE_TAGS":
      const tag = action.payload;
      const tagIndex = state.findIndex((s) => s.id === tag.id);

      if (tagIndex !== -1) {
        state[tagIndex] = tag;
        return [...state];
      } else {
        return [tag, ...state];
      }
    case "DELETE_TAGS":
      const tagId = action.payload;
      return state.filter((tag) => tag.id !== tagId);
    case "RESET":
      return [];
    default:
      return state;
  }
};

const useStyles = makeStyles((theme) => ({
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
  tagChip: {
    fontWeight: 700,
    color: "#fff",
    textShadow: "0 1px 2px rgba(0,0,0,0.25)",
    border: "none",
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
  emptyStateButton: {
    marginTop: theme.spacing(2),
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 14px 28px rgba(63,81,181,0.28)",
    },
  },
}));

const Tags = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);

  const [selectedTagContacts, setSelectedTagContacts] = useState([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTagName, setSelectedTagName] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const pageNumberRef = useRef(1);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const fetchMoreTags = async () => {
        try {
          const { data } = await api.get("/tags/", {
            params: { searchParam, pageNumber, kanban: 0 },
          });
          dispatch({ type: "LOAD_TAGS", payload: data.tags });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };

      if (pageNumber > 0) {
        setLoading(true);
        fetchMoreTags();
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onCompanyTags = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tag });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TAGS", payload: +data.tagId });
      }
    };
    socket.on(`company${user.companyId}-tag`, onCompanyTags);

    return () => {
      socket.off(`company${user.companyId}-tag`, onCompanyTags);
    };
  }, [socket, user.companyId]);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };

  const handleSearch = (event) => {
    const newSearchParam = event.target.value.toLowerCase();
    setSearchParam(newSearchParam);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleShowContacts = (contacts, tag) => {
    setSelectedTagContacts(contacts);
    setContactModalOpen(true);
    setSelectedTagName(tag);
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
    setSelectedTagContacts([]);
    setSelectedTagName("");
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
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const summary = tags.reduce(
    (acc, tag) => {
      acc.total += 1;
      acc.contacts += tag?.contacts?.length || 0;
      return acc;
    },
    { total: 0, contacts: 0 }
  );

  return (
    <MainContainer className={classes.mainContainer}>
      {contactModalOpen && (
        <ContactTagListModal
          open={contactModalOpen}
          onClose={handleCloseContactModal}
          tag={selectedTagName}
        />
      )}
      <ConfirmationModal
        title={deletingTag && `${i18n.t("tags.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteTag(deletingTag.id)}
      >
        {i18n.t("tags.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        aria-labelledby="form-dialog-title"
        tagId={selectedTag && selectedTag.id}
        kanban={0}
      />
      <MainHeader>
        <div className={classes.headerCard}>
          <Title className={classes.headerTitle}>{i18n.t("tags.title")} ({tags.length})</Title>
          <MainHeaderButtonsWrapper>
            <TextField
              placeholder={i18n.t("contacts.searchPlaceholder")}
              type="search"
              variant="outlined"
              size="small"
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenTagModal}
              className={classes.addButton}
            >
              {i18n.t("tags.buttons.add")}
            </Button>
          </MainHeaderButtonsWrapper>
        </div>
      </MainHeader>
      <Paper className={classes.summaryBar}>
        <span className={classes.summaryChip}>
          {i18n.t("tags.summary.total")}
          <span className={classes.summaryCount}>{summary.total}</span>
        </span>
        <span className={classes.summaryChip}>
          {i18n.t("tags.summary.contacts")}
          <span className={classes.summaryCount}>{summary.contacts}</span>
        </span>
      </Paper>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small" className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell align="center" className={classes.tableHeader}>{i18n.t("tags.table.id")}</TableCell>
              <TableCell align="center" className={classes.tableHeader}>{i18n.t("tags.table.name")}</TableCell>
              <TableCell align="center" className={classes.tableHeader}>
                {i18n.t("tags.table.contacts")}
              </TableCell>
              <TableCell align="center" className={classes.tableHeader}>
                {i18n.t("tags.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {tags.map((tag) => (
                <TableRow key={tag.id} className={classes.tableRow}>
                  <TableCell align="center">{tag.id}</TableCell>
                  <TableCell align="center">
                    <Chip
                      style={{
                        backgroundColor: tag.color,
                      }}
                      className={classes.tagChip}
                      label={tag.name}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {tag?.contacts?.length}
                    <IconButton
                      size="small"
                      onClick={() => handleShowContacts(tag?.contacts, tag)}
                      disabled={tag?.contacts?.length === 0}
                      className={classes.actionButton}
                    >
                      <MoreHoriz />
                    </IconButton>
                  </TableCell>

                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEditTag(tag)} className={classes.actionButton}>
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
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

              {loading && <TableRowSkeleton key="skeleton" columns={4} />}
              {!loading && tags.length === 0 && (
                <TableRow>
                  <TableCell align="center" colSpan={4} className={classes.emptyState}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>
                      {i18n.t("tags.emptyState.title")}
                    </div>
                    <div>{i18n.t("tags.emptyState.description")}</div>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleOpenTagModal}
                      className={classes.emptyStateButton}
                    >
                      {i18n.t("tags.buttons.add")}
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Tags;
