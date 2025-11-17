import api, { openApi } from "./api";
import { i18n } from "../translate/i18n";

const FEATURE_FLAG_KEY = "language_feature_enabled";
const CACHE_KEY = "user_available_languages";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const OFFLINE_QUEUE_KEY = "language_offline_queue";

class LanguageService {
  constructor() {
    this.cache = null;
    this.cacheTimestamp = null;
    this.featureEnabled = null;
    this.isOnline = navigator.onLine;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    
    // Monitorar status da conexão
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  /**
   * Manipula quando volta online
   */
  handleOnline() {
    console.log("✅ Conexão restaurada - processando fila offline");
    this.isOnline = true;
    this.processOfflineQueue();
  }

  /**
   * Manipula quando fica offline
   */
  handleOffline() {
    console.log("⚠️ Conexão perdida - modo offline ativado");
    this.isOnline = false;
  }

  /**
   * Implementa retry com backoff exponencial
   */
  async retryWithBackoff(fn, retryCount = 0) {
    try {
      this.retryAttempts = retryCount;
      const result = await fn();
      this.retryAttempts = 0; // Reset em caso de sucesso
      return result;
    } catch (error) {
      // Se não é erro de rede ou excedeu tentativas, rejeitar
      if (!error.isNetworkError || retryCount >= this.maxRetries) {
        this.retryAttempts = 0;
        throw error;
      }

      // Calcular delay com backoff exponencial
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.log(`⏱️ Tentativa ${retryCount + 1}/${this.maxRetries} falhou. Tentando novamente em ${delay/1000}s...`);
      
      // Aguardar e tentar novamente
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(fn, retryCount + 1);
    }
  }

  /**
   * Verifica se o novo sistema de idiomas está habilitado
   */
  async isFeatureEnabled() {
    try {
      // Verificar cache local primeiro
      if (this.featureEnabled !== null) {
        return this.featureEnabled;
      }

      // Se offline, usar cache do sessionStorage
      if (!this.isOnline) {
        const cached = sessionStorage.getItem(FEATURE_FLAG_KEY);
        return cached === "true";
      }

      // Tentar primeiro a rota pública que não requer autenticação
      const { data } = await this.retryWithBackoff(async () => {
        try {
          // Tentar rota pública primeiro
          return await api.get("/api/languages/public/feature-check");
        } catch (error) {
          // Se falhar, tentar rota autenticada (para usuários logados)
          const token = localStorage.getItem("token");
          if (token) {
            return await api.get("/api/languages/settings");
          }
          throw error;
        }
      });
      
      this.featureEnabled = data.featureEnabled;
      
      // Salvar no sessionStorage para uso offline
      sessionStorage.setItem(FEATURE_FLAG_KEY, String(data.featureEnabled));
      
      return data.featureEnabled;
    } catch (error) {
      console.error("Error checking language feature:", error);
      
      // Fallback para localStorage em caso de erro
      const cached = sessionStorage.getItem(FEATURE_FLAG_KEY);
      
      // Se nunca foi configurado, usar sistema legado (localStorage)
      if (cached === null) {
        console.warn("⚠️ Usando sistema legado de idiomas (localStorage)");
        return false;
      }
      
      return cached === "true";
    }
  }

  /**
   * Obtém as línguas disponíveis para o usuário atual
   */
  async getAvailableLanguages() {
    try {
      // Verificar se o novo sistema está habilitado
      const featureEnabled = await this.isFeatureEnabled();
      
      if (!featureEnabled) {
        // Sistema antigo - verificar configurações salvas do Whitelabel
        console.log("📦 Usando sistema legado de idiomas");
        
        // Tentar obter configurações salvas do Whitelabel
        try {
          // Usar a API pública que funciona para todos
          const { data: enabledLangsString } = await openApi.get("/public-settings/enabledLanguages");
          
          if (enabledLangsString) {
            try {
              const enabledLangs = JSON.parse(enabledLangsString);
              console.log("✅ Usando idiomas configurados no Whitelabel:", enabledLangs);
              return {
                languages: enabledLangs,
                currentLanguage: localStorage.getItem("i18nextLng") || "pt",
                source: "whitelabel_settings"
              };
            } catch (parseError) {
              console.log("⚠️ Erro ao parsear configurações de idiomas");
            }
          }
        } catch (error) {
          console.log("⚠️ Não foi possível carregar configurações do Whitelabel:", error.message);
        }
        
        // Fallback para todos os idiomas
        return {
          languages: ["pt", "en", "es", "ar", "tr"],
          currentLanguage: localStorage.getItem("i18nextLng") || "pt",
          source: "localStorage"
        };
      }

      // Verificar cache
      if (this.cache && this.cacheTimestamp) {
        const now = Date.now();
        if (now - this.cacheTimestamp < CACHE_DURATION) {
          console.log("📦 Usando cache de idiomas");
          return this.cache;
        }
      }

      // Se offline, usar cache do sessionStorage
      if (!this.isOnline) {
        console.log("📱 Modo offline - usando cache local");
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (e) {
            console.error("Error parsing cached languages:", e);
          }
        }
        // Fallback para configuração padrão
        return this.getDefaultLanguages();
      }

      // Buscar do backend com retry
      console.log("🌐 Buscando idiomas do backend...");
      const { data } = await this.retryWithBackoff(async () => {
        const token = localStorage.getItem("token");
        if (token) {
          // Usuário autenticado - usar rota autenticada
          return await api.get("/api/languages/available");
        } else {
          // Usuário não autenticado - usar rota pública
          return await api.get("/api/languages/public/available");
        }
      });
      
      // Atualizar cache
      this.cache = data;
      this.cacheTimestamp = Date.now();
      
      // Salvar no sessionStorage como backup
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      
      console.log("✅ Idiomas carregados:", data);
      return data;
    } catch (error) {
      console.error("Error getting available languages:", error);
      
      // Tentar recuperar do sessionStorage
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          console.log("📦 Usando cache de emergência");
          return JSON.parse(cached);
        } catch (e) {
          console.error("Error parsing cached languages:", e);
        }
      }
      
      // Fallback final para localStorage
      console.warn("⚠️ Usando fallback completo para localStorage");
      return this.getDefaultLanguages();
    }
  }

  /**
   * Retorna configuração padrão de idiomas
   */
  getDefaultLanguages() {
    return {
      languages: ["pt", "en", "es", "ar", "tr"],
      currentLanguage: localStorage.getItem("i18nextLng") || "pt",
      source: "localStorage_fallback"
    };
  }

  /**
   * Salva a preferência de idioma do usuário
   */
  async saveLanguagePreference(language) {
    try {
      const featureEnabled = await this.isFeatureEnabled();
      
      // Sempre salvar no localStorage para manter compatibilidade
      localStorage.setItem("i18nextLng", language);
      localStorage.setItem("language", language);
      i18n.changeLanguage(language);
      
      if (!featureEnabled) {
        // Sistema antigo - apenas localStorage
        console.log("💾 Idioma salvo no localStorage (sistema legado)");
        return { success: true, source: "localStorage" };
      }

      // Se offline, adicionar à fila
      if (!this.isOnline) {
        console.log("📱 Offline - adicionando à fila de sincronização");
        this.queueOfflineAction({
          type: "CHANGE_LANGUAGE",
          data: { language },
          timestamp: Date.now()
        });
        
        // Atualizar cache local
        if (this.cache) {
          this.cache.currentLanguage = language;
        }
        
        return {
          success: true,
          source: "offline_queue",
          message: "Preferência será sincronizada quando voltar online"
        };
      }

      // Novo sistema - salvar no backend com retry
      console.log("☁️ Salvando preferência no backend...");
      const { data } = await this.retryWithBackoff(() => 
        api.post("/api/languages/preferences", { language })
      );
      
      // Atualizar cache local
      if (this.cache) {
        this.cache.currentLanguage = language;
      }
      
      // Limpar cache para forçar atualização
      this.invalidateCache();
      
      console.log("✅ Preferência salva com sucesso");
      return data;
    } catch (error) {
      console.error("Error saving language preference:", error);
      
      // Se falhou após tentativas, adicionar à fila offline
      if (error.isNetworkError) {
        console.log("📱 Erro de rede - adicionando à fila offline");
        this.queueOfflineAction({
          type: "CHANGE_LANGUAGE",
          data: { language },
          timestamp: Date.now()
        });
      }
      
      return { 
        success: false, 
        error: error.message,
        source: "localStorage_fallback",
        message: "Preferência salva localmente devido a erro"
      };
    }
  }

  /**
   * Adiciona ação à fila offline
   */
  queueOfflineAction(action) {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
    queue.push(action);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log("📝 Ação adicionada à fila offline:", action);
  }

  /**
   * Processa fila de ações offline
   */
  async processOfflineQueue() {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
    
    if (queue.length === 0) {
      return;
    }
    
    console.log(`📤 Processando ${queue.length} ações offline...`);
    
    const processedActions = [];
    
    for (const action of queue) {
      try {
        if (action.type === "CHANGE_LANGUAGE") {
          await api.post("/api/languages/preferences", action.data);
          processedActions.push(action);
          console.log("✅ Ação sincronizada:", action);
        }
      } catch (error) {
        console.error("❌ Erro ao processar ação offline:", error);
        // Continuar com as próximas ações
      }
    }
    
    // Remover ações processadas da fila
    const remainingQueue = queue.filter(a => !processedActions.includes(a));
    
    if (remainingQueue.length > 0) {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
      console.log(`⚠️ ${remainingQueue.length} ações ainda pendentes`);
    } else {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      console.log("✅ Todas as ações foram sincronizadas");
    }
  }

  /**
   * Atualiza as línguas disponíveis para subordinados (Admin)
   */
  async updateAdminLanguages(languages) {
    try {
      const { data } = await this.retryWithBackoff(() => 
        api.put("/api/admin/languages", { languages })
      );
      
      // Limpar cache
      this.invalidateCache();
      
      return data;
    } catch (error) {
      console.error("Error updating admin languages:", error);
      throw error;
    }
  }

  /**
   * Atualiza as línguas globais (Super Admin)
   */
  async updateSuperAdminLanguages(languages) {
    try {
      const { data } = await this.retryWithBackoff(() => 
        api.put("/api/super-admin/languages", { languages })
      );
      
      // Limpar cache
      this.invalidateCache();
      
      return data;
    } catch (error) {
      console.error("Error updating super admin languages:", error);
      throw error;
    }
  }

  /**
   * Alterna o status da feature flag
   */
  async toggleFeature(enabled) {
    try {
      const { data } = await this.retryWithBackoff(() => 
        api.put("/api/languages/toggle-feature", { enabled })
      );
      
      // Atualizar cache local
      this.featureEnabled = enabled;
      sessionStorage.setItem(FEATURE_FLAG_KEY, String(enabled));
      
      // Limpar outros caches
      this.invalidateCache();
      
      return data;
    } catch (error) {
      console.error("Error toggling language feature:", error);
      throw error;
    }
  }

  /**
   * Obtém as configurações de idiomas da empresa
   */
  async getLanguageSettings() {
    try {
      const { data } = await this.retryWithBackoff(() => 
        api.get("/api/languages/settings")
      );
      return data;
    } catch (error) {
      console.error("Error getting language settings:", error);
      
      // Retornar configuração padrão em caso de erro
      return {
        systemLanguages: ["pt", "en", "es", "ar", "tr"],
        enabledLanguages: ["pt", "en", "es", "ar", "tr"],
        featureEnabled: false
      };
    }
  }

  /**
   * Invalida o cache local
   */
  invalidateCache() {
    this.cache = null;
    this.cacheTimestamp = null;
    sessionStorage.removeItem(CACHE_KEY);
    console.log("🗑️ Cache invalidado");
  }

  /**
   * Inicializa o serviço e configura o idioma inicial
   */
  async initialize() {
    try {
      console.log("🚀 Inicializando serviço de idiomas...");
      
      const data = await this.getAvailableLanguages();
      
      if (data.currentLanguage) {
        i18n.changeLanguage(data.currentLanguage);
        
        // Manter compatibilidade com localStorage
        localStorage.setItem("i18nextLng", data.currentLanguage);
        localStorage.setItem("language", data.currentLanguage);
      }
      
      // Processar fila offline se houver
      if (this.isOnline) {
        this.processOfflineQueue();
      }
      
      console.log("✅ Serviço de idiomas inicializado:", data);
      return data;
    } catch (error) {
      console.error("Error initializing language service:", error);
      
      // Fallback para configuração do localStorage
      const savedLang = localStorage.getItem("i18nextLng") || "pt";
      i18n.changeLanguage(savedLang);
      
      return {
        languages: ["pt", "en", "es", "ar", "tr"],
        currentLanguage: savedLang,
        source: "localStorage_init"
      };
    }
  }

  /**
   * Migra dados do localStorage para o backend
   */
  async migrateFromLocalStorage() {
    try {
      const featureEnabled = await this.isFeatureEnabled();
      
      if (!featureEnabled) {
        console.log("🔄 Feature não habilitada, pulando migração");
        return { migrated: false, reason: "feature_disabled" };
      }

      // Obter idioma atual do localStorage
      const localLanguage = localStorage.getItem("i18nextLng") || 
                          localStorage.getItem("language") || 
                          "pt";

      // Verificar se o idioma está disponível
      const availableData = await this.getAvailableLanguages();
      
      if (availableData.languages.includes(localLanguage)) {
        // Salvar no backend
        await this.saveLanguagePreference(localLanguage);
        
        console.log(`✅ Idioma migrado: ${localLanguage}`);
        return { 
          migrated: true, 
          language: localLanguage,
          source: "localStorage_migration"
        };
      } else {
        // Idioma não disponível, usar o primeiro disponível
        const defaultLang = availableData.languages[0] || "pt";
        await this.saveLanguagePreference(defaultLang);
        
        console.log(`✅ Migrado para idioma padrão: ${defaultLang}`);
        return { 
          migrated: true, 
          language: defaultLang,
          originalLanguage: localLanguage,
          source: "localStorage_migration_default"
        };
      }
    } catch (error) {
      console.error("Error migrating from localStorage:", error);
      return { 
        migrated: false, 
        error: error.message,
        source: "migration_error"
      };
    }
  }

  /**
   * Método de diagnóstico para debug
   */
  async diagnose() {
    console.group("🔍 Diagnóstico do Serviço de Idiomas");
    
    console.log("Estado da conexão:", this.isOnline ? "Online" : "Offline");
    console.log("Feature habilitada:", await this.isFeatureEnabled());
    console.log("Cache atual:", this.cache);
    console.log("Fila offline:", JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]"));
    console.log("localStorage:", {
      i18nextLng: localStorage.getItem("i18nextLng"),
      language: localStorage.getItem("language"),
      token: localStorage.getItem("token") ? "Presente" : "Ausente"
    });
    console.log("sessionStorage:", {
      featureFlag: sessionStorage.getItem(FEATURE_FLAG_KEY),
      cache: sessionStorage.getItem(CACHE_KEY) ? "Presente" : "Ausente"
    });
    
    console.groupEnd();
  }
}

export default new LanguageService();