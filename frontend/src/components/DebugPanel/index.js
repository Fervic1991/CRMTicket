import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider
} from '@material-ui/core';
import {
  BugReport,
  Close,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Error,
  Warning,
  Refresh
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import api from '../../services/api';
import languageService from '../../services/languageService';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: 400,
    maxHeight: 600,
    zIndex: 9999,
    boxShadow: theme.shadows[10],
  },
  header: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.dark,
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    padding: theme.spacing(2),
    maxHeight: 500,
    overflowY: 'auto',
  },
  testResult: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
  },
  success: {
    backgroundColor: '#d4edda',
    borderLeft: '4px solid #28a745',
  },
  error: {
    backgroundColor: '#f8d7da',
    borderLeft: '4px solid #dc3545',
  },
  warning: {
    backgroundColor: '#fff3cd',
    borderLeft: '4px solid #ffc107',
  },
  info: {
    backgroundColor: '#d1ecf1',
    borderLeft: '4px solid #17a2b8',
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    padding: theme.spacing(1),
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
    marginTop: theme.spacing(1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  floatingButton: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 9998,
  }
}));

const DebugPanel = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const toggleExpanded = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const addResult = (test, status, details) => {
    const result = {
      test,
      status, // 'success', 'error', 'warning', 'info'
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setResults(prev => [...prev, result]);
    return result;
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    setExpandedItems({});

    try {
      // Teste 1: Configuração da API
      addResult(
        'Configuração da API',
        'info',
        {
          baseURL: api.defaults.baseURL,
          timeout: api.defaults.timeout,
          withCredentials: api.defaults.withCredentials,
          headers: api.defaults.headers
        }
      );

      // Teste 2: Status da Conexão
      addResult(
        'Status da Conexão',
        navigator.onLine ? 'success' : 'warning',
        {
          online: navigator.onLine,
          type: navigator.connection?.effectiveType || 'unknown',
          downlink: navigator.connection?.downlink || 'unknown'
        }
      );

      // Teste 3: LocalStorage
      const localStorageData = {
        token: localStorage.getItem('token') ? '✅ Presente' : '❌ Ausente',
        i18nextLng: localStorage.getItem('i18nextLng') || 'não definido',
        language: localStorage.getItem('language') || 'não definido',
        user: localStorage.getItem('user') ? '✅ Presente' : '❌ Ausente',
        companyId: localStorage.getItem('companyId') || 'não definido'
      };
      
      addResult(
        'LocalStorage',
        localStorageData.token.includes('✅') ? 'success' : 'warning',
        localStorageData
      );

      // Teste 4: SessionStorage
      const sessionStorageData = {
        languageFeature: sessionStorage.getItem('language_feature_enabled') || 'não definido',
        languageCache: sessionStorage.getItem('user_available_languages') ? '✅ Presente' : '❌ Ausente'
      };
      
      addResult(
        'SessionStorage',
        'info',
        sessionStorageData
      );

      // Teste 5: Health Check do Backend
      try {
        const startTime = Date.now();
        const response = await api.get('/health').catch(() => api.get('/ping'));
        const responseTime = Date.now() - startTime;
        
        addResult(
          'Backend Health Check',
          'success',
          {
            status: response.status,
            responseTime: `${responseTime}ms`,
            data: response.data
          }
        );
      } catch (error) {
        addResult(
          'Backend Health Check',
          'error',
          {
            message: error.message,
            code: error.code,
            isNetworkError: error.isNetworkError,
            suggestion: 'Verifique se o backend está rodando'
          }
        );
      }

      // Teste 6: Serviço de Idiomas
      try {
        // Diagnóstico do serviço
        await languageService.diagnose();
        
        // Verificar feature flag
        const featureEnabled = await languageService.isFeatureEnabled();
        
        // Obter idiomas disponíveis
        const languages = await languageService.getAvailableLanguages();
        
        addResult(
          'Serviço de Idiomas',
          'success',
          {
            featureEnabled,
            currentLanguage: languages.currentLanguage,
            availableLanguages: languages.languages,
            source: languages.source,
            cache: languageService.cache ? '✅ Ativo' : '❌ Vazio'
          }
        );
      } catch (error) {
        addResult(
          'Serviço de Idiomas',
          'error',
          {
            message: error.message,
            fallback: 'Usando localStorage como fallback'
          }
        );
      }

      // Teste 7: Endpoints de Idiomas (se autenticado)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/api/languages/settings');
          addResult(
            'API de Configurações de Idiomas',
            'success',
            response.data
          );
        } catch (error) {
          addResult(
            'API de Configurações de Idiomas',
            'error',
            {
              status: error.response?.status,
              message: error.response?.data?.message || error.message,
              url: '/api/languages/settings'
            }
          );
        }

        try {
          const response = await api.get('/api/languages/available');
          addResult(
            'API de Idiomas Disponíveis',
            'success',
            response.data
          );
        } catch (error) {
          addResult(
            'API de Idiomas Disponíveis',
            'error',
            {
              status: error.response?.status,
              message: error.response?.data?.message || error.message,
              url: '/api/languages/available'
            }
          );
        }
      } else {
        addResult(
          'APIs Autenticadas',
          'warning',
          { message: 'Token não encontrado - faça login para testar APIs autenticadas' }
        );
      }

      // Teste 8: Fila Offline
      const offlineQueue = JSON.parse(localStorage.getItem('language_offline_queue') || '[]');
      addResult(
        'Fila Offline',
        offlineQueue.length > 0 ? 'warning' : 'success',
        {
          itemsInQueue: offlineQueue.length,
          queue: offlineQueue
        }
      );

    } catch (error) {
      addResult(
        'Erro Geral',
        'error',
        {
          message: error.message,
          stack: error.stack
        }
      );
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle style={{ color: '#28a745' }} />;
      case 'error':
        return <Error style={{ color: '#dc3545' }} />;
      case 'warning':
        return <Warning style={{ color: '#ffc107' }} />;
      default:
        return <BugReport style={{ color: '#17a2b8' }} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'success':
        return classes.success;
      case 'error':
        return classes.error;
      case 'warning':
        return classes.warning;
      default:
        return classes.info;
    }
  };

  const clearResults = () => {
    setResults([]);
    setExpandedItems({});
  };

  // Auto-run tests on mount
  useEffect(() => {
    if (open) {
      runTests();
    }
  }, [open]);

  if (!open) {
    return (
      <IconButton
        className={classes.floatingButton}
        color="primary"
        onClick={() => setOpen(true)}
        style={{ backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
      >
        <BugReport />
      </IconButton>
    );
  }

  return (
    <Paper className={classes.root}>
      <Box className={classes.header}>
        <Box display="flex" alignItems="center">
          <BugReport style={{ marginRight: 8 }} />
          <Typography variant="h6">Debug Panel</Typography>
        </Box>
        <IconButton size="small" onClick={() => setOpen(false)} style={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      <Box className={classes.content}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={testing ? <CircularProgress size={16} /> : <Refresh />}
            onClick={runTests}
            disabled={testing}
          >
            {testing ? 'Testando...' : 'Executar Testes'}
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={clearResults}
            disabled={testing}
          >
            Limpar
          </Button>
        </Box>

        <Divider />

        <List>
          {results.map((result, index) => (
            <React.Fragment key={index}>
              <ListItem 
                className={`${classes.testResult} ${getStatusClass(result.status)}`}
                button
                onClick={() => toggleExpanded(index)}
              >
                <Box display="flex" alignItems="center" width="100%">
                  {getStatusIcon(result.status)}
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2">{result.test}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {result.timestamp}
                        </Typography>
                      </Box>
                    }
                  />
                  {expandedItems[index] ? <ExpandLess /> : <ExpandMore />}
                </Box>
              </ListItem>
              
              <Collapse in={expandedItems[index]} timeout="auto" unmountOnExit>
                <Box className={classes.codeBlock}>
                  {JSON.stringify(result.details, null, 2)}
                </Box>
              </Collapse>
            </React.Fragment>
          ))}
        </List>

        {results.length === 0 && !testing && (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="textSecondary">
              Clique em "Executar Testes" para começar o diagnóstico
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default DebugPanel;