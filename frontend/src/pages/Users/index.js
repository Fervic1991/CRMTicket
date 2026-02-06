import React, { useState, useEffect, useReducer, useContext } from "react";
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
import CircularProgress from "@material-ui/core/CircularProgress";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import { AccountCircle } from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import whatsappIcon from "../../assets/nopicture.png";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import {
  SocketContext,
  socketManager,
} from "../../context/Socket/SocketContext";
import UserStatusIcon from "../../components/UserModal/statusIcon";
import { getBackendUrl } from "../../config";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Avatar } from "@material-ui/core";
import ForbiddenPage from "../../components/ForbiddenPage";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import { useHistory } from "react-router-dom";
import usePlans from "../../hooks/usePlans";

const backendUrl = getBackendUrl();

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const users = action.payload;
    const newUsers = [];

    users.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
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
  secondaryButton: {
    height: 44,
    borderRadius: 14,
    fontWeight: 600,
    textTransform: "none",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(120,130,160,0.2)",
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
  userAvatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  avatarDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(3),
  },
  loadingText: {
    marginLeft: theme.spacing(2),
  },
  emptyState: {
    padding: theme.spacing(3),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  emptyStateIcon: {
    width: 78,
    height: 78,
    borderRadius: "50%",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgba(63,81,181,0.15), rgba(25,118,210,0.25))",
    border: "1px solid rgba(63,81,181,0.2)",
    color: theme.palette.primary.main,
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

const Users = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);
  const { user: loggedInUser, socket } = useContext(AuthContext);
  const { profileImage } = loggedInUser;
  const companyId = loggedInUser.companyId;

  const [showInternalChat, setShowInternalChat] = useState(false);

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      if (!companyId) {
        return;
      }

      try {
        setLoading(true);
        const planConfigs = await getPlanCompany(undefined, companyId);

        setShowInternalChat(planConfigs.plan.useInternalChat);
      } catch (err) {
        console.error("Error fetching plan:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/", {
          params: { searchParam, pageNumber },
        });
        dispatch({ type: "LOAD_USERS", payload: data.users });
        setHasMore(data.hasMore);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchUsers();
  }, [searchParam, pageNumber]);

useEffect(() => {
  if (loggedInUser) {
    const companyId = loggedInUser.companyId;
    
    const onCompanyUser = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_USERS", payload: data.user });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_USER", payload: +data.userId });
      }
    };
    
    socket.on(`company-${companyId}-user`, onCompanyUser);
    
    return () => {
      socket.off(`company-${companyId}-user`, onCompanyUser);
    };
  }
}, [socket, loggedInUser]);

  const handleOpenUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setLoadingMore(true);
    setPageNumber((prevPage) => prevPage + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

const renderProfileImage = (user) => {
  const buildImageUrl = (userData) => {
    if (!userData.profileImage) {
      return whatsappIcon;
    }
    return `${backendUrl}/public/company${userData.companyId}/user/${userData.profileImage}`;
  };

  // Para o usuário logado, verificar localStorage também
  if (user.id === loggedInUser.id) {
    const savedProfileImage = localStorage.getItem("profileImage");
    const profileImageToUse = savedProfileImage || user.profileImage;
    
    const imageUrl = profileImageToUse 
      ? `${backendUrl}/public/company${user.companyId}/user/${profileImageToUse}`
      : whatsappIcon;

    return (
      <Avatar
        src={imageUrl}
        alt={user.name}
        className={classes.userAvatar}
        onError={(e) => {
          e.target.src = whatsappIcon;
        }}
      />
    );
  }
  
  // Para outros usuários
  return (
    <Avatar
      src={buildImageUrl(user)}
      alt={user.name}
      className={classes.userAvatar}
    />
  );
};

  const handleCreateChat = async (targetUser) => {
    try {
      setLoading(true);
      const { data } = await api.post("/chats", {
        users: [{ id: loggedInUser.id }, { id: targetUser.id }],
        isGroup: false,
        title: targetUser.name,
      });
      toast.success(i18n.t("users.toasts.chatCreated"));
      history.push(`/chats/${data.uuid}`);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackfillChats = async () => {
    if (
      !window.confirm(
        "Tem certeza que deseja gerar chats para todos os usuários existentes? Isso pode demorar e criar muitos chats."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      await api.post("/chats/backfill");
      toast.success(i18n.t("users.toasts.chatsGenerated"));
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const summary = users.reduce(
    (acc) => {
      acc.total += 1;
      return acc;
    },
    { total: 0 }
  );

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingUser &&
          `${i18n.t("users.confirmationModal.deleteTitle")} ${
            deletingUser.name
          }?`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteUser(deletingUser.id)}
      >
        {i18n.t("users.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <UserModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        aria-labelledby="form-dialog-title"
        userId={selectedUser && selectedUser.id}
      />
      {loggedInUser.profile === "user" ? (
        <ForbiddenPage />
      ) : (
        <>
          <MainHeader>
            <div className={classes.headerCard}>
              <Title className={classes.headerTitle}>
                {i18n.t("users.title")}
              </Title>
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
                  onClick={handleOpenUserModal}
                  className={classes.addButton}
                >
                  {i18n.t("users.buttons.add")}
                </Button>
                {loggedInUser.profile === "admin" && showInternalChat && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleBackfillChats}
                    disabled={loading}
                    className={classes.secondaryButton}
                  >
                    {i18n.t("users.buttons.generateExistingChats")}
                  </Button>
                )}
              </MainHeaderButtonsWrapper>
            </div>
          </MainHeader>
          <Paper className={classes.summaryBar}>
            <span className={classes.summaryChip}>
              {i18n.t("users.summary.total")}
              <span className={classes.summaryCount}>{summary.total}</span>
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
                  <TableCell align="center" className={classes.tableHeader}>
                    {i18n.t("users.table.ID")}
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeader}>
                    {i18n.t("users.table.status")}
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeader}>
                    {i18n.t("users.table.avatar")}
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeader}>
                    {i18n.t("users.table.name")}
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeader}>
                    {i18n.t("users.table.email")}
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeader}>
                    {i18n.t("users.table.profile")}
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeader}>
                    {i18n.t("users.table.startWork")}
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeader}>
                    {i18n.t("users.table.endWork")}
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeader}>
                    {i18n.t("users.table.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <>
                  {users.map((user) => (
                    <TableRow key={user.id} className={classes.tableRow}>
                      <TableCell align="center">{user.id}</TableCell>
                      <TableCell align="center">
                        <UserStatusIcon user={user} />
                      </TableCell>
                      <TableCell align="center">
                        <div className={classes.avatarDiv}>
                          {renderProfileImage(user)}
                        </div>
                      </TableCell>
                      <TableCell align="center">{user.name}</TableCell>
                      <TableCell align="center">{user.email}</TableCell>
                      <TableCell align="center">{user.profile}</TableCell>
                      <TableCell align="center">{user.startWork}</TableCell>
                      <TableCell align="center">{user.endWork}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleCreateChat(user)}
                          disabled={!showInternalChat}
                          className={classes.actionButton}
                        >
                          <ChatBubbleOutlineIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                          className={classes.actionButton}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setConfirmModalOpen(true);
                            setDeletingUser(user);
                          }}
                          className={classes.actionButton}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {loadingMore && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && users.length === 0 && (
                    <TableRow>
                      <TableCell align="center" colSpan={9} className={classes.emptyState}>
                        <div className={classes.emptyStateIcon}>
                          <AccountCircle fontSize="large" />
                        </div>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                          {i18n.t("users.emptyState.title")}
                        </div>
                        <div>{i18n.t("users.emptyState.description")}</div>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleOpenUserModal}
                          className={classes.emptyStateButton}
                        >
                          {i18n.t("users.buttons.add")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              </TableBody>
            </Table>
            {loading && !loadingMore && (
              <div className={classes.loadingContainer}>
                <CircularProgress />
                <span className={classes.loadingText}>{i18n.t("loading")}</span>
              </div>
            )}
          </Paper>
        </>
      )}
    </MainContainer>
  );
};

export default Users;
