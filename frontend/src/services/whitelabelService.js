import api from "./api";

class WhitelabelService {
  constructor() {
    this.logoCache = null;
    this.publicLogoCache = null;
    this.cacheTimestamp = 0;
    this.publicCacheTimestamp = 0;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  }

  async getCurrentLogos() {
    const now = Date.now();
    
    // Usar cache se ainda válido
    if (this.logoCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.logoCache;
    }
    
    try {
      const response = await api.get('/whitelabel/current-logo');
      const { logos } = response.data;
      
      // Adicionar URL completa do backend se necessário
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
      
      this.logoCache = {
        light: logos.logoLightUrl ? `${backendUrl}${logos.logoLightUrl}` : '/logo.png',
        dark: logos.logoDarkUrl ? `${backendUrl}${logos.logoDarkUrl}` : '/logo-black.png',
        source: logos.source
      };
      this.cacheTimestamp = now;
      
      return this.logoCache;
    } catch (error) {
      console.error('Erro ao buscar logos:', error);
      // Fallback para logos padrão
      return {
        light: '/logo.png',
        dark: '/logo-black.png',
        source: 'default'
      };
    }
  }
  
  async getPublicLogos() {
    const now = Date.now();
    
    // Usar cache se ainda válido
    if (this.publicLogoCache && (now - this.publicCacheTimestamp) < this.CACHE_DURATION) {
      return this.publicLogoCache;
    }
    
    try {
      const response = await api.get('/whitelabel/public-logo');
      const { logos } = response.data;
      
      // Adicionar URL completa do backend se necessário
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
      
      this.publicLogoCache = {
        light: logos.logoLightUrl ? `${backendUrl}${logos.logoLightUrl}` : '/logo.png',
        dark: logos.logoDarkUrl ? `${backendUrl}${logos.logoDarkUrl}` : '/logo-black.png',
        source: logos.source
      };
      this.publicCacheTimestamp = now;
      
      return this.publicLogoCache;
    } catch (error) {
      console.error('Erro ao buscar logos públicas:', error);
      // Fallback para logos padrão
      return {
        light: '/logo.png',
        dark: '/logo-black.png',
        source: 'default'
      };
    }
  }
  
  clearCache() {
    this.logoCache = null;
    this.publicLogoCache = null;
    this.cacheTimestamp = 0;
    this.publicCacheTimestamp = 0;
  }
  
  async uploadLogos(files, companyId = null) {
    const formData = new FormData();
    
    if (files.light) {
      formData.append('logoLight', files.light);
    }
    if (files.dark) {
      formData.append('logoDark', files.dark);
    }
    if (companyId) {
      formData.append('companyId', companyId.toString());
    }
    
    try {
      const response = await api.post('/whitelabel/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Limpar cache após upload
      this.clearCache();
      
      // Disparar evento para atualizar logos em todos os componentes
      window.dispatchEvent(new Event('logoUpdated'));
      
      // Usar localStorage para comunicar entre abas
      localStorage.setItem('logoUpdated', Date.now().toString());
      
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload de logos:', error);
      throw error;
    }
  }
  
  async listSettings() {
    try {
      const response = await api.get('/whitelabel/settings');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar configurações:', error);
      throw error;
    }
  }
  
  async deleteSetting(id) {
    try {
      const response = await api.delete(`/whitelabel/settings/${id}`);
      
      // Limpar cache após deletar
      this.clearCache();
      
      // Disparar evento para atualizar logos
      window.dispatchEvent(new Event('logoUpdated'));
      
      // Usar localStorage para comunicar entre abas
      localStorage.setItem('logoUpdated', Date.now().toString());
      
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar configuração:', error);
      throw error;
    }
  }
}

export default new WhitelabelService();