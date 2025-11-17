import { useState, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { useLocation } from 'react-router-dom';
import whitelabelService from '../services/whitelabelService';
import defaultLogoLight from '../assets/logo.png';
import defaultLogoDark from '../assets/logo-black.png';

const useDynamicLogo = () => {
  const theme = useTheme();
  const location = useLocation();
  const [logoSrc, setLogoSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Determinar se está no modo escuro
  const isDarkMode = theme.palette.type === 'dark';
  
  // Verificar se está na página de login
  const isLoginPage = location.pathname === '/login' || location.pathname === '/signup';
  
  const loadLogo = async () => {
    setLoading(true);
    setError(false);
    
    try {
      // Se estiver na página de login, usar endpoint público
      const logos = isLoginPage 
        ? await whitelabelService.getPublicLogos()
        : await whitelabelService.getCurrentLogos();
      
      // Selecionar logo baseada no tema
      const selectedLogo = isDarkMode ? logos.light : logos.dark;
      
      // Se não houver logo específica, usar a padrão
      if (!selectedLogo || selectedLogo === '/logo.png' || selectedLogo === '/logo-black.png') {
        setLogoSrc(isDarkMode ? defaultLogoLight : defaultLogoDark);
      } else {
        setLogoSrc(selectedLogo);
      }
    } catch (error) {
      console.error('Erro ao carregar logo:', error);
      // Fallback para logos padrão
      setLogoSrc(isDarkMode ? defaultLogoLight : defaultLogoDark);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadLogo();
    
    // Escutar evento de atualização de logo
    const handleLogoUpdate = () => {
      whitelabelService.clearCache();
      loadLogo();
    };
    
    // Escutar mudanças no localStorage para atualização em tempo real entre abas
    const handleStorageChange = (e) => {
      if (e.key === 'logoUpdated') {
        whitelabelService.clearCache();
        loadLogo();
      }
    };
    
    // Polling para verificar mudanças quando na página de login
    let pollInterval;
    if (isLoginPage) {
      // Verificar a cada 5 segundos se houve mudança na logo
      pollInterval = setInterval(() => {
        whitelabelService.clearCache();
        loadLogo();
      }, 5000);
    }
    
    window.addEventListener('logoUpdated', handleLogoUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate);
      window.removeEventListener('storage', handleStorageChange);
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isDarkMode, isLoginPage]);
  
  return { logoSrc, loading, error };
};

export default useDynamicLogo;