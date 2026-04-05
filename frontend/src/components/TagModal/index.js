import React, { useState, useEffect, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { FormControl, MenuItem, Select, Grid } from "@material-ui/core";

const PRESET_COLORS = [
  "#60A5FA",
  "#38BDF8",
  "#22C55E",
  "#34D399",
  "#F59E0B",
  "#F97316",
  "#FB7185",
  "#F472B6",
  "#A78BFA",
  "#818CF8",
  "#14B8A6",
  "#94A3B8",
];

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  dialogPaper: {
    borderRadius: 22,
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
    padding: theme.spacing(3, 3.5, 2.5),
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(14,165,233,0.2))"
        : "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(14,165,233,0.08))",
  },
  dialogTitleText: {
    fontSize: 24,
    fontWeight: 700,
    color: theme.palette.mode === "dark" ? "#F8FAFC" : "#0F172A",
  },
  dialogSubtitle: {
    marginTop: theme.spacing(0.75),
    fontSize: 13,
    lineHeight: 1.6,
    color: theme.palette.mode === "dark" ? "rgba(226,232,240,0.72)" : "#64748B",
  },
  dialogContent: {
    padding: theme.spacing(3),
  },
  sectionCard: {
    padding: theme.spacing(2.5),
    borderRadius: 18,
    border: theme.palette.mode === "dark"
      ? "1px solid rgba(148,163,184,0.14)"
      : "1px solid #E2E8F0",
    background: theme.palette.mode === "dark"
      ? "rgba(15,23,42,0.46)"
      : "#FFFFFF",
    boxShadow: theme.palette.mode === "dark"
      ? "none"
      : "0 12px 26px rgba(15,23,42,0.05)",
  },
  fieldLabel: {
    marginBottom: theme.spacing(0.75),
    fontSize: 12,
    fontWeight: 700,
    color: theme.palette.mode === "dark" ? "#CBD5E1" : "#334155",
  },
  fieldControl: {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      background: theme.palette.mode === "dark" ? "rgba(15,23,42,0.7)" : "#FFFFFF",
      transition: "all 0.2s ease",
      "& fieldset": {
        borderColor: theme.palette.mode === "dark" ? "rgba(148,163,184,0.22)" : "#E2E8F0",
      },
      "&:hover fieldset": {
        borderColor: theme.palette.mode === "dark" ? "rgba(125,211,252,0.4)" : "#CBD5E1",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#2563EB",
      },
    },
  },
  colorPickerWrap: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
  },
  paletteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: theme.spacing(1),
  },
  swatch: {
    width: "100%",
    height: 42,
    borderRadius: 12,
    border: "2px solid transparent",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 8px 18px rgba(15,23,42,0.12)",
    },
  },
  swatchActive: {
    borderColor: "#0F172A",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.16)",
  },
  colorPreviewRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.25),
    padding: theme.spacing(1.25, 1.5),
    borderRadius: 12,
    background: theme.palette.mode === "dark" ? "rgba(15,23,42,0.55)" : "#F8FAFC",
    border: theme.palette.mode === "dark"
      ? "1px solid rgba(148,163,184,0.12)"
      : "1px solid #E2E8F0",
  },
  colorPreviewDot: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.95)",
    boxShadow: "0 4px 10px rgba(15,23,42,0.12)",
    flexShrink: 0,
  },
  dialogActions: {
    padding: theme.spacing(2.5, 3.5),
    borderTop:
      theme.palette.mode === "dark"
        ? "1px solid rgba(148,163,184,0.14)"
        : "1px solid rgba(226,232,240,0.95)",
    background:
      theme.palette.mode === "dark"
        ? "rgba(15,23,42,0.56)"
        : "rgba(248,250,252,0.92)",
  },
  ghostButton: {
    borderRadius: 12,
    textTransform: "none",
    color: theme.palette.mode === "dark" ? "#CBD5E1" : "#475569",
    background: "transparent",
    border: "none",
    boxShadow: "none",
    "&:hover": {
      background: theme.palette.mode === "dark" ? "rgba(148,163,184,0.12)" : "rgba(148,163,184,0.12)",
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
    "&:hover": {
      background: "linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)",
    },
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

const TagSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, i18n.t("tagModal.validation.messageTooShort"))
    .required(i18n.t("tagModal.validation.required"))
});

const getRandomHexColor = () => {
  const red = Math.floor(Math.random() * 256);
  const greenValue = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);
  return `#${red.toString(16).padStart(2, "0")}${greenValue.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
};

const TagModal = ({ open, onClose, tagId, kanban }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [lanes, setLanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLane, setSelectedLane] = useState(null);
  const [selectedRollbackLane, setSelectedRollbackLane] = useState(null);

  const initialState = {
    name: "",
    color: getRandomHexColor(),
    kanban: kanban || 0,
    timeLane: 0,
    nextLaneId: 0,
    greetingMessageLane: "",
    rollbackLaneId: 0,
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    const fetchLanes = async () => {
      try {
        const { data } = await api.get("/tags/", {
          params: { kanban: 1, tagId },
        });
        setLanes(data.tags);
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    };

    if (open) {
      setLoading(true);
      fetchLanes();
    }
  }, [open, tagId]);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const { data } = await api.get(`/tags/${tagId}`);
        setFormData(prev => ({ ...initialState, ...data }));
        setSelectedLane(data.nextLaneId || null);
        setSelectedRollbackLane(data.rollbackLaneId || null);
      } catch (err) {
        toastError(err);
      }
    };

    if (open && tagId) {
      fetchTag();
    } else if (open) {
      setFormData(initialState);
      setSelectedLane(null);
      setSelectedRollbackLane(null);
    }
  }, [tagId, open]);

  const handleClose = () => {
    setFormData(initialState);
    setSelectedLane(null);
    setSelectedRollbackLane(null);
    onClose();
  };

  const handleSaveTag = async values => {
    const tagData = {
      ...values,
      userId: user?.id,
      kanban: kanban,
      nextLaneId: selectedLane,
      rollbackLaneId: selectedRollbackLane
    };

    try {
      if (tagId) {
        await api.put(`/tags/${tagId}`, tagData);
      } else {
        await api.post("/tags", tagData);
      }
      toast.success(kanban === 0 ? i18n.t("tagModal.success") : i18n.t("tagModal.successKanban"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle}>
          <Typography className={classes.dialogTitleText} component="div">
            {tagId
              ? kanban === 0
                ? i18n.t("tagModal.title.edit")
                : i18n.t("tagModal.title.editKanban")
              : kanban === 0
                ? i18n.t("tagModal.title.add")
                : i18n.t("tagModal.title.addKanban")}
          </Typography>
          <Typography className={classes.dialogSubtitle} component="div">
            {i18n.t("tagModal.subtitle")}
          </Typography>
        </DialogTitle>
        <Formik
          initialValues={formData}
          enableReinitialize={true}
          validationSchema={TagSchema}
          onSubmit={handleSaveTag}
        >
          {({ touched, errors, isSubmitting, values, handleChange, setFieldValue }) => (
            <Form>
              <DialogContent dividers className={classes.dialogContent}>
                <div className={classes.sectionCard}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography className={classes.fieldLabel}>
                        {i18n.t("tagModal.form.name")}
                      </Typography>
                      <Field
                        as={TextField}
                        name="name"
                        fullWidth
                        placeholder={i18n.t("tagModal.form.name")}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        variant="outlined"
                        className={classes.fieldControl}
                        autoFocus
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography className={classes.fieldLabel}>
                        {i18n.t("tagModal.form.color")}
                      </Typography>
                      <div className={classes.colorPickerWrap}>
                        <div className={classes.paletteGrid}>
                          {PRESET_COLORS.map(color => (
                            <button
                              key={color}
                              type="button"
                              className={`${classes.swatch} ${values.color === color ? classes.swatchActive : ""}`}
                              style={{ background: color }}
                              onClick={() => setFieldValue("color", color)}
                              aria-label={color}
                            />
                          ))}
                        </div>
                        <div className={classes.colorPreviewRow}>
                          <div
                            className={classes.colorPreviewDot}
                            style={{ backgroundColor: values.color }}
                          />
                          <TextField
                            name="color"
                            value={values.color}
                            onChange={handleChange}
                            variant="outlined"
                            placeholder="#60A5FA"
                            className={classes.fieldControl}
                            fullWidth
                          />
                        </div>
                      </div>
                    </Grid>

                    {kanban === 1 && (
                      <>
                        <Grid item xs={12} md={6}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("tagModal.form.timeLane")}
                          </Typography>
                          <Field
                            as={TextField}
                            name="timeLane"
                            fullWidth
                            variant="outlined"
                            type="number"
                            className={classes.fieldControl}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("tagModal.form.nextLaneId")}
                          </Typography>
                          <FormControl variant="outlined" fullWidth className={classes.fieldControl}>
                            <Select
                              value={selectedLane || ""}
                              onChange={e => setSelectedLane(e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="">&nbsp;</MenuItem>
                              {lanes.map(lane => (
                                <MenuItem key={lane.id} value={lane.id}>
                                  {lane.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("tagModal.form.greetingMessageLane")}
                          </Typography>
                          <Field
                            as={TextField}
                            name="greetingMessageLane"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            className={classes.fieldControl}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography className={classes.fieldLabel}>
                            {i18n.t("tagModal.form.rollbackLaneId")}
                          </Typography>
                          <FormControl variant="outlined" fullWidth className={classes.fieldControl}>
                            <Select
                              value={selectedRollbackLane || ""}
                              onChange={e => setSelectedRollbackLane(e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="">&nbsp;</MenuItem>
                              {lanes.map(lane => (
                                <MenuItem key={lane.id} value={lane.id}>
                                  {lane.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </div>
              </DialogContent>
              <DialogActions className={classes.dialogActions}>
                <Button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={classes.ghostButton}
                >
                  {i18n.t("tagModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="contained"
                  className={`${classes.btnWrapper} ${classes.primaryButton}`}
                >
                  {tagId
                    ? i18n.t("tagModal.buttons.okEdit")
                    : i18n.t("tagModal.buttons.okAdd")}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default TagModal;
