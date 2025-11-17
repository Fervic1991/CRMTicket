import React from 'react';
import { Skeleton } from '@material-ui/lab';
import useDynamicLogo from '../../hooks/useDynamicLogo';

const DynamicLogo = ({ 
  className, 
  style = {}, 
  alt = "Logo",
  width = "auto",
  height = "auto",
  maxWidth = "180px",
  maxHeight = "45px"
}) => {
  const { logoSrc, loading, error } = useDynamicLogo();
  
  const logoStyle = {
    width,
    height,
    maxWidth,
    maxHeight,
    objectFit: 'contain',
    ...style
  };
  
  if (loading) {
    return (
      <Skeleton 
        variant="rect" 
        width={maxWidth} 
        height={maxHeight}
        style={{ borderRadius: 4 }}
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
        console.error('Erro ao carregar imagem da logo:', e.target.src);
        // Já temos fallback no hook, então apenas logamos o erro
      }}
    />
  );
};

export default DynamicLogo;