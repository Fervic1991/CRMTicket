import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  Grid,
  Checkbox,
  FormGroup,
  Button,
  Divider,
  Box,
  Alert,
  Chip,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Language, Settings, SupervisorAccount, Person } from "@material-ui/icons";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import languageService from "../../services/languageService";
import useAuth from "../../hooks/useAuth";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
  },
  languageGrid: {
    marginTop: theme.spacing(2),
  },
  flagIcon: {
    width: 24,
    height: 16,
    marginRight: theme.spacing(1),
    borderRadius: 2,
  },
  actionButtons: {
    marginTop: theme.spacing(2),
    display: "flex",
    gap: theme.spacing(2),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  infoBox: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
  },
}));

const languages = [
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

const LanguageSettings = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featureEnabled, setFeatureEnabled] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [systemLanguages, setSystemLanguages] = useState([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Carregar configurações gerais
      const settings = await languageService.getLanguageSettings();
      setFeatureEnabled(settings.featureEnabled);
      setSystemLanguages(settings.systemLanguages);

      // Carregar línguas disponíveis
      const availableData = await languageService.getAvailableLanguages();
      setAvailableLanguages(availableData.languages);

      // Definir línguas selecionadas baseado no perfil
      if (user.profile === "super") {
        setSelectedLanguages(settings.enabledLanguages || settings.systemLanguages);
      } else if (user.profile === "admin") {
        // Buscar configurações específicas do admin
        const adminLangs = user.adminSelectedLanguages || settings.enabledLanguages;
        setSelectedLanguages(adminLangs);
      } else {
        setSelectedLanguages(availableData.languages);
      }
    } catch (error) {
      console.error("Error loading language settings:", error);
      toast.error(t("settings.languages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = async (event) => {
    const enabled = event.target.checked;
    try {
      setSaving(true);
      await languageService.toggleFeature(enabled);
      setFeatureEnabled(enabled);
      toast.success(
        enabled
          ? t("settings.languages.featureEnabled")
          : t("settings.languages.featureDisabled")
      );
    } catch (error) {
      console.error("Error toggling feature:", error);
      toast.error(t("settings.languages.toggleError"));
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageToggle = (langCode) => {
    if (selectedLanguages.includes(langCode)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== langCode));
      } else {
        toast.warning(t("settings.languages.atLeastOne"));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, langCode]);
    }
  };

  const handleSaveLanguages = async () => {
    try {
      setSaving(true);
      
      if (user.profile === "super") {
        const result = await languageService.updateSuperAdminLanguages(selectedLanguages);
        if (result.affectedUsers > 0) {
          toast.info(
            t("settings.languages.usersAffected", { count: result.affectedUsers })
          );
        }
      } else if (user.profile === "admin") {
        await languageService.updateAdminLanguages(selectedLanguages);
      }
      
      toast.success(t("settings.languages.saved"));
      
      // Recarregar configurações
      await loadSettings();
    } catch (error) {
      console.error("Error saving languages:", error);
      toast.error(t("settings.languages.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const getMaxLanguages = () => {
    if (user.profile === "super") {
      return systemLanguages;
    } else if (user.profile === "admin") {
      return availableLanguages;
    }
    return [];
  };

  const canEditLanguages = () => {
    return user.profile === "super" || user.profile === "admin";
  };

  if (loading) {
    return (
      <Paper className={classes.paper}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className={classes.paper}>
      <div className={classes.section}>
        <div className={classes.sectionTitle}>
          <Language color="primary" />
          <Typography variant="h6">
            {t("settings.languages.title", "Configurações de Idiomas")}
          </Typography>
        </div>
        <Divider />
      </div>

      {/* Feature Toggle - Apenas Super Admin */}
      {user.profile === "super" && (
        <div className={classes.section}>
          <FormControlLabel
            control={
              <Switch
                checked={featureEnabled}
                onChange={handleFeatureToggle}
                color="primary"
                disabled={saving}
              />
            }
            label={
              <Box>
                <Typography variant="body1">
                  {t("settings.languages.enableNewSystem", "Habilitar novo sistema de idiomas")}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t(
                    "settings.languages.enableNewSystemDesc",
                    "Migra o sistema de idiomas do localStorage para o backend com permissões hierárquicas"
                  )}
                </Typography>
              </Box>
            }
          />
        </div>
      )}

      {/* Status do Sistema */}
      <div className={classes.section}>
        <Alert
          severity={featureEnabled ? "success" : "info"}
          icon={<Settings />}
        >
          {featureEnabled
            ? t("settings.languages.systemActive", "Sistema de idiomas baseado em backend está ativo")
            : t("settings.languages.systemLegacy", "Sistema usando localStorage (legado)")}
        </Alert>
      </div>

      {/* Seleção de Idiomas */}
      {featureEnabled && canEditLanguages() && (
        <div className={classes.section}>
          <Typography variant="subtitle1" gutterBottom>
            {user.profile === "super"
              ? t("settings.languages.selectGlobal", "Idiomas disponíveis na plataforma")
              : t("settings.languages.selectAdmin", "Idiomas disponíveis para seus usuários")}
          </Typography>

          <FormGroup className={classes.languageGrid}>
            <Grid container spacing={2}>
              {getMaxLanguages().map((langCode) => {
                const lang = languages.find((l) => l.code === langCode);
                if (!lang) return null;

                return (
                  <Grid item xs={12} sm={6} md={4} key={lang.code}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedLanguages.includes(lang.code)}
                          onChange={() => handleLanguageToggle(lang.code)}
                          color="primary"
                          disabled={saving}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          <span style={{ fontSize: 20, marginRight: 8 }}>
                            {lang.flag}
                          </span>
                          {lang.name}
                        </Box>
                      }
                    />
                  </Grid>
                );
              })}
            </Grid>
          </FormGroup>

          <div className={classes.actionButtons}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveLanguages}
              disabled={saving}
            >
              {saving ? <CircularProgress size={20} /> : t("settings.save", "Salvar")}
            </Button>
            <Button
              variant="outlined"
              onClick={loadSettings}
              disabled={saving}
            >
              {t("settings.cancel", "Cancelar")}
            </Button>
          </div>
        </div>
      )}

      {/* Informações de Hierarquia */}
      {featureEnabled && (
        <Box className={classes.infoBox}>
          <Typography variant="subtitle2" gutterBottom>
            {t("settings.languages.hierarchy", "Hierarquia de Permissões")}
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <SupervisorAccount fontSize="small" />
              <Typography variant="body2">
                <strong>Super Admin:</strong>{" "}
                {t("settings.languages.superAdminDesc", "Define idiomas globais da plataforma")}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Person fontSize="small" />
              <Typography variant="body2">
                <strong>Admin:</strong>{" "}
                {t("settings.languages.adminDesc", "Escolhe idiomas para seus usuários (limitado ao que o Super Admin habilitou)")}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Person fontSize="small" />
              <Typography variant="body2">
                <strong>Usuário:</strong>{" "}
                {t("settings.languages.userDesc", "Seleciona seu idioma preferido dentre os disponibilizados")}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Idiomas Atualmente Disponíveis */}
      <Box className={classes.infoBox}>
        <Typography variant="subtitle2" gutterBottom>
          {t("settings.languages.currentlyAvailable", "Idiomas Disponíveis para Você")}
        </Typography>
        <Box>
          {availableLanguages.map((langCode) => {
            const lang = languages.find((l) => l.code === langCode);
            if (!lang) return null;
            return (
              <Chip
                key={lang.code}
                label={`${lang.flag} ${lang.name}`}
                className={classes.chip}
                color="primary"
                variant="outlined"
              />
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
};

export default LanguageSettings;