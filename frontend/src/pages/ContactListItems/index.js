import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
} from "react";

import { toast } from "react-toastify";
import { useParams, useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import BlockIcon from "@material-ui/icons/Block";
import PeopleIcon from "@material-ui/icons/People";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactListItemModal from "../../components/ContactListItemModal";
import ConfirmationModal from "../../components/ConfirmationModal/";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import useContactLists from "../../hooks/useContactLists";
import { Grid } from "@material-ui/core";

import planilhaExemplo from "../../assets/planilha.xlsx";
import ForbiddenPage from "../../components/ForbiddenPage";
// import { SocketContext } from "../../context/Socket/SocketContext";
import ContactSelectionModal from "../../components/ContactSelectionModal";

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
  actionButtonPrimary: {
    height: 42,
    borderRadius: 12,
    fontWeight: 600,
    textTransform: "none",
    background: "linear-gradient(135deg, rgba(63,81,181,0.9), rgba(25,118,210,0.95))",
    boxShadow: "0 12px 28px rgba(63,81,181,0.3)",
  },
  actionButton: {
    height: 42,
    borderRadius: 12,
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
  tableHeader: {
    fontWeight: 700,
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
  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: theme.palette.primary.dark,
    background: "linear-gradient(135deg, rgba(63,81,181,0.2), rgba(25,118,210,0.3))",
    border: "1px solid rgba(63,81,181,0.3)",
    flexShrink: 0,
  },
  nameStack: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  nameText: {
    fontWeight: 600,
  },
  tagRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  tagChip: {
    fontSize: "0.7rem",
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: 999,
    border: "1px solid rgba(120,130,160,0.2)",
    background: "rgba(255,255,255,0.9)",
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: "0.75rem",
  },
  statusValid: {
    background: "linear-gradient(135deg, rgba(76,175,80,0.18), rgba(165,214,167,0.35))",
    color: "#1b5e20",
    border: "1px solid rgba(76,175,80,0.3)",
  },
  statusInvalid: {
    background: "linear-gradient(135deg, rgba(120,130,160,0.18), rgba(200,205,220,0.35))",
    color: theme.palette.text.secondary,
    border: "1px solid rgba(120,130,160,0.28)",
  },
  iconButton: {
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

const ContactListItems = () => {
  const classes = useStyles();

  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  const { contactListId } = useParams();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactListItemModalOpen, setContactListItemModalOpen] =
    useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [contactList, setContactList] = useState({});
  const fileUploadRef = useRef(null);

  const { findById: findContactList } = useContactLists();

  useEffect(() => {
    findContactList(contactListId).then((data) => {
      setContactList(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactListId]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get(`contact-list-items`, {
            params: { searchParam, pageNumber, contactListId },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, contactListId]);

  useEffect(() => {
    const companyId = user.companyId;

    const onCompanyContactLists = (data) => {
        console.log('[ContactListItems] socket received:', data); // ← aggiungi log
        
        if (data.action === "update" || data.action === "create") {
          dispatch({ type: "UPDATE_CONTACTS", payload: data.record });
        }

        if (data.action === "delete") {
          dispatch({ type: "DELETE_CONTACT", payload: +data.id });
        }

        if (data.action === "reload") {
          console.log('[ContactListItems] reloading contacts:', data.records.length); // ← log
          dispatch({ type: "LOAD_CONTACTS", payload: data.records });
        }
      }
      
      socket.on(`company-${companyId}-ContactListItem`, onCompanyContactLists);

      return () => {
        socket.off(`company-${companyId}-ContactListItem`, onCompanyContactLists);
      };
    }, [socket, user.companyId]); // ← fix dipendenze

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactListItemModal = () => {
    setSelectedContactId(null);
    setContactListItemModalOpen(true);
  };

  const handleCloseContactListItemModal = () => {
    setSelectedContactId(null);
    setContactListItemModalOpen(false);
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactListItemModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contact-list-items/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleImportContacts = async () => {
    try {
      const formData = new FormData();
      formData.append("file", fileUploadRef.current.files[0]);
      await api.request({
        url: `contact-lists/${contactListId}/upload`,
        method: "POST",
        data: formData,
      });
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

  const goToContactLists = () => {
    history.push("/contact-lists");
  };
  const [contactSelectionModalOpen, setContactSelectionModalOpen] = useState(false);

  const handleOpenContactSelectionModal = () => setContactSelectionModalOpen(true);
  const handleCloseContactSelectionModal = () => setContactSelectionModalOpen(false);

  const handleAddContactsFromSelection = () => {
    setSearchParam("");
    setPageNumber(1);
  };
  const summary = contacts.reduce(
    (acc, contact) => {
      acc.total += 1;
      if (contact.isWhatsappValid) {
        acc.valid += 1;
      } else {
        acc.invalid += 1;
      }
      return acc;
    },
    { total: 0, valid: 0, invalid: 0 }
  );

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    const initials = parts.map((part) => part.charAt(0).toUpperCase()).join("");
    return initials || "?";
  };
  return (
    <MainContainer className={classes.mainContainer}>

      <ContactListItemModal
        open={contactListItemModalOpen}
        onClose={handleCloseContactListItemModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      ></ContactListItemModal>
      <ContactSelectionModal
        open={contactSelectionModalOpen}
        onClose={handleCloseContactSelectionModal}
        contactListId={contactListId}
        onAddContacts={handleAddContactsFromSelection}
      />
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contactListItems.confirmationModal.deleteTitle")} ${deletingContact.name
            }?`
            : `${i18n.t("contactListItems.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={() =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : handleImportContacts()
        }
      >
        {deletingContact ? (
          `${i18n.t("contactListItems.confirmationModal.deleteMessage")}`
        ) : (
          <>
            {i18n.t("contactListItems.confirmationModal.importMessage")}
            <a href={planilhaExemplo} download="planilha.xlsx">
              {i18n.t("contactListItems.confirmationModal.downloadExample")}
            </a>
          </>
        )}
      </ConfirmationModal>
      {
        user.profile === "user" && user?.showCampaign === "disabled" ?
          <ForbiddenPage />
          :
          <>
            <MainHeader>
              <Grid style={{ width: "100%" }} container className={classes.headerCard} spacing={2}>
                <Grid xs={12} sm={5} item>
                  <Title className={classes.headerTitle}>{contactList.name}</Title>
                </Grid>
                <Grid xs={12} sm={7} item>
                  <Grid spacing={2} container>
                    <Grid xs={12} sm={6} item>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder={i18n.t("contactListItems.searchPlaceholder")}
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
                    <Grid xs={6} sm={3} item>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={goToContactLists}
                        className={classes.actionButton}
                      >
                        {i18n.t("contactListItems.buttons.lists")}
                      </Button>
                    </Grid>
                    <Grid xs={6} sm={3} item>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          fileUploadRef.current.value = null;
                          fileUploadRef.current.click();
                        }}
                        className={classes.actionButton}
                      >
                        {i18n.t("contactListItems.buttons.import")}
                      </Button>
                    </Grid>
                    <Grid xs={6} sm={3} item>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleOpenContactSelectionModal}
                        className={classes.actionButton}
                      >
                        {i18n.t("contactListItems.buttons.importFromContacts")}
                      </Button>
                    </Grid>
                    <Grid xs={6} sm={3} item>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleOpenContactListItemModal}
                        className={classes.actionButtonPrimary}
                      >
                        {i18n.t("contactListItems.buttons.add")}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </MainHeader>
            <Paper className={classes.summaryBar}>
              <span className={classes.summaryChip}>
                {i18n.t("contactListItems.summary.total")}
                <span className={classes.summaryCount}>{summary.total}</span>
              </span>
              <span className={classes.summaryChip}>
                {i18n.t("contactListItems.summary.valid")}
                <span className={classes.summaryCount}>{summary.valid}</span>
              </span>
              <span className={classes.summaryChip}>
                {i18n.t("contactListItems.summary.invalid")}
                <span className={classes.summaryCount}>{summary.invalid}</span>
              </span>
            </Paper>
            <Paper
              className={classes.mainPaper}
              variant="outlined"
              onScroll={handleScroll}
            >
              <>
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
              </>
              <Table size="small" className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" style={{ width: "0%" }} className={classes.tableHeader}>
                      #
                    </TableCell>
                    <TableCell className={classes.tableHeader}>{i18n.t("contactListItems.table.name")}</TableCell>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("contactListItems.table.number")}
                    </TableCell>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("contactListItems.table.email")}
                    </TableCell>
                    <TableCell align="center" className={classes.tableHeader}>
                      {i18n.t("contactListItems.table.actions")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id} className={classes.tableRow}>
                        <TableCell align="center" style={{ width: "0%" }}>
                          <span
                            className={`${classes.statusPill} ${
                              contact.isWhatsappValid ? classes.statusValid : classes.statusInvalid
                            }`}
                            title={
                              contact.isWhatsappValid
                                ? i18n.t("contactListItems.status.valid")
                                : i18n.t("contactListItems.status.invalid")
                            }
                          >
                            {contact.isWhatsappValid ? (
                              <CheckCircleIcon fontSize="small" />
                            ) : (
                              <BlockIcon fontSize="small" />
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className={classes.nameCell}>
                            <div className={classes.avatar}>{getInitials(contact.name)}</div>
                            <div className={classes.nameStack}>
                              <span className={classes.nameText}>{contact.name}</span>
                              {Array.isArray(contact.tags) && contact.tags.length > 0 && (
                                <div className={classes.tagRow}>
                                  {contact.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag.id || tag.name}
                                      className={classes.tagChip}
                                      style={{
                                        backgroundColor: tag.color || "rgba(63,81,181,0.08)",
                                        color: "#fff",
                                        borderColor: "rgba(0,0,0,0.05)",
                                      }}
                                    >
                                      {tag.name}
                                    </span>
                                  ))}
                                  {contact.tags.length > 3 && (
                                    <span className={classes.tagChip}>
                                      +{contact.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell align="center">{contact.number}</TableCell>
                        <TableCell align="center">{contact.email}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            className={classes.iconButton}
                            onClick={() => hadleEditContact(contact.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <Can
                            role={user.profile}
                            perform="contacts-page:deleteContact"
                            yes={() => (
                              <IconButton
                                size="small"
                                className={classes.iconButton}
                                onClick={() => {
                                  setConfirmOpen(true);
                                  setDeletingContact(contact);
                                }}
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {loading && <TableRowSkeleton columns={4} />}
                    {!loading && contacts.length === 0 && (
                      <TableRow>
                        <TableCell align="center" colSpan={5} className={classes.emptyState}>
                          <div className={classes.emptyStateIcon}>
                            <PeopleIcon fontSize="large" />
                          </div>
                          <div style={{ fontWeight: 600, marginBottom: 6 }}>
                            {i18n.t("contactListItems.emptyState.title")}
                          </div>
                          <div>{i18n.t("contactListItems.emptyState.description")}</div>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenContactListItemModal}
                            className={classes.emptyStateButton}
                          >
                            {i18n.t("contactListItems.buttons.add")}
                          </Button>
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

export default ContactListItems;
