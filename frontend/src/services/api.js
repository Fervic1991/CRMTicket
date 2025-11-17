import axios from "axios";
import { getBackendUrl } from "../config";

// Obter a URL do backend
const backendUrl = getBackendUrl() || "http://localhost:8080";

console.log("Backend URL configurada:", backendUrl);

const api = axios.create({
	baseURL: backendUrl,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	}
});

export const openApi = axios.create({
	baseURL: backendUrl,
	headers: {
		'Content-Type': 'application/json',
	}
});

// Interceptador de Request - Debug detalhado
api.interceptors.request.use(
	(config) => {
		// Debug detalhado
		console.log("📤 Requisição:", {
			url: `${config.baseURL}${config.url}`,
			method: config.method?.toUpperCase(),
			headers: config.headers,
			data: config.data
		});
		
		// Adicionar token se existir
		const tokenFromStorage = localStorage.getItem("token");
		if (tokenFromStorage) {
			let token = tokenFromStorage;
			
			// Tentar fazer parse se for JSON
			try {
				const parsed = JSON.parse(tokenFromStorage);
				token = parsed;
			} catch {
				// Já é uma string simples, usar como está
			}
			
			// Remover aspas extras se existirem
			token = token.replace(/^["']|["']$/g, '');
			
			config.headers.Authorization = `Bearer ${token}`;
			console.log("🔑 Token adicionado ao header");
		} else if (!config.url?.includes("/auth/login") && !config.url?.includes("/auth/signup")) {
			console.log("⚠️ Nenhum token encontrado no localStorage");
		}
		
		// Adicionar idioma preferido
		const language = localStorage.getItem("i18nextLng") || "pt";
		config.headers["Accept-Language"] = language;
		config.headers["X-User-Language"] = language;
		
		return config;
	},
	(error) => {
		console.error("❌ Erro ao configurar requisição:", error);
		return Promise.reject(error);
	}
);

// Interceptador de Response - Tratamento robusto de erros
api.interceptors.response.use(
	(response) => {
		console.log("📥 Resposta:", {
			url: response.config.url,
			status: response.status,
			data: response.data
		});
		return response;
	},
	(error) => {
		// Diagnóstico detalhado do erro
		if (error.response) {
			// Servidor respondeu com erro (4xx, 5xx)
			console.error("❌ Erro do servidor:", {
				url: error.config?.url,
				status: error.response.status,
				message: error.response.data?.message || error.response.data,
				headers: error.response.headers
			});
			
			// Tratar 401 - não autorizado
			if (error.response.status === 401) {
				console.warn("🔐 Token expirado ou inválido");
				// Só limpar token e redirecionar se não estiver em rotas públicas
				const publicRoutes = ["/login", "/signup", "/forgetpsw", "/"];
				const currentPath = window.location.pathname;
				const isPublicRoute = publicRoutes.some(route => 
					currentPath === route || (route === "/" && currentPath === "/")
				);
				
				// Se estiver em /settings e receber 401, não fazer nada
				// O componente Settings já lida com isso
				if (currentPath.includes("/settings")) {
					console.log("⚠️ Erro 401 em /settings - ignorando redirecionamento");
					return Promise.reject(error);
				}
				
				// Não redirecionar se já estiver em rota pública ou for requisição de auth
				if (!isPublicRoute && 
					!error.config.url?.includes("/auth/") && 
					currentPath !== "/login" &&
					currentPath !== "/signup") {
					// Limpar token inválido
					localStorage.removeItem("token");
					localStorage.removeItem("user");
					localStorage.removeItem("companyId");
					// Redirecionar para login apenas se necessário
					if (currentPath !== "/login") {
						window.location.href = "/login";
					}
				}
			}
			
			// Tratar 403 - Forbidden (pode ser token expirado que precisa refresh)
			// Não tentar refresh se for rota de logout
			if (error.response.status === 403 && !error.config._retry && !error.config.url.includes('/auth/logout')) {
				console.warn("🔄 Tentando refresh do token...");
				error.config._retry = true;
				
				// Tentar refresh
				return api.post("/auth/refresh_token")
					.then(response => {
						if (response.data && response.data.token) {
							// Salvar novo token
							localStorage.setItem("token", JSON.stringify(response.data.token));
							// Atualizar header da requisição original
							error.config.headers.Authorization = `Bearer ${response.data.token}`;
							console.log("✅ Token renovado com sucesso");
							// Retentar requisição original
							return api(error.config);
						}
					})
					.catch(refreshError => {
						console.error("❌ Falha ao renovar token:", refreshError);
						// Se falhar, limpar token e redirecionar
						localStorage.removeItem("token");
						if (window.location.pathname !== "/login") {
							window.location.href = "/login";
						}
						return Promise.reject(refreshError);
					});
			}
		} else if (error.request) {
			// Requisição foi feita mas não houve resposta
			console.error("❌ Network Error - Sem resposta do servidor:", {
				url: error.config?.url,
				method: error.config?.method,
				baseURL: error.config?.baseURL
			});
			
			console.error("🔍 Possíveis causas:");
			console.error("1. Backend não está rodando na porta", backendUrl);
			console.error("2. CORS está bloqueando a requisição");
			console.error("3. Firewall ou proxy bloqueando");
			console.error("4. URL do backend incorreta");
			
			// Adicionar informação ao erro para tratamento no serviço
			error.isNetworkError = true;
		} else {
			// Erro ao configurar a requisição
			console.error("❌ Erro de configuração:", error.message);
		}
		
		return Promise.reject(error);
	}
);

export default api;
