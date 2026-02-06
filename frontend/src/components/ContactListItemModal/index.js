import React, { useState, useEffect, useRef, useContext } from "react";

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
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
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
  dialogSubtitle: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
  dialogContent: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  field: {
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
      "&.Mui-error": {
        borderColor: "rgba(244,67,54,0.7)",
        boxShadow: "0 0 0 3px rgba(244,67,54,0.12)",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    "& .MuiFormHelperText-root.Mui-error": {
      color: theme.palette.error.main,
    },
  },
  fieldStack: {
    display: "grid",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(1),
  },
  helperText: {
    marginLeft: 2,
  },
  actions: {
    padding: theme.spacing(2, 3),
    gap: theme.spacing(1.5),
  },
  cancelButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
  },
  primaryButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    boxShadow: "0 14px 28px rgba(63,81,181,0.28)",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  number: Yup.string().min(8, "Too Short!").max(50, "Too Long!"),
  email: Yup.string().email("Invalid email"),
});

const ContactListItemModal = ({
  open,
  onClose,
  contactId,
  initialValues,
  onSave,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const {
    user: { companyId },
  } = useContext(AuthContext);
  const { contactListId } = useParams();

  const initialState = {
    name: "",
    number: "",
    email: "",
  };
  const [contact, setContact] = useState(initialState);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchContact = async () => {
      if (initialValues) {
        setContact((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      if (!contactId) return;

      try {
        const { data } = await api.get(`/contact-list-items/${contactId}`);
        if (isMounted.current) {
          setContact(data);
        }
      } catch (err) {
        toastError(err);
      }
    };

    fetchContact();
  }, [contactId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setContact(initialState);
  };

  const handleSaveContact = async (values) => {
    try {
      if (contactId) {
        await api.put(`/contact-list-items/${contactId}`, {
          ...values,
          companyId,
          contactListId,
        });
        handleClose();
      } else {
        const { data } = await api.post("/contact-list-items", {
          ...values,
          companyId,
          contactListId,
        });
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("contactModal.success"));
    } catch (err) {
      toastError(err);
    }
  };
  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          {contactId
            ? `${i18n.t("contactModal.title.edit")}`
            : `${i18n.t("contactModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={contact}
          enableReinitialize={true}
          validationSchema={ContactSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveContact(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent dividers className={classes.dialogContent}>
                <Typography variant="subtitle1" gutterBottom className={classes.dialogSubtitle}>
                  {i18n.t("contactModal.form.mainInfo")}
                </Typography>
                <div className={classes.fieldStack}>
                  <Field
                    as={TextField}
                    label={i18n.t("contactModal.form.name")}
                    name="name"
                    autoFocus
                    required
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    FormHelperTextProps={{ className: classes.helperText }}
                    variant="outlined"
                    className={classes.field}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("contactModal.form.number")}
                    name="number"
                    error={touched.number && Boolean(errors.number)}
                    helperText={touched.number && errors.number}
                    FormHelperTextProps={{ className: classes.helperText }}
                    placeholder="5513912344321"
                    variant="outlined"
                    className={classes.field}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("contactModal.form.email")}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    FormHelperTextProps={{ className: classes.helperText }}
                    placeholder="Email address"
                    fullWidth
                    variant="outlined"
                    className={classes.field}
                  />
                </div>
              </DialogContent>
              <DialogActions className={classes.actions}>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                  className={classes.cancelButton}
                >
                  {i18n.t("contactModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                  classes={{ root: classes.primaryButton }}
                >
                  {contactId
                    ? `${i18n.t("contactModal.buttons.okEdit")}`
                    : `${i18n.t("contactModal.buttons.okAdd")}`}
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

export default ContactListItemModal;
