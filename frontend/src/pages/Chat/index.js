import React, { useContext, useEffect, useRef, useState } from "react";

import { useParams, useHistory } from "react-router-dom";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Avatar,
  IconButton,
  InputAdornment,
} from "@material-ui/core";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import { UsersFilter } from "../../components/UsersFilter";
import api from "../../services/api";
import useResponsive from "../../utils/useResponsive";
import { socketConnection } from "../../services/socket";
import { has, isObject } from "lodash";
import { getBackendUrl } from "../../config";

import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import { toast } from "react-hot-toast";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import AddIcon from "@material-ui/icons/Add";
import PhotoCameraOutlinedIcon from "@material-ui/icons/PhotoCameraOutlined";
import SearchIcon from "@material-ui/icons/Search";

// FIXME checkout https://mui.com/components/use-media-query/#migrating-from-withwidth
const withWidth = () => (WrappedComponent) => (props) =>
  <WrappedComponent {...props} width="xs" />;

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    padding: theme.spacing(2),
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
    background: "radial-gradient(1200px 600px at 10% -10%, rgba(59, 130, 246, 0.18), transparent 55%), radial-gradient(900px 500px at 110% 10%, rgba(16, 185, 129, 0.16), transparent 60%), linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.98))",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: 16,
  },
  gridContainer: {
    flex: 1,
    height: "100%",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    background: "rgba(255, 255, 255, 0.78)",
    borderRadius: 16,
    boxShadow: "0 14px 28px rgba(15, 23, 42, 0.08)",
    backdropFilter: "blur(10px)",
  },
  gridItem: {
    height: "100%",
  },
  gridItemTab: {
    height: "92%",
    width: "100%",
  },
  segmentedBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
    background: "rgba(255,255,255,0.92)",
    borderBottom: "1px solid #E2E8F0",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  segmentedControl: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: 4,
    borderRadius: 999,
    background: "#F1F5F9",
    border: "1px solid #E2E8F0",
    boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)",
  },
  segmentedTab: {
    minHeight: 36,
    minWidth: 92,
    padding: "0 16px",
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 600,
    color: "#64748B",
    transition: "all 0.2s ease",
    '&.Mui-selected': {
      color: "#fff",
      background: "linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)",
      boxShadow: "0 8px 18px rgba(37,99,235,0.22)",
    },
  },
  segmentedIndicator: {
    display: "none",
  },
  createGroupButton: {
    minHeight: 40,
    borderRadius: 12,
    padding: theme.spacing(1, 2),
    fontWeight: 700,
    textTransform: "none",
    color: "#fff",
    background: "linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)",
    boxShadow: "0 12px 24px rgba(37,99,235,0.22)",
    '&:hover': {
      background: "linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)",
    },
  },
  modalPaper: {
    borderRadius: 24,
    overflow: "hidden",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 30px 70px rgba(15,23,42,0.12)",
  },
  modalTitle: {
    padding: theme.spacing(3, 4, 2.5),
    background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(14,165,233,0.08))",
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: 700,
    color: "#0F172A",
  },
  modalSubtitle: {
    marginTop: theme.spacing(0.75),
    fontSize: 13,
    lineHeight: 1.6,
    color: "#64748B",
  },
  modalContent: {
    padding: theme.spacing(3.5, 4),
  },
  dropZone: {
    width: 120,
    height: 120,
    margin: "0 auto",
    borderRadius: "50%",
    border: "1.5px dashed #93C5FD",
    background: "linear-gradient(135deg, rgba(59,130,246,0.10), rgba(14,165,233,0.06))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: theme.spacing(1),
    color: "#2563EB",
    cursor: "pointer",
    overflow: "hidden",
  },
  dropZoneText: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1E40AF",
    textAlign: "center",
    maxWidth: 82,
    lineHeight: 1.4,
  },
  modalFieldLabel: {
    marginBottom: theme.spacing(0.75),
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
  },
  modalField: {
    width: "100%",
    '& .MuiOutlinedInput-root': {
      borderRadius: 10,
      background: "#FFFFFF",
      '& fieldset': {
        borderColor: "#E2E8F0",
      },
      '&:hover fieldset': {
        borderColor: "#CBD5E1",
      },
      '&.Mui-focused fieldset': {
        borderColor: "#2563EB",
      },
    },
  },
  modalActions: {
    padding: theme.spacing(2.5, 4),
    borderTop: "1px solid rgba(226,232,240,0.95)",
    background: "rgba(248,250,252,0.92)",
  },
  ghostButton: {
    borderRadius: 12,
    textTransform: "none",
    color: "#475569",
    background: "transparent",
    boxShadow: "none",
    '&:hover': {
      background: "rgba(148,163,184,0.12)",
    },
  },
  primaryButton: {
    borderRadius: 12,
    padding: theme.spacing(1.1, 2.8),
    fontWeight: 700,
    textTransform: "none",
    color: "#fff",
    background: "linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)",
    boxShadow: "0 12px 24px rgba(37,99,235,0.22)",
  },
  btnContainer: {
    textAlign: "right",
    padding: 10,
  },
}));

export function ChatModal({
  open,
  chat,
  type,
  handleClose,
  handleLoadNewChat,
  findChats,
  setChats,
  setChatsPageInfo,
  chats,
  loggedInUserId,
}) {
  const classes = useStyles();
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupImage, setGroupImage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setUsers([]);
      setDescription("");
      setGroupImage("");
      setImageFile(null);
      if (type === "edit" && chat && chat.users) {
        const userList = chat.users.map((u) => ({
          id: u.user.id,
          name: u.user.name,
        }));
        setUsers(userList);
        setTitle(chat.title || "");
        setDescription(chat.description || "");
        if (chat.groupImage) {
          setGroupImage(chat.groupImage);
        }
      }
    }
  }, [chat, open, type]);

  // const handleImageChange = (e) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setImageFile(e.target.files[0]);
  //     setGroupImage(URL.createObjectURL(e.target.files[0]));
  //   }
  // };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setImageFile(file);
      setGroupImage(previewUrl);
      console.log("Preview URL:", previewUrl);
    }
  };

  const handleSave = async () => {
    try {
      let uploadedImageUrl = groupImage;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await api.post("/chats/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedImageUrl = uploadRes.data.url;
      }

      if (type === "edit" && chat) {
        const { data } = await api.put(`/chats/${chat.id}`, {
          users,
          title,
          description,
          groupImage: uploadedImageUrl,
        });
        handleLoadNewChat(data);
      } else {
        const isCreatingGroup = users.length > 1 || title !== "";
        console.log("isCreatingGroup:", isCreatingGroup);

        if (!isCreatingGroup) {
          const selectedUserId = users[0]?.id;
          console.log("selectedUserId:", selectedUserId);
          console.log("loggedInUserId:", loggedInUserId);
          console.log("chats available:", chats);

          const existingChat = chats.find((c) => {
            const hasSelectedUser = c.users.some(
              (u) => u.userId === selectedUserId
            );
            const hasLoggedInUser = c.users.some(
              (u) => u.userId === loggedInUserId
            );
            const isIndividualChat = !c.isGroup && c.users.length === 2;

            console.log(
              `Checking chat ${c.id}: isIndividualChat=${isIndividualChat}, hasSelectedUser=${hasSelectedUser}, hasLoggedInUser=${hasLoggedInUser}`
            );

            return isIndividualChat && hasSelectedUser && hasLoggedInUser;
          });

          console.log("Found existingChat:", existingChat);

          if (existingChat) {
            toast.info(i18n.t("chatList.chatAlreadyExists"));
            handleLoadNewChat(existingChat);
            handleClose();
            return;
          }
        }

        const { data } = await api.post("/chats", {
          users,
          title,
          description,
          groupImage: uploadedImageUrl,
          isGroup: isCreatingGroup,
        });
        handleLoadNewChat(data);
      }
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(i18n.t("chatMessages.errorCreatingEditingChat"));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
      classes={{ paper: classes.modalPaper }}
    >
      <DialogTitle id="alert-dialog-title" className={classes.modalTitle}>
        <Typography className={classes.modalTitleText} component="div">
          {type === "edit"
            ? i18n.t("chatIndex.modal.editTitle") || "Modifica Gruppo"
            : i18n.t("chatIndex.modal.title") || "Crea Gruppo"}
        </Typography>
        <Typography className={classes.modalSubtitle} component="div">
          {i18n.t("chatIndex.modal.subtitle")}
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.modalContent}>
        <Grid spacing={3} container>
          <Grid xs={12} item style={{ textAlign: "center" }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="group-image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="group-image-upload" style={{ display: "inline-block" }}>
              <div className={classes.dropZone}>
                {groupImage ? (
                  <img
                    src={
                      typeof groupImage === "string"
                        ? groupImage.startsWith("http") || groupImage.startsWith("blob:")
                          ? groupImage
                          : `${getBackendUrl()}${groupImage}`
                        : URL.createObjectURL(groupImage)
                    }
                    alt="Group"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <>
                    <PhotoCameraOutlinedIcon style={{ fontSize: 30 }} />
                    <span className={classes.dropZoneText}>
                      {i18n.t("chatIndex.addGroupPhoto") || "Carica foto del gruppo"}
                    </span>
                  </>
                )}
              </div>
            </label>
          </Grid>
          <Grid xs={12} item>
            <Typography className={classes.modalFieldLabel}>
              {i18n.t("chatIndex.modal.name") || "Nome del gruppo"}
            </Typography>
            <TextField
              placeholder={i18n.t("chatIndex.modal.name") || "Nome del gruppo"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              className={classes.modalField}
            />
          </Grid>
          <Grid xs={12} item>
            <Typography className={classes.modalFieldLabel}>
              {i18n.t("chatIndex.modal.description") || "Descrizione"}
            </Typography>
            <TextField
              placeholder={i18n.t("chatIndex.modal.description") || "Descrizione"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              multiline
              rows={3}
              className={classes.modalField}
            />
          </Grid>
          <Grid xs={12} item>
            <UsersFilter
              onFiltered={(users) => setUsers(users)}
              initialUsers={users}
              label={i18n.t("chatIndex.modal.filterUsers") || "Cerca utenti da aggiungere"}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className={classes.modalActions}>
        <Button onClick={handleClose} className={classes.ghostButton}>
          {i18n.t("chatIndex.modal.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          className={classes.primaryButton}
          disabled={
            users === undefined ||
            users.length === 0 ||
            title === null ||
            title === "" ||
            title === undefined
          }
        >
          {i18n.t("chatIndex.modal.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Chat(props) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const history = useHistory();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("new");
  const [currentChat, setCurrentChat] = useState({});
  const [chats, setChats] = useState([]);
  const [chatsPageInfo, setChatsPageInfo] = useState({ hasMore: false });
  const [messages, setMessages] = useState([]);
  const [messagesPageInfo, setMessagesPageInfo] = useState({ hasMore: false });
  const [messagesPage, setMessagesPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState(0);
  const [showGroupChats, setShowGroupChats] = useState(false);
  const isMounted = useRef(true);
  const scrollToBottomRef = useRef();
  const messageListRef = useRef();
  const { id } = useParams();
  const isMdUp = useResponsive();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [selectedChatForForward, setSelectedChatForForward] = useState(null);
  const [justOpenedChat, setJustOpenedChat] = useState(false);

  // Definir socket e companyId no escopo da função
  const companyId = user?.companyId;
  const socket = companyId
    ? socketConnection({ companyId, userId: user?.id })
    : null;

  // Monitorar mudanças no estado chats
  useEffect(() => {
    const groups = chats.filter(
      (chat) => chat.isGroup === true || chat.isGroup === "true"
    );
    const individualChats = chats.filter(
      (chat) => !(chat.isGroup === true || chat.isGroup === "true")
    );
  }, [chats, showGroupChats]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current && user?.id) {
      findChats()
        .then((data) => {
          const { records } = data;
          console.log("Chats encontrados:", records.length);
          if (isMounted.current && records.length > 0) {
            setChats(records);
            setChatsPageInfo(data);

            if (id && records.length) {
              const chat = records.find((r) => r.uuid === id);
              if (chat) {
                selectChat(
                  chat,
                  "useEffect[user?.id] (carregar chats iniciais)"
                );
              }
            }
          } else {
            console.log("Nenhum chat encontrado ou componente desmontado");
          }
        })
        .catch((err) => {
          console.error("Erro ao carregar chats iniciais:", err);
        });
    } else {
      console.log("Componente não montado ou usuário não disponível");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user.id) return;

    const onChatUser = (data) => {
      if (isMounted.current) {
        if (data.action === "create") {
          setChats((prev) => [data.record, ...prev]);
        }
        if (data.action === "update") {
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === data.record.id ? { ...chat, ...data.record } : chat
            )
          );
          if (currentChat && currentChat.id === data.record.id) {
            setCurrentChat(data.record);
          }
        }
      }
    };
    const onChat = (data) => {
      if (!isMounted.current) return;
      if (isMounted.current) {
        if (data.action === "delete") {
          setChats((prev) => prev.filter((c) => c.id !== +data.id));
          setMessages([]);
          setMessagesPage(1);
          setMessagesPageInfo({ hasMore: false });
          setCurrentChat({});
          history.push("/chats");
          setTab(0);
        }
        if (data.action === "new-message" || data.action === "update") {
          // Só atualize se NÃO for o chat atualmente aberto
          if (!currentChat || currentChat.id !== data.chat.id) {
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === data.chat.id ? { ...chat, ...data.chat } : chat
              )
            );
          }
        }
      }
    };

    if (socket && companyId) {
      socket.on(`company-${companyId}-chat-user-${user.id}`, onChatUser);
      socket.on(`company-${companyId}-chat`, onChat);

      return () => {
        socket.off(`company-${companyId}-chat-user-${user.id}`, onChatUser);
        socket.off(`company-${companyId}-chat`, onChat);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, socket, companyId]);

  useEffect(() => {
    if (
      isObject(currentChat) &&
      has(currentChat, "id") &&
      socket &&
      companyId
    ) {
      const onCurrentChat = (data) => {
        if (isMounted.current) {
          if (data.action === "new-message") {
            setMessages((prev) => {
              // Remove mensagem otimista (temp) com mesmo conteúdo e usuário
              const filtered = prev.filter(
                (msg) =>
                  !(
                    msg.id?.toString().startsWith("temp-") &&
                    msg.senderId === data.newMessage.senderId &&
                    msg.message === data.newMessage.message
                  )
              );
              // Evita duplicidade da real
              if (filtered.some((msg) => msg.id === data.newMessage.id)) {
                return filtered;
              }
              return [...filtered, data.newMessage];
            });
            const changedChats = chats.map((chat) => {
              if (chat.id === data.newMessage.chatId) {
                return {
                  ...chat,
                  ...data.chat,
                  lastMessage: data.newMessage,
                  updatedAt: data.newMessage.createdAt,
                };
              }
              return chat;
            });
            setChats(changedChats);
            if (typeof scrollToBottomRef.current === "function") {
              setTimeout(() => {
                scrollToBottomRef.current();
              }, 300);
            }
            // NÃO altere setMessagesPage aqui!
          } else if (data.action === "edit-message") {
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === data.message.id ? data.message : msg
              )
            );
          } else if (data.action === "delete-message") {
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === data.message.id ? data.message : msg
              )
            );
          }

          if (data.action === "update") {
            const changedChats = chats.map((chat) => {
              if (chat.id === data.chat.id) {
                return {
                  ...chat,
                  ...data.chat,
                };
              }
              return chat;
            });
            setChats(changedChats);
            if (typeof scrollToBottomRef.current === "function") {
              scrollToBottomRef.current();
            }
          }
        }
      };

      socket.on(`company-${companyId}-chat-${currentChat.id}`, onCurrentChat);

      return () => {
        socket.off(
          `company-${companyId}-chat-${currentChat.id}`,
          onCurrentChat
        );
      };
    }
  }, [currentChat, chats, companyId, socket]);

  // Modifique selectChat para buscar apenas a primeira página ao abrir o chat
  const selectChat = async (chat, reason = "manual") => {
    console.log(`[selectChat] Motivo: ${reason}`, chat);
    if (!isMounted.current) return;
    setMessages([]);
    setMessagesPage(1);
    setMessagesPageInfo(null);
    setJustOpenedChat(true);

    try {
      // Buscar chat atualizado do backend usando UUID
      const { data } = await api.get(`/chats/${chat.uuid}`);
      if (!isMounted.current) return;
      setCurrentChat(data);

      // Buscar apenas a primeira página de mensagens
      await findMessages(data.id, false, 1); // Passa página 1 explicitamente
    } catch (err) {
      if (!isMounted.current) return;
      setCurrentChat(chat);
      await findMessages(chat.id, false, 1);
    }
  };

  // No sendMessage, garanta que NENHUM findMessages, selectChat ou loadMoreMessages é chamado após o envio.
  const sendMessage = async (contentMessage) => {
    if (!currentChat || !currentChat.id) {
      console.error("Nenhum chat selecionado para enviar mensagem");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/chats/${currentChat.id}/messages`, {
        message: contentMessage,
      });
      // Não chame findMessages, selectChat ou loadMoreMessages aqui!
      // Apenas limpe o campo de input, a mensagem será adicionada pelo socket
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
    setLoading(false);
  };

  const deleteChat = async (chat) => {
    try {
      await api.delete(`/chats/${chat.id}`);
    } catch (err) {}
  };

  // Modifique findMessages para aceitar página explicitamente
  const findMessages = async (chatId, isLoadMore = false, page = null) => {
    if (!isMounted.current || !chatId) return;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    let currentScrollHeight = 0;
    let currentScrollTop = 0;
    if (isLoadMore) {
      const messageListElement = document.querySelector(".messageList");
      currentScrollHeight = messageListElement?.scrollHeight || 0;
      currentScrollTop = messageListElement?.scrollTop || 0;
    }

    try {
      const pageToFetch = page !== null ? page : messagesPage;
      const url = `/chats/${chatId}/messages?pageNumber=${pageToFetch}`;
      const { data } = await api.get(url);
      if (!isMounted.current) return;

      if (isMounted.current) {
        const isFirstPage = pageToFetch === 1;
        if (isLoadMore) {
          setMessagesPage((prev) => prev + 1);
        }
        setMessagesPageInfo(data);
        if (isFirstPage) {
          setMessages(data.records);
        } else {
          setMessages((prev) => [...data.records, ...prev]);
          if (isLoadMore) {
            setTimeout(() => {
              if (!isMounted.current) return;
              const messageListElement = document.querySelector(".messageList");
              if (messageListElement) {
                const newScrollHeight = messageListElement.scrollHeight;
                const scrollDifference = newScrollHeight - currentScrollHeight;
                messageListElement.scrollTop =
                  currentScrollTop + scrollDifference;
              }
            }, 100);
          }
        }
      }
    } catch (err) {
      if (!isMounted.current) return;
      console.error("Erro ao carregar mensagens:", err);
    } finally {
      if (isMounted.current) {
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    }
  };

  const loadMoreMessages = async () => {
    if (
      !loadingMore &&
      currentChat &&
      currentChat.id &&
      messagesPageInfo?.hasMore
    ) {
      await findMessages(currentChat.id, true); // Não passe page aqui!
    }
  };

  const findChats = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/chats`);

      // Contar grupos e chats individuais
      const groups = data.records.filter(
        (chat) => chat.isGroup === true || chat.isGroup === "true"
      );
      const individualChats = data.records.filter(
        (chat) => !(chat.isGroup === true || chat.isGroup === "true")
      );

      if (isMounted.current) {
        setChats(data.records);
        setChatsPageInfo(data);
        console.log("Chats definidos no estado");
      }
      return data;
    } catch (err) {
      console.log("Erro ao carregar chats:", err);
      return { records: [], hasMore: false };
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleLoadNewChat = (data) => {
    if (!isMounted.current) return;

    // Limpar estado anterior
    setMessages([]);
    setMessagesPage(1);
    setMessagesPageInfo(null);
    setCurrentChat(data);
    setJustOpenedChat(true); // Ativar scroll automático

    // No mobile, não mudar a tab automaticamente
    // Deixar o usuário escolher qual tab usar

    history.push(`/chats/${data.uuid}`);

    // Não chame findMessages aqui, selectChat já faz isso
    selectChat(data, "handleLoadNewChat (novo chat criado/editado)");
    // Atualiza a lista de chats
    findChats().then((chatsData) => {
      if (isMounted.current && chatsData && chatsData.records) {
        setChats(chatsData.records);
        setChatsPageInfo(chatsData);
      }
    });
  };

  const handleEditMessage = (message) => {
    // Regra: só pode editar em até 10 minutos
    if (new Date() - new Date(message.createdAt) > 10 * 60 * 1000) {
      alert("Só é possível editar mensagens enviadas há menos de 10 minutos.");
      return;
    }
    setSelectedMessage(message);
    setEditText(message.message);
    setEditModalOpen(true);
  };

  const handleDeleteMessage = (message) => {
    setSelectedMessage(message);
    setDeleteModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const { data } = await api.put(`/chats/messages/${selectedMessage.id}`, {
        message: editText,
      });
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === selectedMessage.id ? { ...msg, message: editText } : msg
        )
      );
      setEditModalOpen(false);
      setSelectedMessage(null);
      setEditText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/chats/messages/${selectedMessage.id}`);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === selectedMessage.id
            ? {
                ...msg,
                isDeleted: true,
                message: "Esta mensagem foi apagada",
                mediaPath: null,
                forwardedFrom: null,
                replyTo: null,
              }
            : msg
        )
      );
      setDeleteModalOpen(false);
      setSelectedMessage(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleForwardMessage = (message) => {
    setSelectedMessage(message);
    setForwardModalOpen(true);
  };

  const handleForwardSubmit = async () => {
    try {
      await api.post(`/chats/messages/${selectedMessage.id}/forward`, {
        targetChatId: selectedChatForForward,
      });
      setForwardModalOpen(false);
      setSelectedMessage(null);
      setSelectedChatForForward(null);
    } catch (err) {
      console.error(err);
    }
  };

  const renderGrid = () => {
    const filteredChats = chats
      .filter((chat) => {
        const isGroup = chat.isGroup === true || chat.isGroup === "true";
        const shouldShow = showGroupChats ? isGroup : !isGroup;

        return shouldShow;
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return (
      <Grid className={classes.gridContainer} container>
        <Grid className={classes.gridItem} md={3} item>
          <div className={classes.segmentedBar}>
            <Tabs
              value={showGroupChats ? 1 : 0}
              onChange={(e, value) => setShowGroupChats(value === 1)}
              className={classes.segmentedControl}
              TabIndicatorProps={{ className: classes.segmentedIndicator }}
            >
              <Tab className={classes.segmentedTab} label={i18n.t("chatIndex.chats")} />
              <Tab className={classes.segmentedTab} label={i18n.t("chatIndex.groups")} />
            </Tabs>
            <Button
              onClick={() => {
                setDialogType("new");
                setShowDialog(true);
              }}
              className={classes.createGroupButton}
              startIcon={<AddIcon />}
            >
              {i18n.t("chatIndex.createGroup")}
            </Button>
          </div>
          <ChatList
            chats={filteredChats}
            pageInfo={chatsPageInfo}
            loading={loading}
            handleSelectChat={(chat) =>
              selectChat(chat, "seleção manual na lista")
            }
            handleDeleteChat={(chat) => deleteChat(chat)}
            handleEditChat={(chat) => {
              setCurrentChat(chat);
              setDialogType("edit");
              setShowDialog(true);
            }}
            findChats={findChats}
          />
        </Grid>
        <Grid className={classes.gridItem} md={9} item>
          {isObject(currentChat) && has(currentChat, "id") && (
            <ChatMessages
              chat={currentChat}
              scrollToBottomRef={scrollToBottomRef}
              pageInfo={messagesPageInfo}
              messages={messages}
              loading={loading}
              loadingMore={loadingMore}
              handleSendMessage={sendMessage}
              handleLoadMore={loadMoreMessages}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
              onForward={handleForwardMessage}
              justOpenedChat={justOpenedChat}
              setJustOpenedChat={setJustOpenedChat}
              messageListRef={messageListRef}
              addOptimisticMessage={addOptimisticMessage}
            />
          )}
        </Grid>
      </Grid>
    );
  };

  const renderTab = () => {
    return (
      <Grid className={classes.gridContainer} container>
        {!currentChat.id ? (
          <Grid item xs={12}>
            <div className={classes.segmentedBar}>
              <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                className={classes.segmentedControl}
                TabIndicatorProps={{ className: classes.segmentedIndicator }}
              >
                <Tab className={classes.segmentedTab} label={i18n.t("chatIndex.chats") || "Chats"} />
                <Tab className={classes.segmentedTab} label={i18n.t("chatIndex.groups") || "Gruppi"} />
              </Tabs>
              <Button
                onClick={() => {
                  setDialogType("new");
                  setShowDialog(true);
                }}
                className={classes.createGroupButton}
                startIcon={<AddIcon />}
              >
                {i18n.t("chatIndex.createGroup") || "Crea Gruppo"}
              </Button>
            </div>
            {tab === 0 && (
              <Grid className={classes.gridItemTab} md={12} item>
                <ChatList
                  chats={chats.filter((chat) => {
                    const isGroup =
                      chat.isGroup === true || chat.isGroup === "true";
                    return !isGroup;
                  })}
                  pageInfo={chatsPageInfo}
                  loading={loading}
                  handleSelectChat={(chat) => selectChat(chat)}
                  handleDeleteChat={(chat) => deleteChat(chat)}
                  findChats={findChats}
                />
              </Grid>
            )}
            {tab === 1 && (
              <Grid className={classes.gridItemTab} md={12} item>
                <ChatList
                  chats={chats.filter((chat) => {
                    const isGroup =
                      chat.isGroup === true || chat.isGroup === "true";
                    return isGroup;
                  })}
                  pageInfo={chatsPageInfo}
                  loading={loading}
                  handleSelectChat={(chat) => selectChat(chat)}
                  handleDeleteChat={(chat) => deleteChat(chat)}
                  handleEditChat={(chat) => {
                    setCurrentChat(chat);
                    setDialogType("edit");
                    setShowDialog(true);
                  }}
                  findChats={findChats}
                />
              </Grid>
            )}
          </Grid>
        ) : (
          <Grid
            className={classes.gridItemTab}
            md={12}
            item
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
              padding: 0,
            }}
          >
            {/* Cabeçalho mobile da conversa */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                borderBottom: "1px solid #eee",
                background: "#fff",
                position: "sticky",
                top: 0,
                zIndex: 100,
              }}
            >
              <IconButton onClick={() => setCurrentChat({})}>
                <ArrowBackIcon />
              </IconButton>
              {/* <Avatar
                src={
                  currentChat.isGroup
                    ? currentChat.groupImage
                      ? currentChat.groupImage.startsWith("http")
                        ? currentChat.groupImage
                        : `${getBackendUrl()}${currentChat.groupImage}`
                      : undefined
                    : currentChat.users &&
                      currentChat.users.find((u) => u.userId !== user.id)?.user
                        ?.profileImage
                    ? currentChat.users
                        .find((u) => u.userId !== user.id)
                        .user.profileImage.startsWith("http")
                      ? currentChat.users.find((u) => u.userId !== user.id).user
                          .profileImage
                      : `${getBackendUrl()}/public/company${
                          currentChat.users.find((u) => u.userId !== user.id)
                            .user.companyId
                        }/user/${
                          currentChat.users.find((u) => u.userId !== user.id)
                            .user.profileImage
                        }`
                    : undefined
                }
                style={{ marginRight: 12 }}
              >
                {currentChat.isGroup
                  ? currentChat.title?.charAt(0) || "G"
                  : (currentChat.users &&
                      currentChat.users
                        .find((u) => u.userId !== user.id)
                        ?.user?.name?.charAt(0)) ||
                    "?"}
              </Avatar> */}

              {/* Nome do usuário ou grupo */}
              {/* <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {currentChat.isGroup
                  ? currentChat.title || i18n.t("chatList.group")
                  : (currentChat.users &&
                      currentChat.users.find((u) => u.userId !== user.id)?.user
                        ?.name) ||
                    i18n.t("chatList.user")}
              </Typography> */}
            </div>
            {/* Container flexível para ChatMessages */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <ChatMessages
                chat={currentChat}
                scrollToBottomRef={scrollToBottomRef}
                pageInfo={messagesPageInfo}
                messages={messages}
                loading={loading}
                loadingMore={loadingMore}
                handleSendMessage={sendMessage}
                handleLoadMore={loadMoreMessages}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onForward={handleForwardMessage}
                // messageListRef={messageListRef}
                // isFirstPage={messagesPage === 2}
                justOpenedChat={justOpenedChat}
                setJustOpenedChat={setJustOpenedChat}
                addOptimisticMessage={addOptimisticMessage}
              />
            </div>
          </Grid>
        )}
      </Grid>
    );
  };

  useEffect(() => {
    if (id && chats.length) {
      const chat = chats.find((r) => r.uuid === id);
      // Só chama selectChat se o chat atual for diferente
      if (chat && (!currentChat || currentChat.id !== chat.id)) {
        selectChat(
          chat,
          "useEffect[id, chats] (mudança de rota ou lista de chats)"
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, chats]);

  const addOptimisticMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <>
      <ChatModal
        type={dialogType}
        open={showDialog}
        chat={currentChat}
        handleLoadNewChat={handleLoadNewChat}
        handleClose={() => setShowDialog(false)}
        findChats={findChats}
        setChats={setChats}
        setChatsPageInfo={setChatsPageInfo}
        chats={chats}
        loggedInUserId={user.id}
      />
      <Paper
        className={classes.mainContainer}
        // style={{
        //   height: "100%",
        //   minHeight: 0,
        //   display: "flex",
        //   flexDirection: "column",
        //   padding: 0,
        // }}
      >
        {isMdUp ? renderGrid() : renderTab()}
      </Paper>
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Modifica messaggio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Messaggio"
            type="text"
            fullWidth
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            multiline
            minRows={3}
            maxRows={10}
            inputProps={{ style: { fontSize: 18 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} color="secondary">
            {i18n.t("chatIndex.cancel")}
          </Button>
          <Button onClick={handleEditSubmit} color="primary">
            {i18n.t("chatIndex.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>{i18n.t("chatIndex.deleteGroup")}</DialogTitle>
        <DialogContent>
          <Typography>{i18n.t("chatIndex.deleteGroupConfirm")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} color="secondary">
            {i18n.t("chatIndex.cancel")}
          </Button>
          <Button onClick={handleDeleteSubmit} color="primary">
            {i18n.t("chatIndex.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
      >
        <DialogTitle>Encaminhar Mensagem</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Seleziona la conversazione</InputLabel>
            <Select
              value={selectedChatForForward || ""}
              onChange={(e) => setSelectedChatForForward(e.target.value)}
            >
              {chats.map((chat) => (
                <MenuItem key={chat.id} value={chat.id}>
                  {chat.isGroup
                    ? chat.title
                    : chat.users.find((u) => u.userId !== user.id)?.user?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForwardModalOpen(false)} color="secondary">
            Annulla
          </Button>
          <Button
            onClick={handleForwardSubmit}
            color="primary"
            disabled={!selectedChatForForward}
          >
            Encaminhar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default withWidth()(Chat);
