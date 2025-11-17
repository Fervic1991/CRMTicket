/**
 * Wrapper seguro para socket.io
 * Previne erros quando socket é null ou undefined
 */

class SafeSocket {
  constructor(socket) {
    this.socket = socket;
    this.listeners = new Map();
  }

  /**
   * Atualiza a instância do socket
   */
  updateSocket(socket) {
    this.socket = socket;
  }

  /**
   * Adiciona um listener de evento de forma segura
   */
  on(event, handler) {
    if (!this.socket) {
      console.warn(`[SafeSocket] Tentativa de adicionar listener '${event}' com socket null`);
      return;
    }

    if (typeof this.socket.on !== 'function') {
      console.warn(`[SafeSocket] socket.on não é uma função`);
      return;
    }

    try {
      this.socket.on(event, handler);
      
      // Armazenar referência para cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(handler);
      
      console.log(`[SafeSocket] ✅ Listener adicionado: ${event}`);
    } catch (error) {
      console.error(`[SafeSocket] Erro ao adicionar listener '${event}':`, error);
    }
  }

  /**
   * Remove um listener de evento de forma segura
   */
  off(event, handler) {
    if (!this.socket) {
      console.warn(`[SafeSocket] Tentativa de remover listener '${event}' com socket null`);
      return;
    }

    if (typeof this.socket.off !== 'function') {
      console.warn(`[SafeSocket] socket.off não é uma função`);
      return;
    }

    try {
      this.socket.off(event, handler);
      
      // Remover da lista de listeners
      if (this.listeners.has(event)) {
        const handlers = this.listeners.get(event);
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
      
      console.log(`[SafeSocket] ✅ Listener removido: ${event}`);
    } catch (error) {
      console.error(`[SafeSocket] Erro ao remover listener '${event}':`, error);
    }
  }

  /**
   * Emite um evento de forma segura
   */
  emit(event, ...args) {
    if (!this.socket) {
      console.warn(`[SafeSocket] Tentativa de emitir '${event}' com socket null`);
      return;
    }

    if (typeof this.socket.emit !== 'function') {
      console.warn(`[SafeSocket] socket.emit não é uma função`);
      return;
    }

    try {
      this.socket.emit(event, ...args);
      console.log(`[SafeSocket] ✅ Evento emitido: ${event}`);
    } catch (error) {
      console.error(`[SafeSocket] Erro ao emitir '${event}':`, error);
    }
  }

  /**
   * Remove todos os listeners
   */
  removeAllListeners() {
    if (!this.socket || typeof this.socket.off !== 'function') {
      this.listeners.clear();
      return;
    }

    for (const [event, handlers] of this.listeners) {
      for (const handler of handlers) {
        try {
          this.socket.off(event, handler);
        } catch (error) {
          console.error(`[SafeSocket] Erro ao remover listener:`, error);
        }
      }
    }
    
    this.listeners.clear();
    console.log(`[SafeSocket] ✅ Todos os listeners removidos`);
  }

  /**
   * Verifica se o socket está conectado
   */
  get connected() {
    return this.socket && this.socket.connected;
  }

  /**
   * Verifica se o socket existe
   */
  get exists() {
    return this.socket != null;
  }
}

/**
 * Cria um wrapper seguro para o socket
 * @param {Object} socket - Instância do socket.io
 * @returns {SafeSocket} - Wrapper seguro
 */
export function createSafeSocket(socket) {
  return new SafeSocket(socket);
}

/**
 * Hook helper para usar com React
 * Retorna um objeto com métodos seguros
 */
export function useSafeSocket(socket) {
  const safeSocket = new SafeSocket(socket);
  
  return {
    on: (event, handler) => safeSocket.on(event, handler),
    off: (event, handler) => safeSocket.off(event, handler),
    emit: (event, ...args) => safeSocket.emit(event, ...args),
    removeAllListeners: () => safeSocket.removeAllListeners(),
    connected: safeSocket.connected,
    exists: safeSocket.exists
  };
}

export default SafeSocket;