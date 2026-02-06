import React, { useContext, useState, useCallback, useMemo, memo } from "react";
import { useDebouncedCallback } from 'use-debounce';
import {
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  ListItemAvatar,
  Avatar,
  makeStyles,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@material-ui/core";

import { useHistory, useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import useOnlineUsers from "../../hooks/useOnlineUsers";
import { getBackendUrl } from "../../config";
import { i18n } from "../../translate/i18n";

import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";

import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import UserStatusIcon from "../../components/UserModal/statusIcon";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    height: "calc(100% - 58px)",
    overflow: "hidden",
    borderRadius: 16,
    background: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    boxShadow: "0 14px 28px rgba(15, 23, 42, 0.08)",
    backdropFilter: "blur(10px)",
  },
  chatList: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  listItemActive: {
    cursor: "pointer",
    backgroundColor: "rgba(226, 232, 240, 0.6)",
    borderLeft: "4px solid rgba(59, 130, 246, 0.8)",
    borderRadius: 12,
  },
  listItem: {
    cursor: "pointer",
    backgroundColor: "transparent",
    borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
    "&:hover": {
      backgroundColor: "rgba(226, 232, 240, 0.45)",
    },
    borderRadius: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "#4CAF50",
    position: "absolute",
    bottom: 0,
    right: 0,
    border: "2px solid white",
  },
  offlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "#999",
    position: "absolute",
    bottom: 0,
    right: 0,
    border: "2px solid white",
  },
  lastSeen: {
    fontSize: "0.75rem",
    color: "rgba(100, 116, 139, 0.85)",
  },
  lastMessage: {
    fontSize: "0.875rem",
    color: "rgba(71, 85, 105, 0.9)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "200px",
  },
  listItemContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    position: "relative",
    height: "auto",
  },

  userName: {
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    maxWidth: 180,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  messageCount: {
    marginLeft: "auto",
    fontSize: "0.75rem",
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    color: "#fff",
    borderRadius: "12px",
    padding: "2px 8px",
    minWidth: "20px",
    textAlign: "center",
    boxShadow: "0 6px 14px rgba(15, 23, 42, 0.12)",
  },
  unreadDot: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "rgba(239, 68, 68, 0.95)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    marginLeft: 8,
    boxShadow: "0 6px 14px rgba(15, 23, 42, 0.16)",
  },
  secondaryText: {
    color: "rgba(100, 116, 139, 0.9)",
  },
  modalPaper: {
    borderRadius: 16,
    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.18)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  modalSearch: {
    marginBottom: "20px",
    marginTop: "10px",
    background: "rgba(248, 250, 252, 0.9)",
    borderRadius: 12,
  },
  userListItem: {
    borderRadius: 12,
    marginBottom: 6,
    transition: "background-color 0.15s ease, transform 0.15s ease",
    "&:hover": {
      backgroundColor: "rgba(226, 232, 240, 0.6)",
      transform: "translateX(2px)",
    },
  },
  searchBar: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(148, 163, 184, 0.35)",
    outline: "none",
    background: "rgba(255, 255, 255, 0.9)",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.06)",
  },
  addChatButton: {
    backgroundColor: "rgba(59, 130, 246, 0.95)",
    color: "white",
    width: "40px",
    height: "40px",
    borderRadius: 12,
    boxShadow: "0 10px 20px rgba(15, 23, 42, 0.12)",
    "&:hover": {
      backgroundColor: "rgba(37, 99, 235, 1)",
    },
  },
}));

function ChatList({
  chats,
  handleSelectChat,
  handleDeleteChat,
  handleEditChat,
  pageInfo,
  loading,
  findChats,
}) {
  const classes = useStyles();
  const history = useHistory();
  const { user: loggedInUser, users } = useContext(AuthContext);
  const { datetimeToClient } = useDate();

  const [confirmationModal, setConfirmModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [createChatModalOpen, setCreateChatModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  const { id } = useParams();

  // Debounce para o campo de busca
  const handleSearchChange = useDebouncedCallback((value) => {
    setSearchTerm(value);
  }, 300);

  // Memoizar ordenação dos chats
  const orderedChats = useMemo(() => {
    return [...chats].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  }, [chats]);

  // Memoizar filtragem dos chats
  const filteredChats = useMemo(() => {
    return orderedChats.filter((chat) => {
      const isGroup = chat.isGroup;
      const otherUser =
        !isGroup && chat.users.find((u) => u.userId !== loggedInUser.id);
      const name = isGroup ? chat.title : otherUser?.user?.name || "";
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [orderedChats, searchTerm, loggedInUser.id]);

  const isShowingOnlyGroups = useMemo(() => {
    return filteredChats.every((chat) => chat.isGroup);
  }, [filteredChats]);

  const goToMessages = async (chat) => {
    if (unreadMessages(chat) > 0) {
      try {
        await api.post(`/chats/${chat.id}/read`, { userId: loggedInUser.id });
      } catch (err) {}
    }
    handleSelectChat(chat);
    if (id !== chat.uuid) {
      history.push(`/chats/${chat.uuid}`);
    }
  };

  const handleDelete = () => {
    handleDeleteChat(selectedChat);
    handleClose();
  };

  const unreadMessages = (chat) => {
    const currentUser = chat.users.find((u) => u.userId === loggedInUser.id);
    return currentUser.unreads;
  };

  const getPrimaryText = (chat) => {
    const isGroup = chat.isGroup;

    const otherUser =
      !isGroup && chat.users.find((u) => u.userId !== loggedInUser.id);

    const mainText = chat.title;
    const userName = otherUser?.user?.name;

    const unreads = unreadMessages(chat);

    return (
      <>
        {isGroup ? mainText : userName}
        {unreads > 0 && (
          <Chip
            size="small"
            style={{ marginLeft: 5 }}
            label={unreads}
            color="secondary"
          />
        )}
      </>
    );
  };

  const getSecondaryText = (chat) => {
    // Prioriza o campo lastMessage retornado do backend
    let msg = "";
    if (chat.lastMessage && typeof chat.lastMessage === "object") {
      if (chat.lastMessage.isDeleted) {
        msg = i18n.t("chatMessages.deleted");
      } else if (chat.lastMessage.mediaType === "audio") {
        msg = i18n.t("chatList.audio");
      } else if (chat.lastMessage.mediaType === "image") {
        msg = i18n.t("chatList.image");
      } else if (chat.lastMessage.mediaType === "video") {
        msg = i18n.t("chatList.video");
      } else if (chat.lastMessage.mediaType && chat.lastMessage.mediaName) {
        msg = `${i18n.t("chatList.file")} ${chat.lastMessage.mediaName}`;
      } else if (chat.lastMessage.message) {
        msg = chat.lastMessage.message;
      }
    } else if (typeof chat.lastMessage === "string") {
      msg = chat.lastMessage;
    } else if (chat.messages && chat.messages.length > 0) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      msg = lastMsg.message;
    } else {
      msg = i18n.t("chatList.noMessages");
    }
    // Limita o texto a 80 caracteres
    if (msg && msg.length > 40) {
      return msg.substring(0, 40) + "...";
    }
    return msg;
  };

  const handleClick = (event, chat) => {
    setAnchorEl(event.currentTarget);
    setSelectedChat(chat);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDetails = () => {
    setDetailsModalOpen(true);
    handleClose();
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
  };

  const formatLastSeen = (date) => {
    if (!date) return "";
    const lastSeen = new Date(date);
    const now = new Date();
    const diff = now - lastSeen;
    if (diff < 60000) return i18n.t("chatList.now");
    if (diff < 3600000)
      return i18n.t("chatList.minutesAgo", { count: Math.floor(diff / 60000) });
    if (diff < 86400000)
      return i18n.t("chatList.hoursAgo", { count: Math.floor(diff / 3600000) });
    return lastSeen.toLocaleDateString();
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const { data } = await api.get("/users/list");
      // Filtrar o usuário logado da lista
      const filteredUsers = data.filter((user) => user.id !== loggedInUser.id);
      setAvailableUsers(filteredUsers);
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("chatList.errorLoadingUsers"));
    } finally {
      setUsersLoading(false);
    }
  };

  const handleOpenCreateChat = () => {
    setCreateChatModalOpen(true);
    setUserSearchTerm("");
    loadUsers();
  };

  const handleCloseCreateChat = () => {
    setCreateChatModalOpen(false);
    setUserSearchTerm("");
  };

  const handleCreateChatWithUser = async (selectedUser) => {
    try {
      // Verificar se já existe um chat com este usuário
      const existingChat = chats.find((c) => {
        const hasSelectedUser = c.users.some(
          (u) => u.userId === selectedUser.id
        );
        const hasLoggedInUser = c.users.some(
          (u) => u.userId === loggedInUser.id
        );
        const isIndividualChat = !c.isGroup && c.users.length === 2;

        return isIndividualChat && hasSelectedUser && hasLoggedInUser;
      });

      if (existingChat) {
        toast.info(i18n.t("chatList.chatAlreadyExists"));
        handleSelectChat(existingChat);
        handleCloseCreateChat();
        return;
      }

      // Criar novo chat
      const { data } = await api.post("/chats", {
        users: [{ id: selectedUser.id }],
        isGroup: false,
      });

      toast.success(i18n.t("chatList.chatCreatedSuccess"));

      // Atualizar a lista de chats
      if (findChats) {
        await findChats();
      }

      handleSelectChat(data);
      handleCloseCreateChat();
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("chatList.errorCreatingChat"));
    }
  };

  const filteredAvailableUsers = availableUsers.filter((user) =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {selectedChat.ownerId === loggedInUser.id && selectedChat.isGroup && (
          <MenuItem onClick={() => handleEditChat(selectedChat)}>
            {i18n.t("chatList.edit")}
          </MenuItem>
        )}
        {loggedInUser.profile === "admin" && (
          <MenuItem onClick={() => handleDeleteChat(selectedChat)}>
            {i18n.t("chatList.delete")}
          </MenuItem>
        )}
        {selectedChat.isGroup && (
          <MenuItem onClick={handleOpenDetails}>
            {i18n.t("chatList.details")}
          </MenuItem>
        )}
      </Menu>
      <ConfirmationModal
        title={i18n.t("chatList.deleteChat")}
        open={confirmationModal}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDelete}
      >
        {i18n.t("chatList.deleteChatConfirm")}
      </ConfirmationModal>
      <ConfirmationModal
        title={i18n.t("chatList.detailsTitle")}
        open={detailsModalOpen}
        onClose={handleCloseDetails}
      >
        <div style={{ padding: "20px" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <Avatar
              src={
                selectedChat?.groupImage
                  ? selectedChat.groupImage.startsWith("http")
                    ? selectedChat.groupImage
                    : `${getBackendUrl()}${selectedChat.groupImage}`
                  : null
              }
              style={{ width: 100, height: 100, margin: "0 auto" }}
            />
            <Typography variant="h6" style={{ marginTop: "10px" }}>
              {selectedChat?.title}
            </Typography>
            {selectedChat?.description && (
              <Typography variant="body2" color="textSecondary">
                {selectedChat.description}
              </Typography>
            )}
          </div>
          <List>
            {selectedChat?.users?.map((user) => (
              <ListItem key={user.userId}>
                <ListItemAvatar>
                  <Avatar
                    src={
                      user.user?.profileImage
                        ? `${getBackendUrl()}/public/company${
                            user.user.companyId
                          }/user/${user.user.profileImage}`
                        : null
                    }
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={user.user?.name}
                  secondary={
                    user.userId === selectedChat.ownerId
                      ? i18n.t("chatList.admin")
                      : i18n.t("chatList.member")
                  }
                />
              </ListItem>
            ))}
          </List>
        </div>
      </ConfirmationModal>
      <div className={classes.mainContainer}>
        <div
          style={{
            padding: "10px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder={i18n.t("chatList.searchChat")}
            defaultValue={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={classes.searchBar}
          />
          {!isShowingOnlyGroups && (
            <IconButton
              onClick={handleOpenCreateChat}
              className={classes.addChatButton}
              title={i18n.t("chatList.createNewChat")}
            >
              <AddIcon />
            </IconButton>
          )}
        </div>

        <div className={classes.chatList}>
          <List>
            {console.log(
              "Renderizando lista com",
              filteredChats.length,
              "chats"
            )}
            {filteredChats.map((chat, key) => {
              const isGroup = chat.isGroup;
              const otherUser =
                !isGroup &&
                chat.users.find((u) => u.userId !== loggedInUser.id);
              const isOnline =
                !isGroup &&
                otherUser &&
                availableUsers?.some((u) => u.id === otherUser.user.id);

              console.log(`Renderizando chat ${key}:`, {
                id: chat.id,
                uuid: chat.uuid,
                isGroup: isGroup,
                title: chat.title,
                name: otherUser?.user?.name,
                users: chat.users?.length,
              });

              return (
                <ListItem
                  key={key}
                  button
                  onClick={() => goToMessages(chat)}
                  className={
                    chat.uuid === id ? classes.listItemActive : classes.listItem
                  }
                >
                  <ListItemAvatar>
                    <div style={{ position: "relative" }}>
                      <Avatar
                        src={
                          isGroup
                            ? chat.groupImage
                              ? chat.groupImage.startsWith("http")
                                ? chat.groupImage
                                : `${getBackendUrl()}${chat.groupImage}`
                              : undefined
                            : otherUser &&
                              otherUser.user &&
                              otherUser.user.profileImage
                            ? otherUser.user.profileImage.startsWith("http")
                              ? otherUser.user.profileImage
                              : `${getBackendUrl()}/public/company${
                                  otherUser.user.companyId
                                }/user/${otherUser.user.profileImage}`
                            : undefined
                        }
                        className={classes.avatar}
                      >
                        {isGroup
                          ? chat.title
                            ? chat.title.charAt(0)
                            : "G"
                          : otherUser && otherUser.user && otherUser.user.name
                          ? otherUser.user.name.charAt(0)
                          : "?"}
                      </Avatar>
                    </div>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <div className={classes.listItemContent}>
                        <div className={classes.userName}>
                          <Typography
                            component="div"
                            variant="subtitle1"
                            className={classes.userName}
                          >
                            {isGroup
                              ? chat.title || i18n.t("chatList.group")
                              : otherUser &&
                                otherUser.user &&
                                otherUser.user.name
                              ? otherUser.user.name
                              : i18n.t("chatList.user")}
                          </Typography>
                          {!isGroup && (
                            <UserStatusIcon user={otherUser?.user} />
                          )}
                        </div>
                        {unreadMessages(chat) > 0 && (
                          <div className={classes.unreadDot}>
                            {unreadMessages(chat)}
                          </div>
                        )}
                      </div>
                    }
                    secondary={
                      <Typography
                        component="div"
                        variant="body2"
                        className={classes.secondaryText}
                      >
                        {getSecondaryText(chat)}
                      </Typography>
                    }
                  />

                  {(loggedInUser.profile === "admin" ||
                    (selectedChat.ownerId === loggedInUser.id &&
                      selectedChat.isGroup)) && (
                    <IconButton
                      edge="end"
                      aria-label="more"
                      onClick={(e) => handleClick(e, chat)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </ListItem>
              );
            })}
          </List>
        </div>
      </div>
      <Dialog
        open={createChatModalOpen}
        onClose={handleCloseCreateChat}
        maxWidth="sm"
        fullWidth
        classes={{ paper: classes.modalPaper }}
      >
        <DialogTitle>
          <div className={classes.modalHeader}>
            <AddIcon style={{ color: "#1976d2" }} />
            <Typography variant="h6">
              {i18n.t("chatList.createNewChat")}
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder={i18n.t("chatList.searchUser")}
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            className={classes.modalSearch}
            InputProps={{
              startAdornment: (
                <SearchIcon style={{ marginRight: "8px", color: "#666" }} />
              ),
            }}
          />

          {usersLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <CircularProgress />
            </div>
          ) : (
            <List style={{ maxHeight: "400px", overflow: "auto" }}>
              {filteredAvailableUsers.map((user) => (
                <ListItem
                  key={user.userId}
                  button
                  onClick={() => handleCreateChatWithUser(user)}
                  className={classes.userListItem}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={
                        user?.profileImage?.startsWith("http")
                          ? user.profileImage
                          : `${getBackendUrl()}/public/company${
                              user.companyId
                            }/user/${user.profileImage}`
                      }
                    >
                      {/* {!user.profileImage && user.name.charAt(0)} */}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Typography variant="subtitle1">{user.name}</Typography>
                        <UserStatusIcon user={user} />
                      </div>
                    }
                    secondary={user.email}
                  />
                </ListItem>
              ))}
              {filteredAvailableUsers.length === 0 && !usersLoading && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  }}
                >
                  {userSearchTerm
                    ? i18n.t("chatList.noUserFound")
                    : i18n.t("chatList.noUserAvailable")}
                </div>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateChat} color="secondary">
            {i18n.t("chatList.cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default memo(ChatList);
