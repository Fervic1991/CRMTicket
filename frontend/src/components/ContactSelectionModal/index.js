// frontend/src/components/ContactSelectionModal/index.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  InputAdornment,
  CircularProgress,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import { TagsFilter } from "../TagsFilter";
import { toast } from "react-toastify";
import useWhatsApps from "../../hooks/useWhatsApps";
const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    borderRadius: 18,
    background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(246,248,255,0.98))",
    border: "1px solid rgba(120,130,160,0.18)",
    boxShadow: "0 24px 60px rgba(31, 45, 61, 0.18)",
  },
  dialogTitle: {
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  dialogContent: {
    minWidth: "600px",
    maxHeight: "600px",
    display: "flex",
    flexDirection: "column",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    gap: 15,
  },
  filterContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  searchField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.9)",
      border: "1px solid #E2E8F0",
      transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      "&:hover": {
        borderColor: "#CBD5E1",
      },
      "&.Mui-focused": {
        boxShadow: "0 0 0 3px rgba(63,81,181,0.12)",
        borderColor: theme.palette.primary.main,
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#E2E8F0",
        borderWidth: 1,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#CBD5E1",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
    },
    "& .MuiInputLabel-outlined": {
      color: "#64748B",
    },
  },
  tableContainer: {
    flex: 1,
    overflow: "auto",
    borderRadius: 14,
    border: "1px solid rgba(120,130,160,0.2)",
    boxShadow: "0 10px 24px rgba(31, 45, 61, 0.08)",
  },
  selectAllContainer: {
    marginTop: 0,
    marginBottom: 0,
  },
  actionButton: {
    height: 40,
    borderRadius: 8,
    fontWeight: 600,
    textTransform: "none",
    background: "transparent",
    color: "#475569",
    border: "1px solid #E2E8F0",
    boxShadow: "none",
    "&:hover": {
      background: "rgba(248,250,252,0.9)",
      borderColor: "#CBD5E1",
    },
  },
  primaryButton: {
    minWidth: 132,
    height: 40,
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 600,
    color: "#FFFFFF",
    background: "linear-gradient(135deg, rgba(37,99,235,0.96), rgba(56,189,248,0.92))",
    boxShadow: "0 14px 28px rgba(63,81,181,0.28)",
    "&:hover": {
      background: "linear-gradient(135deg, rgba(29,78,216,0.98), rgba(14,165,233,0.94))",
    },
    "&.Mui-disabled": {
      color: "rgba(255,255,255,0.86)",
      background: "linear-gradient(135deg, rgba(148,163,184,0.96), rgba(203,213,225,0.92))",
      boxShadow: "none",
    },
  },
  tableHeader: {
    fontWeight: 700,
    backgroundColor: "#FFFFFF",
    color: theme.palette.text.secondary,
    paddingTop: 14,
    paddingBottom: 14,
  },
  rowSelected: {
    backgroundColor: "rgba(63,81,181,0.08)",
  },
  tableCell: {
    paddingTop: 14,
    paddingBottom: 14,
  },
  checkbox: {
    "& .MuiIconButton-root": {
      borderRadius: 8,
    },
    "& .MuiSvgIcon-root": {
      borderRadius: 6,
    },
  },
  emptyState: {
    padding: theme.spacing(3),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  dialogActions: {
    padding: theme.spacing(1.5, 3, 2.5),
    gap: 12,
  },
}));

const ContactSelectionModal = ({ open, onClose, contactListId, onAddContacts }) => {
  const classes = useStyles();
  const numberLabel =
    i18n.t("contacts.table.number") !== "contacts.table.number"
      ? i18n.t("contacts.table.number")
      : "Numero";
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedWhatsappId, setSelectedWhatsappId] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { whatsApps } = useWhatsApps();

  useEffect(() => {
    if (open) {
      setContacts([]);
      setSelectedContacts([]);
      setPageNumber(1);
      setSearchParam("");
      setSelectedTags([]);
      setSelectedWhatsappId("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: {
              searchParam,
              pageNumber,
              contactTag: JSON.stringify(selectedTags),
              whatsappId: selectedWhatsappId || undefined,
            },
          });
          if (pageNumber === 1) {
            setContacts(data.contacts);
          } else {
            setContacts((prev) => [...prev, ...data.contacts]);
          }
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
          setLoading(false);
        }
      };
      fetchContacts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [open, searchParam, selectedTags, selectedWhatsappId, pageNumber]);

  const handleSelectContact = (contactId) => {
    setSelectedContacts((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c.id));
    }
  };

  const handleAddContacts = async () => {
    if (selectedContacts.length === 0) {
      toast.error(i18n.t("contactLists.errors.selectContacts"));
      return;
    }

    try {
      setLoading(true);
      await api.post(`/contact-list-items/bulk`, {
        contactListId,
        contactIds: selectedContacts,
      });
      toast.success(i18n.t("contactListItems.toasts.added"));
      setLoading(false);
      onAddContacts();
      onClose();
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleTagsFilter = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setSelectedTags(tags);
    setPageNumber(1);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
    setPageNumber(1);
  };

  const handleWhatsappFilter = (event) => {
    setSelectedWhatsappId(event.target.value);
    setPageNumber(1);
  };

  const handleLoadMore = () => {
    setPageNumber((prev) => prev + 1);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth classes={{ paper: classes.dialogPaper }}>
      <DialogTitle className={classes.dialogTitle}>{i18n.t("contactLists.modal.selectContacts")}</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box className={classes.filterContainer}>
          <TagsFilter onFiltered={handleTagsFilter} />
          <FormControl
            fullWidth
            variant="outlined"
            size="small"
            className={classes.searchField}
          >
            <InputLabel id="contact-selection-whatsapp-filter-label">
              Connessione
            </InputLabel>
            <Select
              labelId="contact-selection-whatsapp-filter-label"
              value={selectedWhatsappId}
              onChange={handleWhatsappFilter}
              label="Connessione"
            >
              <MenuItem value="">
                Tutte le connessioni
              </MenuItem>
              {whatsApps.map((whatsApp) => (
                <MenuItem key={whatsApp.id} value={String(whatsApp.id)}>
                  {whatsApp.name || "Connessione"}{whatsApp.number ? ` (${whatsApp.number})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#94A3B8" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box className={classes.selectAllContainer}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleSelectAll}
            fullWidth
            className={classes.actionButton}
          >
            {selectedContacts.length === contacts.length && contacts.length > 0
              ? i18n.t("contactLists.buttons.deselectAll")
              : i18n.t("contactLists.buttons.selectAll")}
          </Button>
        </Box>

        <Paper className={classes.tableContainer} variant="outlined">
          {loading && contacts.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center" style={{ width: "50px" }} className={classes.tableHeader}>
                    <Checkbox
                      className={classes.checkbox}
                      indeterminate={
                        selectedContacts.length > 0 &&
                        selectedContacts.length < contacts.length
                      }
                      checked={
                        contacts.length > 0 &&
                        selectedContacts.length === contacts.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell className={classes.tableHeader}>{i18n.t("contacts.table.name")}</TableCell>
                  <TableCell className={classes.tableHeader}>{numberLabel}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => {
                  const isSelected = selectedContacts.includes(contact.id);
                  return (
                    <TableRow
                      key={contact.id}
                      onClick={() => handleSelectContact(contact.id)}
                      hover
                      style={{
                        cursor: "pointer",
                        backgroundColor: isSelected ? "rgba(63,81,181,0.08)" : "inherit",
                      }}
                    >
                      <TableCell align="center" className={classes.tableCell}>
                        <Checkbox
                          className={classes.checkbox}
                          checked={isSelected}
                          onChange={() => handleSelectContact(contact.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell className={classes.tableCell}>{contact.name}</TableCell>
                      <TableCell className={classes.tableCell}>{contact.number}</TableCell>
                    </TableRow>
                  );
                })}
                {!loading && contacts.length === 0 && (
                  <TableRow>
                    <TableCell align="center" colSpan={3} className={classes.emptyState}>
                      {i18n.t("contactLists.emptySelection")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Paper>

        {hasMore && (
          <Button fullWidth onClick={handleLoadMore} style={{ marginTop: "10px" }} className={classes.actionButton}>
            {loading ? <CircularProgress size={24} /> : i18n.t("contacts.loadMore")}
          </Button>
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={onClose} color="default" className={classes.actionButton}>
          {i18n.t("common.cancel")}
        </Button>
        <Button
          onClick={handleAddContacts}
          color="primary"
          variant="contained"
          disabled={loading || selectedContacts.length === 0}
          className={classes.primaryButton}
        >
          {loading ? <CircularProgress size={24} /> : i18n.t("contactLists.buttons.add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactSelectionModal;
