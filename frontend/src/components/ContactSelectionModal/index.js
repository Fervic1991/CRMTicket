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
  dialogContent: {
    minWidth: "600px",
    maxHeight: "600px",
    display: "flex",
    flexDirection: "column",
  },
  tableContainer: {
    flex: 1,
    overflow: "auto",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  selectAllContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{i18n.t("contactLists.modal.selectContacts")}</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box className={classes.filterContainer}>
          <TagsFilter onFiltered={handleTagsFilter} />
        </Box>

        <TextField
          fullWidth
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

        <Box className={classes.selectAllContainer}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleSelectAll}
            fullWidth
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
                  <TableCell align="center" style={{ width: "50px" }}>
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
                  <TableCell>{i18n.t("contacts.table.name")}</TableCell>
                  <TableCell>{i18n.t("contacts.table.number")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    onClick={() => handleSelectContact(contact.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell align="center">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                      />
                    </TableCell>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        {hasMore && (
          <Button fullWidth onClick={handleLoadMore} style={{ marginTop: "10px" }}>
            {loading ? <CircularProgress size={24} /> : i18n.t("contacts.loadMore")}
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="default">
          {i18n.t("buttons.cancel")}
        </Button>
        <Button
          onClick={handleAddContacts}
          color="primary"
          variant="contained"
          disabled={loading || selectedContacts.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : i18n.t("contactLists.buttons.add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactSelectionModal;