// src/pages/Contacts/index.js (versão corrigida)
import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
} from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Facebook, Instagram, WhatsApp, Close } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import BlockIcon from "@material-ui/icons/Block";
import Checkbox from "@material-ui/core/Checkbox";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import { alpha } from "@material-ui/core/styles";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";
import ContactDeleteConfirmModal from "../../components/ContactDeleteConfirmModal";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";

import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { TagsFilter } from "../../components/TagsFilter";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import formatSerializedId from "../../utils/formatSerializedId";
import { v4 as uuidv4 } from "uuid";

import { ArrowDropDown, Backup, ContactPhone, DeleteSweep } from "@material-ui/icons";
import { Menu, MenuItem } from "@material-ui/core";

import ContactImportWpModal from "../../components/ContactImportWpModal";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "BULK_DELETE_CONTACTS") {
    const contactIds = action.payload;
    return state.filter(contact => !contactIds.includes(contact.id));
  }

  if (action.type === "DELETE_ALL_CONTACTS") {
    const { excludeIds = [] } = action.payload;
    return state.filter(contact => excludeIds.includes(contact.id));
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "SET_TOTAL_COUNT") {
    // Não altera o estado, mas permite rastrear o total
    return state;
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1.5),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    background: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: 16,
    boxShadow: "0 14px 28px rgba(15, 23, 42, 0.08)",
    backdropFilter: "blur(10px)",
  },
  avatarCell: {
    width: '60px',
    padding: theme.spacing(1),
  },
  idCell: {
    width: '80px',
  },
  checkboxCell: {
    width: '48px',
    padding: theme.spacing(0, 1),
  },
  clickableAvatar: {
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  imageDialog: {
    '& .MuiDialog-paper': {
      maxWidth: '520px',
      maxHeight: '520px',
      borderRadius: 16,
      background: "rgba(255, 255, 255, 0.9)",
      boxShadow: "0 20px 40px rgba(15, 23, 42, 0.18)",
      backdropFilter: "blur(12px)",
    },
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
    fontWeight: 600,
  },
  profileImage: {
    width: '100%',
    height: 'auto',
    maxWidth: '400px',
    maxHeight: '400px',
    objectFit: 'contain',
    borderRadius: 12,
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.12)",
  },
  toolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    minHeight: 48,
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.3)",
  },
  toolbarHighlight: {
    backgroundColor: "rgba(59, 130, 246, 0.22)",
  },
  toolbarTitle: {
    flex: '1 1 100%',
    fontWeight: 600,
  },
  bulkActions: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  bulkButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    boxShadow: "0 10px 20px rgba(15, 23, 42, 0.10)",
  },
  tableHeadCell: {
    fontWeight: 700,
    color: "rgba(15, 23, 42, 0.75)",
    background: "rgba(248, 250, 252, 0.85)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.35)",
    paddingTop: theme.spacing(1.4),
    paddingBottom: theme.spacing(1.4),
  },
  tableRow: {
    transition: "background-color 0.15s ease",
    "&:hover": {
      backgroundColor: "rgba(226, 232, 240, 0.5)",
    },
  },
  tableCell: {
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    paddingTop: theme.spacing(1.2),
    paddingBottom: theme.spacing(1.2),
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: "0.75rem",
    fontWeight: 700,
    border: "1px solid rgba(148, 163, 184, 0.3)",
    background: "rgba(248, 250, 252, 0.9)",
  },
  statusActive: {
    color: "rgba(22, 163, 74, 0.95)",
    borderColor: "rgba(22, 163, 74, 0.3)",
    background: "rgba(34, 197, 94, 0.12)",
  },
  statusInactive: {
    color: "rgba(220, 38, 38, 0.95)",
    borderColor: "rgba(220, 38, 38, 0.3)",
    background: "rgba(239, 68, 68, 0.12)",
  },
  actionIconButton: {
    height: 32,
    width: 32,
    borderRadius: 10,
    border: "1px solid rgba(148, 163, 184, 0.45)",
    background: "rgba(255, 255, 255, 0.85)",
    boxShadow: "0 6px 14px rgba(15, 23, 42, 0.08)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 10px 18px rgba(15, 23, 42, 0.12)",
      borderColor: "rgba(59, 130, 246, 0.5)",
    },
  },
  columnDivider: {
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      right: 0,
      top: "20%",
      height: "60%",
      width: 1,
      background: "rgba(148, 163, 184, 0.25)",
    },
  },
  headerStats: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginLeft: theme.spacing(1),
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(59, 130, 246, 0.12)",
    border: "1px solid rgba(59, 130, 246, 0.35)",
    color: "rgba(15, 23, 42, 0.85)",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  searchField: {
    minWidth: 240,
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: 999,
    border: "1px solid rgba(148, 163, 184, 0.35)",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.06)",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  headerButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    boxShadow: "0 10px 20px rgba(15, 23, 42, 0.10)",
  },
  headerMenuPaper: {
    borderRadius: 16,
    border: "1px solid rgba(148, 163, 184, 0.35)",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
    background: "rgba(255, 255, 255, 0.96)",
    backdropFilter: "blur(10px)",
    padding: theme.spacing(0.5),
  },
  headerMenuItem: {
    borderRadius: 12,
    margin: theme.spacing(0.25, 0.5),
    padding: theme.spacing(0.75, 1.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.25),
    transition: "background-color 0.15s ease, transform 0.15s ease",
    "&:hover": {
      backgroundColor: "rgba(226, 232, 240, 0.6)",
      transform: "translateX(2px)",
    },
  },
}));

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [totalContactsCount, setTotalContactsCount] = useState(0);

  // Estados para seleção múltipla
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [selectAllMode, setSelectAllMode] = useState(false); // true = todos da empresa, false = apenas da página

  const [importContactModalOpen, setImportContactModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [ImportContacts, setImportContacts] = useState(null);
  const [blockingContact, setBlockingContact] = useState(null);
  const [unBlockingContact, setUnBlockingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exportContact, setExportContact] = useState(false);
  const [confirmChatsOpen, setConfirmChatsOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  
  // Estados para exclusão múltipla com confirmação tipada
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(''); // 'selected' ou 'all'
  
  const fileUploadRef = useRef(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const { setCurrentTicket } = useContext(TicketsContext);

  // Estados para o modal de imagem
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedContactName, setSelectedContactName] = useState('');

  const { getAll: getAllSettings } = useCompanySettings();
  const [hideNum, setHideNum] = useState(false);
  const [enableLGPD, setEnableLGPD] = useState(false);
  
  useEffect(() => {
    async function fetchData() {
      const settingList = await getAllSettings(user.companyId);

      for (const [key, value] of Object.entries(settingList)) {
        if (key === "enableLGPD") setEnableLGPD(value === "enabled");
        if (key === "lgpdHideNumber") setHideNum(value === "enabled");
      }
    }
    fetchData();
  }, []);

  // Funções para seleção múltipla CORRIGIDAS
  const handleSelectContact = (contactId) => {
    console.log(contactId);
     
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
    setSelectAllMode(false); // Desativa modo "todos da empresa" quando seleciona individualmente
  };

  const handleSelectAllContacts = () => {
    if (selectAllMode) {
      // Se já está em modo "todos", desmarcar tudo
      setSelectedContacts(new Set());
      setSelectAllMode(false);
    } else {
      // Verificar se todos da página atual estão selecionados
      const currentPageIds = contacts.map(contact => contact.id);
      const allCurrentSelected = currentPageIds.every(id => selectedContacts.has(id));
      console.log("currentPageIds:", currentPageIds);
      console.log("allCurrentSelected:", allCurrentSelected);
      if (allCurrentSelected && selectedContacts.size === currentPageIds.length) {
        // Se todos da página estão selecionados, ativar modo "todos da empresa"
        console.log("solo selezionati:", currentPageIds);
        setSelectAllMode(true);
        setSelectedContacts(new Set()); // Limpar seleção individual
      } else {
        // Selecionar todos da página atual
        console.log("pagina actual:",currentPageIds);
        setSelectedContacts(new Set(currentPageIds));
        setSelectAllMode(false);
      }
    }
  };

  // Limpar seleção quando contatos mudam
  useEffect(() => {
    setSelectedContacts(new Set());
    setSelectAllMode(false);
  }, [searchParam, selectedTags]);

  // Função para obter contagem correta
  const getSelectedCount = () => {
    if (selectAllMode) {
      return totalContactsCount;
    }
    return selectedContacts.size;
  };

  // Função para obter texto do botão
  const getSelectionButtonText = () => {
    if (selectAllMode) {
      return `${i18n.t("contacts.bulk.deleteAll")} (${totalContactsCount})`;
    }
    if (selectedContacts.size > 0) {
      return `${i18n.t("contacts.bulk.deleteSelected")} (${selectedContacts.size})`;
    }
    return i18n.t("contacts.confirmationModal.deleteTitle");
  };

  // Funções para exclusão múltipla CORRIGIDAS
  const handleBulkDeleteClick = () => {
    if (selectAllMode) {
      setDeleteType('all');
    } else if (selectedContacts.size > 0) {
      setDeleteType('selected');
    } else {
      toast.warning(i18n.t("contacts.bulk.noSelection"));
      return;
    }
    setDeleteConfirmModalOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      if (deleteType === 'all') {
        await api.delete("/contacts/all", {
          data: {
            confirmation: "DELETE_ALL_CONTACTS",
            excludeIds: []
          }
        });
        toast.success(`${i18n.t("contacts.bulk.deleteAll")} - ${totalContactsCount} ${i18n.t("contacts.title").toLowerCase()}`);
      } else {
        const contactIds = Array.from(selectedContacts);
        await api.post("/contacts/bulk-delete", { contactIds });
        toast.success(`${contactIds.length} ${i18n.t("contacts.title").toLowerCase()} ${i18n.t("contacts.toasts.deleted").toLowerCase()}`);
      }
      
      // Resetar seleções
      setSelectedContacts(new Set());
      setSelectAllMode(false);
      
      // Atualizar lista
      setSearchParam("");
      setPageNumber(1);
      
    } catch (err) {
      toastError(err);
    } finally {
      setDeleteConfirmModalOpen(false);
      setDeleteType('');
    }
  };

  const handleDeleteAllClick = () => {
    setDeleteType('all');
    setDeleteConfirmModalOpen(true);
  };

  // Função para abrir modal da imagem
  const handleOpenImageModal = (imageUrl, contactName) => {
    setSelectedImage(imageUrl);
    setSelectedContactName(contactName);
    setImageModalOpen(true);
  };

  // Função para fechar modal da imagem
  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage('');
    setSelectedContactName('');
  };

  const handleImportExcel = async () => {
    try {
      const formData = new FormData();
      formData.append("file", fileUploadRef.current.files[0]);
      await api.request({
        url: `/contacts/upload`,
        method: "POST",
        data: formData,
      });
      history.go(0);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam, selectedTags]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: {
              searchParam,
              pageNumber,
              contactTag: JSON.stringify(selectedTags),
            },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setTotalContactsCount(data.count); // Armazenar contagem total
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, selectedTags]);

  useEffect(() => {
    const companyId = user.companyId;

    const onContactEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
        setTotalContactsCount(prev => Math.max(0, prev - 1));
      }

      if (data.action === "bulk-delete") {
        dispatch({ type: "BULK_DELETE_CONTACTS", payload: data.contactIds });
        setTotalContactsCount(prev => Math.max(0, prev - data.contactIds.length));
      }

      if (data.action === "delete-all") {
        dispatch({ type: "DELETE_ALL_CONTACTS", payload: { excludeIds: data.excludeIds } });
        setTotalContactsCount(data.excludeIds.length);
      }
    };
    
    socket.on(`company-${companyId}-contact`, onContactEvent);

    return () => {
      socket.off(`company-${companyId}-contact`, onContactEvent);
    };
  }, [socket]);

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      handleSelectTicket(ticket);
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setSelectedTags(tags);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleBlockContact = async (contactId) => {
    try {
      await api.put(`/contacts/block/${contactId}`, { active: false });
      toast.success(i18n.t("contacts.modal.blocked"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
    setBlockingContact(null);
  };

  const handleUnBlockContact = async (contactId) => {
    try {
      await api.put(`/contacts/block/${contactId}`, { active: true });
      toast.success(i18n.t("contacts.modal.active"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
    setUnBlockingContact(null);
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      history.go(0);
      setImportContacts(false);
    } catch (err) {
      toastError(err);
      setImportContacts(false);
    }
  };

  const handleimportChats = async () => {
    try {
      await api.post("/contacts/import/chats");
      history.go(0);
    } catch (err) {
      toastError(err);
    }
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

  // Determinar qual ação de confirmação executar para modais simples
  const getConfirmAction = () => {
    if (deletingContact) return () => handleDeleteContact(deletingContact.id);
    if (blockingContact) return () => handleBlockContact(blockingContact.id);
    if (unBlockingContact) return () => handleUnBlockContact(unBlockingContact.id);
    if (ImportContacts) return handleimportContact;
    return handleImportExcel;
  };

  // Determinar título do modal de confirmação simples
  const getConfirmTitle = () => {
    if (deletingContact) return `${i18n.t("contacts.confirmationModal.deleteTitle")} ${deletingContact.name}?`;
    if (blockingContact) return `${i18n.t("contacts.confirmationModal.blockContact").replace("?", "")} ${blockingContact.name}?`;
    if (unBlockingContact) return `${i18n.t("contacts.confirmationModal.unblockContact").replace("?", "")} ${unBlockingContact.name}?`;
    if (ImportContacts) return i18n.t("contacts.confirmationModal.importTitlte");
    return i18n.t("contactListItems.confirmationModal.importTitlte");
  };

  // Determinar mensagem do modal de confirmação simples
  const getConfirmMessage = () => {
    if (exportContact) return i18n.t("contacts.confirmationModal.exportContact");
    if (deletingContact) return i18n.t("contacts.confirmationModal.deleteMessage");
    if (blockingContact) return i18n.t("contacts.confirmationModal.blockContact");
    if (unBlockingContact) return i18n.t("contacts.confirmationModal.unblockContact");
    if (ImportContacts) return i18n.t("contacts.confirmationModal.importMessage");
    return i18n.t("contactListItems.confirmationModal.importMessage");
  };

  const selectedCount = getSelectedCount();
  const isAnyContactSelected = selectAllMode || selectedContacts.size > 0;

  // Status do checkbox "selecionar todos"
  const selectAllCheckboxStatus = () => {
    if (selectAllMode) return { checked: true, indeterminate: false };
    
    const currentPageIds = contacts.map(contact => contact.id);
    const selectedInCurrentPage = currentPageIds.filter(id => selectedContacts.has(id)).length;
    
    if (selectedInCurrentPage === 0) {
      return { checked: false, indeterminate: false };
    } else if (selectedInCurrentPage === currentPageIds.length) {
      return { checked: true, indeterminate: false };
    } else {
      return { checked: false, indeterminate: true };
    }
  };

  const checkboxStatus = selectAllCheckboxStatus();

  return (
    <MainContainer className={classes.mainContainer}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      ></ContactModal>
      
      {/* Modal de confirmação tipada para exclusão */}
      <ContactDeleteConfirmModal
        open={deleteConfirmModalOpen}
        onClose={() => setDeleteConfirmModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        deleteType={deleteType}
        selectedCount={selectedContacts.size}
        totalCount={totalContactsCount}
      />
      
      {/* Modal para visualizar imagem de perfil */}
      <Dialog
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        className={classes.imageDialog}
        maxWidth="md"
      >
        <DialogTitle className={classes.dialogTitle}>
          <span>{i18n.t("contacts.modal.profilePhoto")} - {selectedContactName}</span>
          <IconButton onClick={handleCloseImageModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={`Foto de perfil de ${selectedContactName}`}
              className={classes.profileImage}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px',
              color: '#666'
            }}>
              {i18n.t("contacts.modal.imageUnavailable")}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação simples para outras ações */}
      <ConfirmationModal
        title={getConfirmTitle()}
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={getConfirmAction()}
      >
        {getConfirmMessage()}
      </ConfirmationModal>
      
      <ConfirmationModal
        title={i18n.t("contacts.confirmationModal.importChat")}
        open={confirmChatsOpen}
        onClose={setConfirmChatsOpen}
        onConfirm={(e) => handleimportChats()}
      >
        {i18n.t("contacts.confirmationModal.wantImport")}
      </ConfirmationModal>

      <MainHeader>
        <Title>
          {i18n.t("contacts.title")} ({totalContactsCount})
          {isAnyContactSelected && (
            <span style={{ color: '#f50057', marginLeft: 8 }}>
              - {selectedCount} {i18n.t("contacts.bulk.selected")} {selectAllMode && i18n.t("contacts.bulk.allSelected")}
            </span>
          )}
        </Title>
        <MainHeaderButtonsWrapper>
          <TagsFilter onFiltered={handleSelectedTags} />
          <TextField
            className={classes.searchField}
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="secondary" />
                </InputAdornment>
              ),
            }}
          />
          
          {/* Botões de ação em lote */}
          {isAnyContactSelected && (
            <div className={classes.bulkActions}>
              <Tooltip title={selectAllMode ? i18n.t("contacts.bulk.deleteAll") : i18n.t("contacts.bulk.deleteSelected")}>
                <Button
                  className={classes.bulkButton}
                  variant="contained"
                  color="secondary"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleBulkDeleteClick}
                >
                  {getSelectionButtonText()}
                </Button>
              </Tooltip>
            </div>
          )}

          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Button
                  className={classes.headerButton}
                  variant="contained"
                  color="primary"
                  {...bindTrigger(popupState)}
                >
                  {i18n.t("contacts.menu.importexport")}
                  <ArrowDropDown />
                </Button>
                <Menu
                  {...bindMenu(popupState)}
                  PaperProps={{ className: classes.headerMenuPaper }}
                >
                  <MenuItem
                    className={classes.headerMenuItem}
                    onClick={() => {
                      setConfirmOpen(true);
                      setImportContacts(true);
                      popupState.close();
                    }}
                  >
                    <ContactPhone
                      fontSize="small"
                      color="primary"
                      style={{ marginRight: 10 }}
                    />
                    {i18n.t("contacts.menu.importYourPhone")}
                  </MenuItem>
                  <MenuItem
                    className={classes.headerMenuItem}
                    onClick={() => {
                      setImportContactModalOpen(true);
                    }}
                  >
                    <Backup
                      fontSize="small"
                      color="primary"
                      style={{ marginRight: 10 }}
                    />
                    {i18n.t("contacts.menu.importToExcel")}
                  </MenuItem>
                  <Can
                    role={user.profile}
                    perform="contacts-page:deleteAllContacts"
                      yes={() => (
                      <MenuItem
                        className={classes.headerMenuItem}
                        onClick={() => {
                          handleDeleteAllClick();
                          popupState.close();
                        }}
                        style={{ color: '#f44336' }}
                      >
                        <DeleteSweep
                          fontSize="small"
                          style={{ marginRight: 10, color: '#f44336' }}
                        />
                        {i18n.t("contacts.menu.deleteAllContacts")}
                      </MenuItem>
                    )}
                  />
                </Menu>
              </React.Fragment>
            )}
          </PopupState>
          
          <Button
            className={classes.headerButton}
            variant="contained"
            color="primary"
            onClick={handleOpenContactModal}
          >
            {i18n.t("contacts.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      {importContactModalOpen && (
        <ContactImportWpModal
          isOpen={importContactModalOpen}
          handleClose={() => setImportContactModalOpen(false)}
          selectedTags={selectedTags}
          selectedContacts={selectedContacts}
          hideNum={hideNum}
          userProfile={user.profile}
        />
      )}

      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <input
          style={{ display: "none" }}
          id="upload"
          name="file"
          type="file"
          accept=".xls,.xlsx"
          onChange={() => {
            setConfirmOpen(true);
          }}
          ref={fileUploadRef}
        />

        {/* Toolbar para ações em lote */}
        {isAnyContactSelected && (
          <Toolbar className={`${classes.toolbar} ${classes.toolbarHighlight}`}>
            <Typography className={classes.toolbarTitle} color="inherit" variant="subtitle1">
              {selectedCount} {i18n.t("contacts.title").toLowerCase()} {i18n.t("contacts.bulk.selected")} {selectAllMode && i18n.t("contacts.bulk.allSelected")}
            </Typography>
            <div className={classes.bulkActions}>
              <Tooltip title={i18n.t("contacts.bulk.cancelSelection")}>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedContacts(new Set());
                    setSelectAllMode(false);
                  }}
                >
                  {i18n.t("contacts.bulk.cancelSelection")}
                </Button>
              </Tooltip>
              <Tooltip title={selectAllMode ? i18n.t("contacts.bulk.deleteAll") : i18n.t("contacts.bulk.deleteSelected")}>
                <IconButton
                  color="inherit"
                  onClick={handleBulkDeleteClick}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            </div>
          </Toolbar>
        )}

        <Table size="small">
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell className={classes.checkboxCell + " " + classes.tableHeadCell}>
                <Checkbox
                  indeterminate={checkboxStatus.indeterminate}
                  checked={checkboxStatus.checked}
                  onChange={handleSelectAllContacts}
                  disabled={contacts.length === 0}
                  inputProps={{ 'aria-label': i18n.t("contacts.bulk.selectAll") }}
                />
              </TableCell>
              <TableCell className={classes.idCell + " " + classes.tableHeadCell + " " + classes.columnDivider}>{i18n.t("contacts.table.id")}</TableCell>
              <TableCell className={classes.avatarCell + " " + classes.tableHeadCell + " " + classes.columnDivider} align="center">{i18n.t("contacts.table.photo")}</TableCell>
              <TableCell className={classes.tableHeadCell + " " + classes.columnDivider}>{i18n.t("contacts.table.name")}</TableCell>
              <TableCell className={classes.tableHeadCell + " " + classes.columnDivider} align="center">
                {i18n.t("contacts.table.whatsapp")}
              </TableCell>
              <TableCell className={classes.tableHeadCell + " " + classes.columnDivider} align="center">
                {i18n.t("contacts.table.email")}
              </TableCell>
              <TableCell className={classes.tableHeadCell + " " + classes.columnDivider} align="center">{i18n.t("contacts.table.status")}</TableCell>
              <TableCell className={classes.tableHeadCell + " " + classes.columnDivider} align="center">{i18n.t("contacts.table.wallet")}</TableCell>
              <TableCell className={classes.tableHeadCell} align="center">
                {i18n.t("contacts.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {contacts.map((contact) => {
                const isSelected = selectAllMode || selectedContacts.has(contact.id);
                
                return (
                  <TableRow 
                    key={contact.id}
                    selected={isSelected}
                    className={classes.tableRow}
                  >
                    <TableCell className={classes.checkboxCell + " " + classes.tableCell}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectContact(contact.id)}
                        disabled={selectAllMode}
                        inputProps={{ 'aria-label': `${i18n.t("contacts.modal.selectContact")} ${contact.name}` }}
                      />
                    </TableCell>
                    <TableCell className={classes.idCell + " " + classes.tableCell + " " + classes.columnDivider}>{contact.id}</TableCell>
                    <TableCell className={classes.avatarCell + " " + classes.tableCell + " " + classes.columnDivider} align="center">
                      <Avatar 
                        src={`${contact?.urlPicture}`}
                        className={classes.clickableAvatar}
                        onClick={() => handleOpenImageModal(contact?.urlPicture, contact.name)}
                      />
                    </TableCell>
                    <TableCell className={classes.tableCell + " " + classes.columnDivider}>{contact.name}</TableCell>
                    <TableCell className={classes.tableCell + " " + classes.columnDivider} align="center">
                      {enableLGPD && hideNum && user.profile === "user"
                        ? contact.isGroup
                          ? contact.number
                          : formatSerializedId(contact?.number) === null
                          ? contact.number.slice(0, -6) +
                            "**-**" +
                            contact?.number.slice(-2)
                          : formatSerializedId(contact?.number)?.slice(0, -6) +
                            "**-**" +
                            contact?.number?.slice(-2)
                        : contact.isGroup
                        ? contact.number
                        : formatSerializedId(contact?.number)}
                    </TableCell>
                    <TableCell className={classes.tableCell + " " + classes.columnDivider} align="center">{contact.email}</TableCell>
                    <TableCell className={classes.tableCell + " " + classes.columnDivider} align="center">
                      <span className={clsx(classes.statusPill, contact.active ? classes.statusActive : classes.statusInactive)}>
                        {contact.active ? i18n.t("contacts.status.active") : i18n.t("contacts.status.inactive")}
                      </span>
                    </TableCell>
                    <TableCell className={classes.tableCell + " " + classes.columnDivider} align="center">
                      {contact.contactWallets && contact.contactWallets.length > 0 
                        ? contact.contactWallets[0].wallet?.name || i18n.t("contacts.modal.userNotFound")
                        : i18n.t("contacts.modal.notAssigned")}
                    </TableCell>
                    <TableCell className={classes.tableCell} align="center">
                      <IconButton
                        size="small"
                        disabled={!contact.active}
                        onClick={() => {
                          setContactTicket(contact);
                          setNewTicketModalOpen(true);
                        }}
                        className={classes.actionIconButton}
                      >
                        {contact.channel === "whatsapp" && (
                          <WhatsApp style={{ color: "green" }} />
                        )}
                        {contact.channel === "instagram" && (
                          <Instagram style={{ color: "purple" }} />
                        )}
                        {contact.channel === "facebook" && (
                          <Facebook style={{ color: "blue" }} />
                        )}
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => hadleEditContact(contact.id)}
                        className={classes.actionIconButton}
                      >
                        <EditIcon color="secondary" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={
                          contact.active
                            ? () => {
                                setConfirmOpen(true);
                                setBlockingContact(contact);
                              }
                            : () => {
                                setConfirmOpen(true);
                                setUnBlockingContact(contact);
                              }
                        }
                        className={classes.actionIconButton}
                      >
                        {contact.active ? (
                          <BlockIcon color="secondary" />
                        ) : (
                          <CheckCircleIcon color="secondary" />
                        )}
                      </IconButton>
                      <Can
                        role={user.profile}
                        perform="contacts-page:deleteContact"
                        yes={() => (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setConfirmOpen(true);
                              setDeletingContact(contact);
                            }}
                            className={classes.actionIconButton}
                          >
                            <DeleteOutlineIcon color="secondary" />
                          </IconButton>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {loading && <TableRowSkeleton avatar columns={9} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Contacts;
