import React, { useState, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import axios from 'axios';
import { getBackendUrl } from '../../config';
import defaultLogoLight from '../../assets/logo.png';
import defaultLogoDark from '../../assets/logo-black.png';

const backendUrl = getBackendUrl();

// Componente específico para página de login que busca logo pública
const PublicLogo = ({ 
  className, 
  style = {}, 
  alt = "Logo",
  width = "100%",
  height = "auto",
  maxWidth = "280px",
  maxHeight = "80px"
}) => {
  const theme = useTheme();
  const [logoSrc, setLogoSrc] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Determinar se está no modo escuro
  const isDarkMode = theme.palette.type === 'dark';
  
  const loadPublicLogo = async () => {
    try {
      // Buscar logo pública diretamente (sem autenticação)
      const response = await axios.get(`${backendUrl}/public/logos`);
      const { logos } = response.data;
      
      // Selecionar logo baseada no tema
      let selectedLogo;
      if (isDarkMode) {
        // No tema escuro, usar logo clara
        if (logos.logoLightUrl) {
          selectedLogo = `${backendUrl}/public/${logos.logoLightUrl}`;
        } else {
          selectedLogo = defaultLogoLight;
        }
      } else {
        // No tema claro, usar logo escura
        if (logos.logoDarkUrl) {
          selectedLogo = `${backendUrl}/public/${logos.logoDarkUrl}`;
        } else {
          selectedLogo = defaultLogoDark;
        }
      }
      
      setLogoSrc(selectedLogo);
    } catch (error) {
      console.error('Erro ao buscar logo pública:', error);
      // Fallback para logos padrão
      setLogoSrc(isDarkMode ? defaultLogoLight : defaultLogoDark);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadPublicLogo();
    
    // Recarregar logo quando houver mudanças
    const handleLogoUpdate = () => {
      loadPublicLogo();
    };
    
    // Escutar mudanças no localStorage (comunicação entre abas)
    const handleStorageChange = (e) => {
      if (e.key === 'logoUpdated') {
        loadPublicLogo();
      }
    };
    
    // Polling para verificar mudanças (a cada 3 segundos)
    const pollInterval = setInterval(() => {
      loadPublicLogo();
    }, 3000);
    
    window.addEventListener('logoUpdated', handleLogoUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [isDarkMode]);
  
  const logoStyle = {
    width,
    height,
    maxWidth,
    maxHeight,
    objectFit: 'contain',
    margin: '0 auto',
    display: 'block',
    ...style
  };
  
  if (loading) {
    return (
      <Skeleton 
        variant="rect" 
        width={maxWidth} 
        height={maxHeight}
        style={{ 
          borderRadius: 4,
          margin: '0 auto'
        }}
      />
    );
  }
  
  return (
    <img 
      src={logoSrc} 
      alt={alt}
      className={className}
      style={logoStyle}
      onError={(e) => {
        // Fallback se a imagem falhar
        e.target.src = isDarkMode ? defaultLogoLight : defaultLogoDark;
      }}
    />
  );
};

export default PublicLogo;