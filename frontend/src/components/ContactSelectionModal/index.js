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
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import { TagsFilter } from "../TagsFilter";
import { toast } from "react-toastify";
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
  },
  searchField: {
    marginTop: theme.spacing(1.5),
    "& .MuiOutlinedInput-root": {
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.9)",
      border: "1px solid rgba(120,130,160,0.2)",
      transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      "&:hover": {
        borderColor: "rgba(120,130,160,0.45)",
      },
      "&.Mui-focused": {
        boxShadow: "0 0 0 3px rgba(63,81,181,0.12)",
        borderColor: theme.palette.primary.main,
      },
    },
  },
  tableContainer: {
    flex: 1,
    overflow: "auto",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: 14,
    border: "1px solid rgba(120,130,160,0.2)",
    boxShadow: "0 10px 24px rgba(31, 45, 61, 0.08)",
  },
  selectAllContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  actionButton: {
    height: 42,
    borderRadius: 12,
    fontWeight: 600,
    textTransform: "none",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(120,130,160,0.2)",
  },
  primaryButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    boxShadow: "0 14px 28px rgba(63,81,181,0.28)",
  },
  tableHeader: {
    fontWeight: 700,
    backgroundColor: "rgba(243,246,252,0.9)",
    color: theme.palette.text.secondary,
  },
  rowSelected: {
    backgroundColor: "rgba(63,81,181,0.08)",
  },
  emptyState: {
    padding: theme.spacing(3),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const ContactSelectionModal = ({ open, onClose, contactListId, onAddContacts }) => {
  const classes = useStyles();
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (open) {
      setContacts([]);
      setSelectedContacts([]);
      setPageNumber(1);
      setSearchParam("");
      setSelectedTags([]);
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
  }, [open, searchParam, selectedTags, pageNumber]);

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

  const handleLoadMore = () => {
    setPageNumber((prev) => prev + 1);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth classes={{ paper: classes.dialogPaper }}>
      <DialogTitle className={classes.dialogTitle}>{i18n.t("contactLists.modal.selectContacts")}</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box className={classes.filterContainer}>
          <TagsFilter onFiltered={handleTagsFilter} />
        </Box>

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
                <SearchIcon style={{ color: "gray" }} />
              </InputAdornment>
            ),
          }}
        />

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
                  <TableCell className={classes.tableHeader}>{i18n.t("contacts.table.number")}</TableCell>
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
                      <TableCell align="center">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectContact(contact.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell>{contact.name}</TableCell>
                      <TableCell>{contact.number}</TableCell>
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
      <DialogActions>
        <Button onClick={onClose} color="default" className={classes.actionButton}>
          {i18n.t("buttons.cancel")}
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
