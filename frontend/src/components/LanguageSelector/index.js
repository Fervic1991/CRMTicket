import React, { useState, useEffect } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  makeStyles,
  Typography,
  Box,
  CircularProgress,
} from '@material-ui/core';
import { Language } from '@material-ui/icons';
import { i18n } from '../../translate/i18n';
import languageService from '../../services/languageService';
// Importar bandeiras do diretório public
const brFlag = '/flags/br.png';
const usFlag = '/flags/us.png';
const esFlag = '/flags/es.png';
const saFlag = '/flags/sa.png';
const trFlag = '/flags/tr.png';
const itFlag = '/flags/it.png';

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 120,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    position: 'relative',
    zIndex: 2,
  },
  select: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: '8px',
    padding: '4px 8px',
    position: 'relative',
    zIndex: 2,
    '& .MuiSelect-icon': {
      color: theme.palette.primary.main,
    },
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
    },
    '& .MuiSelect-select:focus': {
      backgroundColor: 'transparent',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  flag: {
    width: 20,
    height: 14,
    marginRight: theme.spacing(1),
    borderRadius: 2,
    objectFit: 'cover',
    display: 'inline-block',
  },
  languageIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const languageFlags = {
  pt: brFlag,
  en: usFlag,
  es: esFlag,
  ar: saFlag,
  tr: trFlag,
  it: itFlag,
};

const languageNames = {
  pt: { name: 'Português', nativeName: 'Português (Brasil)' },
  en: { name: 'English', nativeName: 'English (US)' },
  es: { name: 'Español', nativeName: 'Español' },
  ar: { name: 'العربية', nativeName: 'العربية' },
  tr: { name: 'Türkçe', nativeName: 'Türkçe' },
  it: { name: 'Italiano', nativeName: 'Italiano' },
};

const LanguageSelector = ({ variant = 'default' }) => {
  const classes = useStyles();
  const normalizeLang = (lang) => (lang ? lang.split("-")[0] : lang);
  const [currentLanguage, setCurrentLanguage] = useState('pt');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useBackend, setUseBackend] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadLanguageData = async () => {
      try {
        if (isMounted) setLoading(true);
        
        // Tentar carregar do backend
        const data = await languageService.getAvailableLanguages();
        
        if (data && isMounted) {
          // Filtrar apenas idiomas válidos
          const validLanguages = (data.languages || ['pt', 'en', 'es', 'ar', 'tr','it'])
            .map(normalizeLang)
            .filter(code => languageNames[code] && languageFlags[code]);
          
          // Garantir que o idioma atual seja válido
          let validCurrentLanguage = normalizeLang(data.currentLanguage) || 'pt';
          if (!validLanguages.includes(validCurrentLanguage)) {
            validCurrentLanguage = validLanguages.includes('pt') ? 'pt' : validLanguages[0] || 'pt';
          }
          
          setAvailableLanguages(validLanguages);
          setCurrentLanguage(validCurrentLanguage);
          setUseBackend(data.source === 'backend' || data.source === 'whitelabel_settings');
          
          // Atualizar i18n
          i18n.changeLanguage(validCurrentLanguage);
        }
      } catch (error) {
        console.error('Error loading language data:', error);
        
        if (isMounted) {
          // Fallback para localStorage
          const saved = normalizeLang(localStorage.getItem('i18nextLng')) || 'pt';
          setCurrentLanguage(saved);
          setAvailableLanguages(['pt', 'en', 'es', 'ar', 'tr', 'it']);
          setUseBackend(false);
          i18n.changeLanguage(saved);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLanguageData();

    // Listener para mudanças nas configurações do Whitelabel
    const handleLanguageSettingsUpdate = () => {
      console.log('🔄 Recarregando idiomas após atualização do Whitelabel');
      // Limpar cache do languageService
      languageService.invalidateCache();
      // Recarregar dados
      loadLanguageData();
    };

    window.addEventListener('languageSettingsUpdated', handleLanguageSettingsUpdate);
    window.addEventListener('storage', handleLanguageSettingsUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('languageSettingsUpdated', handleLanguageSettingsUpdate);
      window.removeEventListener('storage', handleLanguageSettingsUpdate);
    };
  }, []);

  const handleLanguageChange = async (event) => {
    const newLanguage = normalizeLang(event.target.value);
    setCurrentLanguage(newLanguage);
    
    try {
      if (useBackend) {
        // Salvar no backend
        await languageService.saveLanguagePreference(newLanguage);
      } else {
        // Fallback para localStorage
        localStorage.setItem('i18nextLng', newLanguage);
        localStorage.setItem('language', newLanguage);
        i18n.changeLanguage(newLanguage);
      }
      
      // Recarregar a página para aplicar todas as traduções
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error saving language preference:', error);
      
      // Em caso de erro, ainda tenta salvar no localStorage
      localStorage.setItem('i18nextLng', newLanguage);
      localStorage.setItem('language', newLanguage);
      i18n.changeLanguage(newLanguage);
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  const getCurrentLanguage = () => {
    const langData = languageNames[currentLanguage];
    // Se o idioma atual não existe na lista, usar o primeiro disponível
    if (!langData) {
      const validLanguages = Object.keys(languageNames);
      const fallbackLang = validLanguages.includes('pt') ? 'pt' : validLanguages[0];
      return {
        code: fallbackLang,
        flag: languageFlags[fallbackLang],
        ...languageNames[fallbackLang]
      };
    }
    return {
      code: currentLanguage,
      flag: languageFlags[currentLanguage],
      ...langData
    };
  };

  const getAvailableLanguagesList = () => {
    return availableLanguages
      .filter(code => languageNames[code] && languageFlags[code]) // Filtrar apenas códigos válidos
      .map(code => ({
        code,
        flag: languageFlags[code],
        ...languageNames[code]
      }));
  };

  if (loading) {
    return (
      <FormControl size="small" className={classes.formControl}>
        <CircularProgress size={20} />
      </FormControl>
    );
  }

  if (variant === 'compact') {
    return (
      <FormControl size="small" className={classes.formControl}>
        <Select
          value={currentLanguage}
          onChange={handleLanguageChange}
          className={classes.select}
          variant="standard"
          disableUnderline
        >
          {getAvailableLanguagesList().map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Box className={classes.menuItem}>
                <img src={lang.flag} alt={lang.code} className={classes.flag} />
                <Typography variant="body2">{lang.name}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <FormControl className={classes.formControl} size="small">
      <Select
        value={currentLanguage}
        onChange={handleLanguageChange}
        className={classes.select}
        variant="outlined"
        renderValue={() => {
          const lang = getCurrentLanguage();
          return (
            <Box display="flex" alignItems="center">
              <Language className={classes.languageIcon} fontSize="small" />
              {lang.flag && <img src={lang.flag} alt={lang.code} className={classes.flag} />}
              <Typography variant="body2">{lang.name || lang.code}</Typography>
            </Box>
          );
        }}
      >
        {getAvailableLanguagesList().map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            <Box className={classes.menuItem}>
              <img src={lang.flag} alt={lang.code} className={classes.flag} />
              <Box>
                <Typography variant="body2" style={{ fontWeight: 500 }}>
                  {lang.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {lang.nativeName}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
