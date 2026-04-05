// src/components/ScheduleModal/index.js

import React, { useState, useEffect, useContext, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Switch,
  Typography,
} from "@material-ui/core";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import moment from "moment";
import { isArray } from "lodash";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import AttachFile from "@material-ui/icons/AttachFile";
import { head } from "lodash";
import ConfirmationModal from "../ConfirmationModal";
import MessageVariablesPicker from "../MessageVariablesPicker";
import useQueues from "../../hooks/useQueues";
import UserStatusIcon from "../UserModal/statusIcon";
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  dialogPaper: {
    borderRadius: 24,
    overflow: "hidden",
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(10,14,24,0.98) 100%)"
        : "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148,163,184,0.18)"
        : "1px solid rgba(226,232,240,0.95)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 30px 70px rgba(0,0,0,0.45)"
        : "0 30px 70px rgba(15,23,42,0.12)",
  },
  dialogTitle: {
    padding: theme.spacing(3, 4, 2.5),
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(14,165,233,0.2))"
        : "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(14,165,233,0.08))",
    color: theme.palette.mode === "dark" ? "#f8fafc" : "#0f172a",
  },
  dialogTitleText: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  dialogTitleSubtext: {
    marginTop: theme.spacing(0.75),
    fontSize: 13,
    lineHeight: 1.6,
    color: theme.palette.mode === "dark" ? "rgba(226,232,240,0.74)" : "#64748B",
  },
  dialogContent: {
    padding: theme.spacing(3.5, 4),
  },
  sectionCard: {
    padding: theme.spacing(2.5),
    borderRadius: 18,
    border: theme.palette.mode === "dark"
      ? "1px solid rgba(148,163,184,0.12)"
      : "1px solid #E2E8F0",
    background: theme.palette.mode === "dark"
      ? "rgba(15,23,42,0.42)"
      : "rgba(255,255,255,0.92)",
    boxShadow: theme.palette.mode === "dark"
      ? "none"
      : "0 10px 28px rgba(15,23,42,0.04)",
  },
  sectionTitle: {
    marginBottom: theme.spacing(0.5),
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: theme.palette.mode === "dark" ? "#E2E8F0" : "#1E293B",
  },
  sectionSubtitle: {
    marginBottom: theme.spacing(2),
    fontSize: 13,
    lineHeight: 1.6,
    color: theme.palette.mode === "dark" ? "rgba(226,232,240,0.7)" : "#64748B",
  },
  fieldLabel: {
    marginBottom: theme.spacing(0.75),
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.mode === "dark" ? "#CBD5E1" : "#334155",
  },
  formControl: {
    width: "100%",
    '& .MuiOutlinedInput-root': {
      borderRadius: 8,
      background: theme.palette.mode === "dark" ? "rgba(15,23,42,0.7)" : "#FFFFFF",
      transition: "all 0.2s ease",
      '& fieldset': {
        borderColor: theme.palette.mode === "dark" ? "rgba(148,163,184,0.22)" : "#E2E8F0",
      },
      '&:hover fieldset': {
        borderColor: theme.palette.mode === "dark" ? "rgba(125,211,252,0.4)" : "#CBD5E1",
      },
      '&.Mui-focused fieldset': {
        borderColor: "#2563EB",
        borderWidth: 1,
      },
    },
    '& .MuiInputBase-input': {
      fontSize: 14,
    },
  },
  messageField: {
    '& .MuiOutlinedInput-root': {
      alignItems: "flex-start",
      paddingTop: 10,
      paddingBottom: 10,
    },
    '& .MuiInputBase-inputMultiline': {
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
      lineHeight: 1.6,
      fontSize: 13,
    },
  },
  compactRow: {
    alignItems: "flex-end",
  },
  switchRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginTop: theme.spacing(0.5),
    padding: theme.spacing(1.25, 1.5),
    borderRadius: 12,
    background: theme.palette.mode === "dark" ? "rgba(15,23,42,0.58)" : "#F8FAFC",
    border: theme.palette.mode === "dark" ? "1px solid rgba(148,163,184,0.12)" : "1px solid #E2E8F0",
  },
  switchTextWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.palette.mode === "dark" ? "#F8FAFC" : "#1E293B",
  },
  switchDescription: {
    fontSize: 12,
    lineHeight: 1.5,
    color: theme.palette.mode === "dark" ? "rgba(226,232,240,0.7)" : "#64748B",
  },
  iosSwitch: {
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: '#fff',
      transform: 'translateX(18px)',
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: '#2563EB',
      opacity: '1 !important',
    },
    '& .MuiSwitch-track': {
      borderRadius: 999,
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(148,163,184,0.35)' : '#CBD5E1',
      opacity: '1 !important',
    },
    '& .MuiSwitch-thumb': {
      boxShadow: '0 2px 8px rgba(15,23,42,0.18)',
    },
  },
  attachmentRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1.25),
    borderRadius: 12,
    border: theme.palette.mode === 'dark' ? '1px solid rgba(148,163,184,0.12)' : '1px solid #E2E8F0',
    background: theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.55)' : '#F8FAFC',
  },
  attachmentButton: {
    justifyContent: 'flex-start',
    textTransform: 'none',
    color: theme.palette.mode === 'dark' ? '#F8FAFC' : '#1E293B',
  },
  dialogActions: {
    padding: theme.spacing(2.5, 4),
    background:
      theme.palette.mode === "dark"
        ? "rgba(15,23,42,0.6)"
        : "rgba(248,250,252,0.9)",
    borderTop:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148,163,184,0.15)"
        : "1px solid rgba(226,232,240,0.9)",
  },
  primaryButton: {
    borderRadius: 12,
    padding: theme.spacing(1.1, 2.8),
    fontWeight: 700,
    textTransform: "none",
    color: '#fff',
    background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
    boxShadow: '0 12px 24px rgba(37,99,235,0.22)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)',
    },
  },
  outlineButton: {
    borderRadius: 12,
    textTransform: "none",
    borderColor: '#CBD5E1',
    color: '#334155',
    background: '#fff',
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

const ScheduleSchema = Yup.object().shape({
  body: Yup.string().min(5, i18n.t("scheduleModal.validation.messageTooShort")).required(i18n.t("scheduleModal.validation.required")),
  contactId: Yup.number().required(i18n.t("scheduleModal.validation.required")),
  sendAt: Yup.string().required(i18n.t("scheduleModal.validation.required")),
});

const ScheduleModal = ({
  open,
  onClose,
  scheduleId,
  contactId,
  cleanContact,
  reload,
  message,
  user
}) => {
  const classes = useStyles();
  const history = useHistory();
  const isMounted = useRef(true);
  const isAdmin = user.profile === 'admin';

  const initialState = {
    body: message || "", // ✅ Pre-popular com mensagem se fornecida
    contactId: contactId || "", // ✅ Pre-popular com contactId se fornecido
    sendAt: moment().add(1, "hour").format("YYYY-MM-DDTHH:mm"),
    sentAt: "",
    openTicket: "enabled",
    ticketUserId: user.id,
    queueId: "",
    statusTicket: "open", // ✅ Status baseado na origem
    intervalo: 1,
    valorIntervalo: 0,
    enviarQuantasVezes: 1,
    tipoDias: 4,
    assinar: false,
  };

  const initialContact = {
    id: "",
    name: "",
    channel: "",
  };

  const [schedule, setSchedule] = useState(initialState);
  const [currentContact, setCurrentContact] = useState(initialContact);
  const [contacts, setContacts] = useState([initialContact]);
  const [intervalo, setIntervalo] = useState(1);
  const [tipoDias, setTipoDias] = useState(4);
  const [attachment, setAttachment] = useState(null);
  const attachmentFile = useRef(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const messageInputRef = useRef();
  const [channelFilter, setChannelFilter] = useState("whatsapp");
  const [whatsapps, setWhatsapps] = useState([]);
  const [selectedWhatsapps, setSelectedWhatsapps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queues, setQueues] = useState([]);
  const [allQueues, setAllQueues] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const { findAll: findAllQueues } = useQueues();
  const [options, setOptions] = useState([]);
  const [searchParam, setSearchParam] = useState("");

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      const loadQueues = async () => {
        const list = await findAllQueues();
        setAllQueues(list);
        setQueues(list);
      };
      loadQueues();
    }
  }, []);

  useEffect(() => {
    if (searchParam.length < 3) {
      setLoading(false);
      setSelectedQueue("");
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/");
          setOptions(data.users);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };

      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  useEffect(() => {
    api
      .get(`/whatsapp/filter`, {
        params: { session: 0, channel: channelFilter },
      })
      .then(({ data }) => {
        const mappedWhatsapps = data.map((whatsapp) => ({
          ...whatsapp,
          selected: false,
        }));

        setWhatsapps(mappedWhatsapps);
        if (mappedWhatsapps.length && mappedWhatsapps?.length === 1) {
          setSelectedWhatsapps(mappedWhatsapps[0].id);
        }
      });
  }, [currentContact, channelFilter]);

  useEffect(() => {
    if (contactId && contacts.length) {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        setCurrentContact(contact);
      }
    }
  }, [contactId, contacts]);

  // ✅ MELHORIA: UseEffect otimizado com melhor lógica de inicialização
  useEffect(() => {
      if (open) {
      try {
        (async () => {
          // Carregar lista de contatos
          const { data: contactList } = await api.get("/contacts/list", {
            params: { companyId: companyId },
          });
          
          let customList = contactList.map((c) => ({
            id: c.id,
            name: c.name,
            channel: c.channel,
          }));
          
          if (isArray(customList)) {
            setContacts([{ id: "", name: "", channel: "" }, ...customList]);
          }

          // ✅ MELHORIA: Lógica de inicialização aprimorada
          if (!scheduleId) {
            // Modal sendo aberto para criar novo agendamento
            const newScheduleState = {
              ...initialState,
              body: message || "", // ✅ Pre-popular mensagem
              contactId: contactId || "", // ✅ Pre-popular contato
            };

            setSchedule(newScheduleState);

            // ✅ MELHORIA: Se contactId foi fornecido, definir contato atual
            if (contactId && customList.length > 0) {
              const foundContact = customList.find((c) => c.id.toString() === contactId.toString());
              if (foundContact) {
                setCurrentContact(foundContact);
                setChannelFilter(foundContact.channel || "whatsapp");
                console.log("✅ Contato auto-selecionado:", foundContact.name);
              }
            }

            return;
          }

          // ✅ Carregamento de agendamento existente (lógica original)
          const { data } = await api.get(`/schedules/${scheduleId}`);
          setSchedule((prevState) => {
            return {
              ...prevState,
              ...data,
              sendAt: moment(data.sendAt).format("YYYY-MM-DDTHH:mm"),
            };
          });
          
          console.log("📅 Agendamento carregado:", data);
          
          if (data.whatsapp) {
            setSelectedWhatsapps(data.whatsapp.id);
          }

          if (!isAdmin && data.ticketUser) {
            setSelectedUser(data.ticketUser);
          }
          
          if (data.queueId) {
            setSelectedQueue(data.queueId);
          }

          if (data.intervalo) {
            setIntervalo(data.intervalo);
          }

          if (data.tipoDias) {
            setTipoDias(data.tipoDias);
          }

          setCurrentContact(data.contact);
        })();
      } catch (err) {
        toastError(err);
      }
    }
  }, [scheduleId, contactId, open, user, message]);

  const filterOptions = createFilterOptions({
    trim: true,
  });

  const handleClose = () => {
    onClose();
    setAttachment(null);
    setSchedule(initialState);
    // ✅ MELHORIA: Reset do contato atual ao fechar
    setCurrentContact(initialContact);
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return (
          <Facebook style={{ color: "#3b5998", verticalAlign: "middle" }} />
        );
      case "instagram":
        return (
          <Instagram style={{ color: "#e1306c", verticalAlign: "middle" }} />
        );
      case "whatsapp":
        return (
          <WhatsApp style={{ color: "#25d366", verticalAlign: "middle" }} />
        );
      default:
        return "error";
    }
  };

  const renderOption = (option) => {
    if (option.name) {
      return (
        <>
          {IconChannel(option.channel)}
          <Typography
            component="span"
            style={{
              fontSize: 14,
              marginLeft: "10px",
              display: "inline-flex",
              alignItems: "center",
              lineHeight: "2",
            }}
          >
            {option.name}
          </Typography>
        </>
      );
    } else {
      return `${i18n.t("newTicketModal.add")} ${option.name}`;
    }
  };

  const handleSaveSchedule = async (values) => {
    const scheduleData = {
      ...values,
      userId: user.id,
      whatsappId: selectedWhatsapps,
      ticketUserId: selectedUser?.id || null,
      queueId: selectedQueue || null,
      intervalo: intervalo || 1,
      tipoDias: tipoDias || 4,
    };

    try {
      if (scheduleId) {
        await api.put(`/schedules/${scheduleId}`, scheduleData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/schedules/${scheduleId}/media-upload`, formData);
        }
      } else {
        const { data } = await api.post("/schedules", scheduleData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/schedules/${data.id}/media-upload`, formData);
        }
      }
      
      toast.success(i18n.t("scheduleModal.success"));
      
      if (typeof reload == "function") {
        reload();
      }
      
      if (contactId) {
        if (typeof cleanContact === "function") {
          cleanContact();
          history.push("/schedules");
        }
      }
    } catch (err) {
      toastError(err);
    }
    
    setCurrentContact(initialContact);
    setSchedule(initialState);
    handleClose();
  };

  const handleClickMsgVar = async (msgVar, setValueFunc) => {
    const el = messageInputRef.current;
    const firstHalfText = el.value.substring(0, el.selectionStart);
    const secondHalfText = el.value.substring(el.selectionEnd);
    const newCursorPos = el.selectionStart + msgVar.length;

    setValueFunc("body", `${firstHalfText}${msgVar}${secondHalfText}`);

    await new Promise((r) => setTimeout(r, 100));
    messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (schedule.mediaPath) {
      await api.delete(`/schedules/${schedule.id}/media-upload`);
      setSchedule((prev) => ({
        ...prev,
        mediaPath: null,
      }));
      toast.success(i18n.t("scheduleModal.toasts.deleted"));
      if (typeof reload == "function") {
        console.log(reload);
        console.log("1");
        reload();
      }
    }
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={i18n.t("scheduleModal.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("scheduleModal.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          <Typography className={classes.dialogTitleText} component="div">
            {schedule.status === "ERRO"
              ? i18n.t("scheduleModal.title.sendError")
              : scheduleId
              ? i18n.t("scheduleModal.title.edit")
              : i18n.t("scheduleModal.title.add")}
          </Typography>
          <Typography className={classes.dialogTitleSubtext} component="div">
            {i18n.t("scheduleModal.subtitle")}
          </Typography>
        </DialogTitle>
        <div style={{ display: "none" }}>
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            ref={attachmentFile}
            onChange={(e) => handleAttachmentFile(e)}
          />
        </div>
        <Formik
          initialValues={schedule}
          enableReinitialize={true}
          validationSchema={ScheduleSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveSchedule(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form>
              <DialogContent dividers className={classes.dialogContent}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <div className={classes.sectionCard}>
                      <Typography className={classes.sectionTitle}>
                        {i18n.t("scheduleModal.sections.messageInfo")}
                      </Typography>
                      <Typography className={classes.sectionSubtitle}>
                        {i18n.t("scheduleModal.sections.messageInfoDescription")}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("scheduleModal.form.contact")}
                          </Typography>
                          <Autocomplete
                            fullWidth
                            value={currentContact}
                            options={contacts}
                            onChange={(e, contact) => {
                              const nextContactId = contact ? contact.id : "";
                              setFieldValue("contactId", nextContactId);
                              setSchedule({ ...schedule, contactId: nextContactId });
                              setCurrentContact(contact ? contact : initialContact);
                              setChannelFilter(contact ? contact.channel : "whatsapp");
                            }}
                            getOptionLabel={(option) => option.name}
                            renderOption={renderOption}
                            getOptionSelected={(option, value) => value.id === option.id}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                className={classes.formControl}
                                placeholder={i18n.t("scheduleModal.form.contact")}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("scheduleModal.form.body")}
                          </Typography>
                          <Field
                            as={TextField}
                            rows={10}
                            multiline={true}
                            name="body"
                            placeholder={i18n.t("scheduleModal.form.body")}
                            inputRef={messageInputRef}
                            error={touched.body && Boolean(errors.body)}
                            helperText={touched.body && errors.body}
                            variant="outlined"
                            className={`${classes.formControl} ${classes.messageField}`}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <MessageVariablesPicker
                            disabled={isSubmitting}
                            onClick={(value) => handleClickMsgVar(value, setFieldValue)}
                          />
                        </Grid>
                        {(schedule.mediaPath || attachment) && (
                          <Grid item xs={12}>
                            <div className={classes.attachmentRow}>
                              <Button startIcon={<AttachFile />} className={classes.attachmentButton}>
                                {attachment ? attachment.name : schedule.mediaName}
                              </Button>
                              <IconButton
                                onClick={() => setConfirmationOpen(true)}
                                color="secondary"
                              >
                                <DeleteOutline color="secondary" />
                              </IconButton>
                            </div>
                          </Grid>
                        )}
                      </Grid>
                    </div>
                  </Grid>

                  <Grid item xs={12}>
                    <div className={classes.sectionCard}>
                      <Typography className={classes.sectionTitle}>
                        {i18n.t("scheduleModal.sections.destinationStatus")}
                      </Typography>
                      <Typography className={classes.sectionSubtitle}>
                        {i18n.t("scheduleModal.sections.destinationStatusDescription")}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("campaigns.dialog.form.whatsapp")}
                          </Typography>
                          <FormControl variant="outlined" fullWidth className={classes.formControl}>
                            <Field
                              as={Select}
                              displayEmpty
                              id="whatsappIds"
                              name="whatsappIds"
                              required
                              error={touched.whatsappId && Boolean(errors.whatsappId)}
                              value={selectedWhatsapps}
                              onChange={(event) => setSelectedWhatsapps(event.target.value)}
                            >
                              {whatsapps && whatsapps.map((whatsapp) => (
                                <MenuItem key={whatsapp.id} value={whatsapp.id}>
                                  {whatsapp.name}
                                </MenuItem>
                              ))}
                            </Field>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("campaigns.dialog.form.openTicket")}
                          </Typography>
                          <FormControl variant="outlined" fullWidth className={classes.formControl}>
                            <Field as={Select} id="openTicket" name="openTicket" displayEmpty>
                              <MenuItem value={"enabled"}>
                                {i18n.t("campaigns.dialog.form.enabledOpenTicket")}
                              </MenuItem>
                              <MenuItem value={"disabled"}>
                                {i18n.t("campaigns.dialog.form.disabledOpenTicket")}
                              </MenuItem>
                            </Field>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("transferTicketModal.fieldLabel")}
                          </Typography>
                          <Autocomplete
                            className={classes.formControl}
                            getOptionLabel={(option) => `${option.name}`}
                            value={isAdmin ? selectedUser : user}
                            size="small"
                            onChange={(e, newValue) => {
                              if (isAdmin) {
                                setSelectedUser(newValue);
                                if (newValue != null && Array.isArray(newValue.queues)) {
                                  if (newValue.queues.length === 1) {
                                    setSelectedQueue(newValue.queues[0].id);
                                  }
                                  setQueues(newValue.queues);
                                } else {
                                  setQueues(allQueues);
                                  setSelectedQueue("");
                                }
                              }
                            }}
                            options={isAdmin ? options : [user]}
                            filterOptions={filterOptions}
                            freeSolo={isAdmin}
                            fullWidth
                            disabled={values.openTicket === "disabled" || !isAdmin}
                            autoHighlight
                            noOptionsText={i18n.t("transferTicketModal.noOptions")}
                            loading={loading}
                            renderOption={(option) => (
                              <span>
                                <UserStatusIcon user={option} /> {option.name}
                              </span>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                placeholder={i18n.t("transferTicketModal.fieldLabel")}
                                onChange={isAdmin ? (e) => setSearchParam(e.target.value) : undefined}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <React.Fragment>
                                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                      {params.InputProps.endAdornment}
                                    </React.Fragment>
                                  ),
                                  readOnly: !isAdmin,
                                }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("transferTicketModal.fieldQueueLabel")}
                          </Typography>
                          <FormControl variant="outlined" fullWidth className={classes.formControl}>
                            <Select
                              value={selectedQueue}
                              onChange={(e) => setSelectedQueue(e.target.value)}
                              displayEmpty
                              disabled={values.openTicket === "disabled"}
                            >
                              {queues.map((queue) => (
                                <MenuItem key={queue.id} value={queue.id}>
                                  {queue.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("campaigns.dialog.form.statusTicket")}
                          </Typography>
                          <FormControl variant="outlined" fullWidth className={classes.formControl}>
                            <Field as={Select} disabled={values.openTicket === "disabled"} id="statusTicket" name="statusTicket" displayEmpty>
                              <MenuItem value={"closed"}>
                                {i18n.t("campaigns.dialog.form.closedTicketStatus")}
                              </MenuItem>
                              <MenuItem value={"open"}>
                                {i18n.t("campaigns.dialog.form.openTicketStatus")}
                              </MenuItem>
                            </Field>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </div>
                  </Grid>

                  <Grid item xs={12}>
                    <div className={classes.sectionCard}>
                      <Typography className={classes.sectionTitle}>
                        {i18n.t("scheduleModal.sections.planning")}
                      </Typography>
                      <Typography className={classes.sectionSubtitle}>
                        {i18n.t("scheduleModal.sections.planningDescription")}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("scheduleModal.form.sendAt")}
                          </Typography>
                          <Field
                            as={TextField}
                            type="datetime-local"
                            name="sendAt"
                            error={touched.sendAt && Boolean(errors.sendAt)}
                            helperText={touched.sendAt && errors.sendAt}
                            variant="outlined"
                            fullWidth
                            size="small"
                            className={classes.formControl}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography className={classes.sectionTitle} style={{ marginTop: 4 }}>
                            {i18n.t("recurrenceSection.title")}
                          </Typography>
                          <Typography className={classes.sectionSubtitle}>
                            {i18n.t("recurrenceSection.description")}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container spacing={2} className={classes.compactRow}>
                            <Grid item xs={12} md={4}>
                              <Typography className={classes.fieldLabel}>
                                {i18n.t("recurrenceSection.labelInterval")}
                              </Typography>
                              <FormControl size="small" fullWidth variant="outlined" className={classes.formControl}>
                                <Select value={intervalo} onChange={(e) => setIntervalo(e.target.value || 1)}>
                                  <MenuItem value={1}>{i18n.t("recurrenceSection.options.days")}</MenuItem>
                                  <MenuItem value={2}>{i18n.t("recurrenceSection.options.weeks")}</MenuItem>
                                  <MenuItem value={3}>{i18n.t("recurrenceSection.options.months")}</MenuItem>
                                  <MenuItem value={4}>{i18n.t("recurrenceSection.options.minutes")}</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography className={classes.fieldLabel}>
                                {i18n.t("recurrenceSection.intervalFilterValue")}
                              </Typography>
                              <Field
                                as={TextField}
                                name="valorIntervalo"
                                size="small"
                                variant="outlined"
                                className={classes.formControl}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Typography className={classes.fieldLabel}>
                                {i18n.t("recurrenceSection.sendAsManyTimes")}
                              </Typography>
                              <Field
                                as={TextField}
                                name="enviarQuantasVezes"
                                size="small"
                                variant="outlined"
                                className={classes.formControl}
                                fullWidth
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} md={7}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("scheduleModal.form.holidayMode")}
                          </Typography>
                          <FormControl size="small" fullWidth variant="outlined" className={classes.formControl}>
                            <Select value={tipoDias} onChange={(e) => setTipoDias(e.target.value || 4)}>
                              <MenuItem value={4}>
                                {i18n.t("recurrenceSection.shipNormallyOnNonbusinessDays")}
                              </MenuItem>
                              <MenuItem value={5}>
                                {i18n.t("recurrenceSection.sendOneBusinessDayBefore")}
                              </MenuItem>
                              <MenuItem value={6}>
                                {i18n.t("recurrenceSection.sendOneBusinessDayLater")}
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <div className={classes.switchRow}>
                            <div className={classes.switchTextWrap}>
                              <Typography className={classes.switchTitle}>
                                {i18n.t("scheduleModal.form.assinar")}
                              </Typography>
                              <Typography className={classes.switchDescription}>
                                {i18n.t("scheduleModal.form.assinarDescription")}
                              </Typography>
                            </div>
                            <Field
                              as={Switch}
                              color="primary"
                              name="assinar"
                              checked={values.assinar}
                              disabled={values.openTicket === "disabled"}
                              className={classes.iosSwitch}
                            />
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions className={classes.dialogActions}>
                {!attachment && !schedule.mediaPath && (
                  <Button
                    color="primary"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting}
                    variant="outlined"
                    className={classes.outlineButton}
                  >
                    {i18n.t("quickMessages.buttons.attach")}
                  </Button>
                )}
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                  className={classes.outlineButton}
                >
                  {i18n.t("scheduleModal.buttons.cancel")}
                </Button>
                {(schedule.sentAt === null || schedule.sentAt === "") && (
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                    variant="contained"
                    className={`${classes.btnWrapper} ${classes.primaryButton}`}
                  >
                    {scheduleId
                      ? `${i18n.t("scheduleModal.buttons.okEdit")}`
                      : `${i18n.t("scheduleModal.buttons.okAdd")}`}
                    {isSubmitting && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </Button>
                )}
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default ScheduleModal;
