import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { Grid, Stack } from "@mui/material";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const FlowBuilderRemoveTagModal = ({ open, onSave, data, onUpdate, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    if (open === "edit") {
      (async () => {
        try {
          const tag = data.data.tag;
          const { data: result } = await api.get("/tags/list");
          setSelectedTag(tag.id);
          setTags(result);
          setActiveModal(true);
        } catch (error) {
          console.log(error);
        }
      })();
    } else if (open === "create") {
      (async () => {
        try {
          const { data } = await api.get("/tags/list");
          setSelectedTag("");
          setTags(data);
          setActiveModal(true);
        } catch (error) {
          console.log(error);
        }
      })();
    }
    return () => {
      isMounted.current = false;
    };
  }, [open]);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleSaveContact = () => {
    if (!selectedTag) {
      return toast.error("Seleziona un'etichetta da rimuovere");
    }
    
    if (open === "edit") {
      const tag = tags.find((item) => item.id === selectedTag);

      onUpdate({
        ...data,
        data: {
          tag: tag ? tag : "",
        },
      });
    } else if (open === "create") {
      const tag = tags.find((item) => item.id === selectedTag);

      onSave({
        tag: tag ? tag : "",
      });
    }
    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={activeModal}
        onClose={handleClose}
        fullWidth="md"
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {open === "create" ? `Rimuovi un'etichetta dal flusso` : `Modifica rimozione etichetta`}
        </DialogTitle>
        <Stack>
          <DialogContent dividers>
            <Grid style={{ width: "100%", marginTop: 40 }} container>
              <Typography style={{ marginBottom: 10 }}>
                Scegli un'etichetta da rimuovere dal contatto
              </Typography>
              <Typography 
                variant="caption" 
                style={{ 
                  marginBottom: 20, 
                  color: "#666",
                  fontSize: "12px",
                  fontStyle: "italic"
                }}
              >
                Esta ação removerá a tag selecionada do contato quando o fluxo for executado
              </Typography>
              <Select
                labelId="remove-tag-select-label"
                id="remove-tag-select"
                value={selectedTag}
                style={{ width: "95%" }}
                onChange={(e) => {
                  setSelectedTag(e.target.value);
                }}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
                renderValue={() => {
                  if (selectedTag === "") {
                    return "Seleziona un'etichetta da rimuovere";
                  }
                  const tag = tags.find((t) => t.id === selectedTag);
                  if (tag === undefined) {
                    return "Nessuna etichetta selezionata";
                  }
                  return tag.name;
                }}
              >
                {/* Adiciona a opção vazia */}
                <MenuItem value="">
                  <em>Seleziona un'etichetta da rimuovere</em>
                </MenuItem>

                {/* Exibe a lista de tags */}
                {tags.length > 0 &&
                  tags.map((tag, index) => (
                    <MenuItem dense key={index} value={tag.id}>
                      {tag.name}
                    </MenuItem>
                  ))}
              </Select>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary" variant="outlined">
              {i18n.t("contactModal.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              className={classes.btnWrapper}
              onClick={handleSaveContact}
              style={{
                backgroundColor: "#dc3545",
                color: "#fff"
              }}
            >
              {open === "create" ? "Aggiungi rimozione" : "Modifica"}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderRemoveTagModal;
