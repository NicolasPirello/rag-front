// Configuración de IndexedDB para el chat
const DB_NAME = "chatAppDB";
const DB_VERSION = 2; // Incrementamos la versión para manejar la actualización
const MESSAGES_STORE = "messages";
const CHATS_STORE = "chats";

class ChatDB {
  constructor() {
    this.db = null;
    this.initDB();
  }

  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("Error al abrir BD");
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Almacén para los chats
        if (!db.objectStoreNames.contains(CHATS_STORE)) {
          db.createObjectStore(CHATS_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
        }

        // Almacén para los mensajes con índice para chatId
        if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
          const messagesStore = db.createObjectStore(MESSAGES_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
          // Añadir índice para buscar mensajes por chatId
          messagesStore.createIndex("chatId", "chatId", { unique: false });
        } else if (event.oldVersion < 2) {
          // Si estamos actualizando de la versión 1, añadir el índice al almacén existente
          const transaction = event.target.transaction;
          const messagesStore = transaction.objectStore(MESSAGES_STORE);

          // Verificar si el índice ya existe
          if (!messagesStore.indexNames.contains("chatId")) {
            messagesStore.createIndex("chatId", "chatId", { unique: false });
          }
        }
      };
    });
  }

  // Métodos para chats
  async createChat(title = `Chat_${Date.now()}`) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readwrite");
      const store = transaction.objectStore(CHATS_STORE);
      const chat = {
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const request = store.add(chat);

      request.onsuccess = () => {
        const chatWithId = { ...chat, id: request.result };
        resolve(chatWithId);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllChats() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readonly");
      const store = transaction.objectStore(CHATS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getChat(chatId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readonly");
      const store = transaction.objectStore(CHATS_STORE);
      const request = store.get(chatId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateChat(chat) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readwrite");
      const store = transaction.objectStore(CHATS_STORE);
      const updatedChat = {
        ...chat,
        updatedAt: Date.now(),
      };
      const request = store.put(updatedChat);

      request.onsuccess = () => resolve(updatedChat);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteChat(chatId) {
    await this.ensureDB();
    // Primero eliminamos todos los mensajes asociados al chat
    await this.clearMessagesForChat(chatId);

    // Luego eliminamos el chat
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readwrite");
      const store = transaction.objectStore(CHATS_STORE);
      const request = store.delete(chatId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Métodos para mensajes (actualizados para trabajar con chatId)
  async getMessagesForChat(chatId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([MESSAGES_STORE], "readonly");
      const store = transaction.objectStore(MESSAGES_STORE);
      const index = store.index("chatId");
      const request = index.getAll(chatId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllMessages() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([MESSAGES_STORE], "readonly");
      const store = transaction.objectStore(MESSAGES_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addMessage(message) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([MESSAGES_STORE], "readwrite");
      const store = transaction.objectStore(MESSAGES_STORE);
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().getTime(),
      };
      const request = store.add(messageWithTimestamp);

      request.onsuccess = () => {
        const messageWithId = { ...messageWithTimestamp, id: request.result };
        resolve(messageWithId);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearMessagesForChat(chatId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([MESSAGES_STORE], "readwrite");
      const store = transaction.objectStore(MESSAGES_STORE);
      const index = store.index("chatId");
      const request = index.getAll(chatId);

      request.onsuccess = async (event) => {
        const messages = event.target.result;
        for (const message of messages) {
          await new Promise((resolveDelete, rejectDelete) => {
            const deleteRequest = store.delete(message.id);
            deleteRequest.onsuccess = () => resolveDelete();
            deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
          });
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearMessages() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([MESSAGES_STORE], "readwrite");
      const store = transaction.objectStore(MESSAGES_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.initDB();
    }
  }
}

export const chatDB = new ChatDB();
