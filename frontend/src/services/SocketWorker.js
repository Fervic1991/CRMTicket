import io from "socket.io-client";

class SocketWorker {
  constructor(companyId, userId, token) {
    if (!SocketWorker.instance) {
      this.companyId = companyId;
      this.userId = userId;
      this.token = token;
      this.socket = null;
      this.eventListeners = {}; // memorizza i callback per ogni evento
      this.connect();
      SocketWorker.instance = this;
    }
    return SocketWorker.instance;
  }

  connect() {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(`${process.env.REACT_APP_BACKEND_URL}/${this.companyId}`, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5, // Limita i tentativi
        reconnectionDelayMax: 5000,
        transports: ["websocket"],
        query: {
          userId: this.userId,
          token: this.token
        }
      });

      this.socket.on("connect", () => {
        console.log(`Connesso al namespace /${this.companyId}`);
        // Ricollega tutti i listener già registrati SOLO UNA VOLTA
        Object.keys(this.eventListeners).forEach(event => {
          this.eventListeners[event].forEach(cb => {
            // Rimuovi prima eventuali duplicati
            this.socket.off(event, cb);
            // Poi aggiungi il listener
            this.socket.on(event, cb);
          });
        });
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnesso dal server Socket.IO, tentativo di riconnessione...");
      });
    }
  }

  on(event, callback) {
    this.connect();
    
    // Controlla se il callback è già registrato
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    
    // Aggiungi il callback solo se non esiste già
    if (!this.eventListeners[event].includes(callback)) {
      this.eventListeners[event].push(callback);
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (!this.socket) return;
    if (this.eventListeners[event]) {
      if (callback) {
        this.socket.off(event, callback);
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
      } else {
        this.eventListeners[event].forEach(cb => this.socket.off(event, cb));
        delete this.eventListeners[event];
      }
    }
  }

emit(event, data) {
  if (this.socket && this.socket.connected) {
    this.socket.emit(event, data);
  } else {
    this.connect();
    // Retry dopo un breve delay CON LIMITE
    let retries = 0;
    const maxRetries = 3;
    
    const retryEmit = () => {
      if (this.socket && this.socket.connected) {
        this.socket.emit(event, data);
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(retryEmit, 100 * retries);
      }
    };
    
    retryEmit();
  }
}

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      SocketWorker.instance = null;
      console.log("Socket disconnesso manualmente");
    }
  }

  forceReconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    } else {
      this.connect();
    }
  }
}

// Factory per ottenere sempre la stessa istanza
const instance = (companyId, userId, token) => new SocketWorker(companyId, userId, token);

export default instance;