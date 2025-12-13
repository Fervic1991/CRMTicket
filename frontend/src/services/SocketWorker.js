import io from "socket.io-client";

class SocketWorker {
  constructor(companyId, userId, token) {
    if (!SocketWorker.instance) {
      this.companyId = companyId;
      this.userId = userId;
      this.token = token;
      this.socket = null;
      this.eventListeners = {};
      this.isConnecting = false; // Previene connessioni multiple
      this.setupSocket();
      SocketWorker.instance = this;
    }
    return SocketWorker.instance;
  }

  setupSocket() {
    if (this.socket) return; // Se esiste già, non creare uno nuovo
    
    this.socket = io(`${process.env.REACT_APP_BACKEND_URL}/${this.companyId}`, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
      transports: ["websocket"],
      query: {
        userId: this.userId,
        token: this.token
      }
    });

    this.socket.on("connect", () => {
      console.log(`Connesso al namespace /${this.companyId}`);
      // Ricollega tutti i listener
      Object.keys(this.eventListeners).forEach(event => {
        this.eventListeners[event].forEach(cb => {
          this.socket.off(event, cb);
          this.socket.on(event, cb);
        });
      });
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnesso dal server Socket.IO");
    });
  }

  on(event, callback) {
    // NON CHIAMARE connect() qui!
    if (!this.socket) {
      this.setupSocket();
    }
    
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    
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
    } else if (this.socket) {
      // Socket esiste ma non connesso, aspetta la connessione
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
    }
  }
}

const instance = (companyId, userId, token) => new SocketWorker(companyId, userId, token);

export default instance;