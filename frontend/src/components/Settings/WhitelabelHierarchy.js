import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Grid,
  FormControl,
  TextField,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  CloudUpload,
  Delete,
  Business,
  Public,
  Image,
  Visibility,
  CheckCircle,
  Info,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import whitelabelService from "../../services/whitelabelService";
import { getBackendUrl } from "../../config";
import DynamicLogo from "../DynamicLogo";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
  },
  sectionPaper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(1),
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  sectionIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  sectionTitle: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  sectionSubtitle: {
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
    marginTop: theme.spacing(0.5),
  },
  hierarchyCard: {
    marginBottom: theme.spacing(2),
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
  },
  globalCard: {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
  companyCard: {
    borderColor: theme.palette.secondary.main,
  },
  uploadArea: {
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(3),
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.action.hover,
    },
  },
  uploadInput: {
    display: "none",
  },
  previewCard: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    textAlign: "center",
    minHeight: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  previewLight: {
    backgroundColor: "#ffffff",
  },
  previewDark: {
    backgroundColor: "#424242",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "100px",
    objectFit: "contain",
  },
  hierarchyInfo: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.info.light,
    borderRadius: theme.spacing(0.5),
  },
  statusChip: {
    marginLeft: theme.spacing(1),
  },
  uploadButton: {
    marginTop: theme.spacing(2),
  },
  settingsList: {
    marginTop: theme.spacing(2),
  },
  deleteButton: {
    color: theme.palette.error.main,
  },
}));

export default function WhitelabelHierarchy({ settings }) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [currentLogos, setCurrentLogos] = useState({ light: "", dark: "", source: "default" });
  const [previewLight, setPreviewLight] = useState("");
  const [previewDark, setPreviewDark] = useState("");
  const [selectedLight, setSelectedLight] = useState(null);
  const [selectedDark, setSelectedDark] = useState(null);
  const [whitelabelSettings, setWhitelabelSettings] = useState([]);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const logoLightInput = useRef(null);
  const logoDarkInput = useRef(null);

  useEffect(() => {
    loadCurrentLogos();
    if (user?.profile === "super") {
      loadAllSettings();
    }
  }, []);

  const loadCurrentLogos = async () => {
    try {
      const logos = await whitelabelService.getCurrentLogos();
      setCurrentLogos(logos);
    } catch (error) {
      console.error("Erro ao carregar logos:", error);
    }
  };

  const loadAllSettings = async () => {
    try {
      const settings = await whitelabelService.listSettings();
      setWhitelabelSettings(settings);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const handleFileSelect = (type, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "light") {
          setSelectedLight(file);
          setPreviewLight(reader.result);
        } else {
          setSelectedDark(file);
          setPreviewDark(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedLight && !selectedDark) {
      toast.error(i18n.t("whitelabel.hierarchy.selectAtLeastOne"));
      return;
    }

    setLoading(true);
    try {
      const files = {};
      if (selectedLight) files.light = selectedLight;
      if (selectedDark) files.dark = selectedDark;

      const companyId = user.profile === "admin" ? user.companyId : null;
      
      await whitelabelService.uploadLogos(files, companyId);
      
      await loadCurrentLogos();
      if (user?.profile === "super") {
        await loadAllSettings();
      }
      
      setSelectedLight(null);
      setSelectedDark(null);
      setPreviewLight("");
      setPreviewDark("");
      
      toast.success(i18n.t("whitelabel.hierarchy.uploadSuccess"));
    } catch (error) {
      toast.error(i18n.t("whitelabel.hierarchy.uploadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(i18n.t("whitelabel.hierarchy.confirmDelete"))) {
      return;
    }

    try {
      await whitelabelService.deleteSetting(id);
      await loadAllSettings();
      await loadCurrentLogos();
      toast.success(i18n.t("whitelabel.hierarchy.deleteSuccess"));
    } catch (error) {
      toast.error(i18n.t("whitelabel.hierarchy.deleteError"));
    }
  };

  const getHierarchyExplanation = () => {
    if (user?.profile === "super") {
      return i18n.t("whitelabel.hierarchy.superExplanation");
    } else if (user?.profile === "admin") {
      return i18n.t("whitelabel.hierarchy.adminExplanation");
    }
    return i18n.t("whitelabel.hierarchy.userExplanation");
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case "global":
        return { label: i18n.t("whitelabel.hierarchy.global"), color: "primary" };
      case "company":
        return { label: i18n.t("whitelabel.hierarchy.company"), color: "secondary" };
      default:
        return { label: i18n.t("whitelabel.hierarchy.default"), color: "default" };
    }
  };

  if (user?.profile === "user") {
    return (
      <div className={classes.container}>
        <Alert severity="info">
          {i18n.t("whitelabel.hierarchy.noPermission")}
        </Alert>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      {/* Informações sobre Hierarquia */}
      <Paper className={classes.sectionPaper}>
        <div className={classes.sectionHeader}>
          <Info className={classes.sectionIcon} />
          <div>
            <Typography variant="h6" className={classes.sectionTitle}>
              {i18n.t("whitelabel.hierarchy.title")}
            </Typography>
            <Typography className={classes.sectionSubtitle}>
              {getHierarchyExplanation()}
            </Typography>
          </div>
        </div>

        <Alert severity="info" className={classes.hierarchyInfo}>
          <Typography variant="body2">
            <strong>{i18n.t("whitelabel.hierarchy.currentStatus")}:</strong>{" "}
            {i18n.t("whitelabel.hierarchy.usingLogo")}{" "}
            <Chip
              size="small"
              label={getSourceLabel(currentLogos.source).label}
              color={getSourceLabel(currentLogos.source).color}
              className={classes.statusChip}
            />
          </Typography>
        </Alert>

        {/* Preview Atual */}
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            {i18n.t("whitelabel.hierarchy.currentLogos")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card className={`${classes.previewCard} ${classes.previewLight}`}>
                <DynamicLogo
                  maxHeight="80px"
                  alt={i18n.t("whitelabel.logoLight")}
                />
                <Typography variant="caption" style={{ marginTop: 8 }}>
                  {i18n.t("whitelabel.logoLight")}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card className={`${classes.previewCard} ${classes.previewDark}`}>
                <DynamicLogo
                  maxHeight="80px"
                  alt={i18n.t("whitelabel.logoDark")}
                />
                <Typography variant="caption" style={{ marginTop: 8, color: "#fff" }}>
                  {i18n.t("whitelabel.logoDark")}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Upload de Novas Logos */}
      <Paper className={classes.sectionPaper}>
        <div className={classes.sectionHeader}>
          <CloudUpload className={classes.sectionIcon} />
          <div>
            <Typography variant="h6" className={classes.sectionTitle}>
              {i18n.t("whitelabel.hierarchy.uploadTitle")}
            </Typography>
            <Typography className={classes.sectionSubtitle}>
              {user?.profile === "super"
                ? i18n.t("whitelabel.hierarchy.uploadGlobal")
                : i18n.t("whitelabel.hierarchy.uploadCompany")}
            </Typography>
          </div>
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <input
              type="file"
              ref={logoLightInput}
              className={classes.uploadInput}
              accept="image/*"
              onChange={(e) => handleFileSelect("light", e.target.files[0])}
            />
            <Box
              className={classes.uploadArea}
              onClick={() => logoLightInput.current.click()}
            >
              {previewLight ? (
                <img
                  src={previewLight}
                  alt="Preview Light"
                  className={classes.previewImage}
                />
              ) : (
                <Image style={{ fontSize: 48, color: "#ccc" }} />
              )}
              <Typography variant="body2" style={{ marginTop: 8 }}>
                {i18n.t("whitelabel.hierarchy.clickToUpload")} - {i18n.t("whitelabel.logoLight")}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <input
              type="file"
              ref={logoDarkInput}
              className={classes.uploadInput}
              accept="image/*"
              onChange={(e) => handleFileSelect("dark", e.target.files[0])}
            />
            <Box
              className={classes.uploadArea}
              onClick={() => logoDarkInput.current.click()}
            >
              {previewDark ? (
                <img
                  src={previewDark}
                  alt="Preview Dark"
                  className={classes.previewImage}
                />
              ) : (
                <Image style={{ fontSize: 48, color: "#ccc" }} />
              )}
              <Typography variant="body2" style={{ marginTop: 8 }}>
                {i18n.t("whitelabel.hierarchy.clickToUpload")} - {i18n.t("whitelabel.logoDark")}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
            onClick={handleUpload}
            disabled={loading || (!selectedLight && !selectedDark)}
            className={classes.uploadButton}
          >
            {loading
              ? i18n.t("whitelabel.hierarchy.uploading")
              : i18n.t("whitelabel.hierarchy.uploadButton")}
          </Button>
        </Box>
      </Paper>

      {/* Lista de Configurações (apenas para super admin) */}
      {user?.profile === "super" && whitelabelSettings.length > 0 && (
        <Paper className={classes.sectionPaper}>
          <div className={classes.sectionHeader}>
            <Business className={classes.sectionIcon} />
            <div>
              <Typography variant="h6" className={classes.sectionTitle}>
                {i18n.t("whitelabel.hierarchy.allSettings")}
              </Typography>
              <Typography className={classes.sectionSubtitle}>
                {i18n.t("whitelabel.hierarchy.allSettingsDescription")}
              </Typography>
            </div>
          </div>

          <List className={classes.settingsList}>
            {whitelabelSettings.map((setting) => (
              <ListItem key={setting.id} divider>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center">
                      {setting.isGlobal ? (
                        <>
                          <Public style={{ marginRight: 8 }} />
                          {i18n.t("whitelabel.hierarchy.globalSetting")}
                        </>
                      ) : (
                        <>
                          <Business style={{ marginRight: 8 }} />
                          {setting.company?.name || i18n.t("whitelabel.hierarchy.companySetting")}
                        </>
                      )}
                      <Chip
                        size="small"
                        label={setting.isGlobal ? "Global" : "Company"}
                        color={setting.isGlobal ? "primary" : "secondary"}
                        style={{ marginLeft: 8 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption">
                        {i18n.t("whitelabel.hierarchy.createdBy")}: {setting.user?.name || "N/A"}
                      </Typography>
                      <br />
                      <Typography variant="caption">
                        {i18n.t("whitelabel.hierarchy.createdAt")}:{" "}
                        {new Date(setting.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(setting.id)}
                    className={classes.deleteButton}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
}