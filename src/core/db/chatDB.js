// Configuración de IndexedDB para el chat
const DB_NAME = "chatAppDB";
const DB_VERSION = 2; 
const MESSAGES_STORE = "messages";
const CHATS_STORE = "chats";

/**
 * @class ChatDB
 * @classdesc Manages all interactions with the IndexedDB database for chat messages and chat lists.
 */
class ChatDB {
  /**
   * @constructor
   * Initializes the database connection.
   */
  constructor() {
    this.db = null;
    this.initDB().catch(err => console.error("Failed to initialize DB on construction:", err));
  }

  /**
   * Opens and initializes the IndexedDB database.
   * Sets up object stores and indexes if they don't exist or on version upgrade.
   * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
   * @private
   */
  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("Error opening IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(CHATS_STORE)) {
          db.createObjectStore(CHATS_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
        }

        if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
          const messagesStore = db.createObjectStore(MESSAGES_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
          messagesStore.createIndex("chatId", "chatId", { unique: false });
        } else if (event.oldVersion < 2) {
          const transaction = event.target.transaction;
          const messagesStore = transaction.objectStore(MESSAGES_STORE);
          if (!messagesStore.indexNames.contains("chatId")) {
            messagesStore.createIndex("chatId", "chatId", { unique: false });
          }
        }
      };
    });
  }

  /**
   * Ensures the database connection is established before performing an operation.
   * @returns {Promise<void>}
   * @async
   * @private
   */
  async ensureDB() {
    if (!this.db) {
      await this.initDB();
    }
  }

  // --- Chat Methods ---

  /**
   * Creates a new chat in the database.
   * @param {string} [title=`Chat_${Date.now()}`] - The title for the new chat.
   * @returns {Promise<object>} A promise that resolves to the newly created chat object with its ID.
   * @async
   */
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
      request.onerror = () => {
        console.error("Error creating chat in DB:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Retrieves all chats from the database.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of chat objects.
   * @async
   */
  async getAllChats() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readonly");
      const store = transaction.objectStore(CHATS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error("Error getting all chats from DB:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Retrieves a specific chat by its ID.
   * @param {string|number} chatId - The ID of the chat to retrieve.
   * @returns {Promise<object|undefined>} A promise that resolves to the chat object, or undefined if not found.
   * @async
   */
  async getChat(chatId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readonly");
      const store = transaction.objectStore(CHATS_STORE);
      const request = store.get(chatId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error(`Error getting chat ${chatId} from DB:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Updates an existing chat in the database.
   * @param {object} chat - The chat object to update. Must include an 'id' property.
   * @returns {Promise<object>} A promise that resolves to the updated chat object.
   * @async
   */
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
      request.onerror = () => {
        console.error(`Error updating chat ${chat.id} in DB:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Deletes a chat and all its associated messages from the database.
   * @param {string|number} chatId - The ID of the chat to delete.
   * @returns {Promise<void>} A promise that resolves when the chat and its messages are deleted.
   * @async
   */
  async deleteChat(chatId) {
    await this.ensureDB();
    await this.clearMessagesForChat(chatId); // Delete associated messages first

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([CHATS_STORE], "readwrite");
      const store = transaction.objectStore(CHATS_STORE);
      const request = store.delete(chatId);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error(`Error deleting chat ${chatId} from DB:`, request.error);
        reject(request.error);
      };
    });
  }

  // --- Message Methods ---

  /**
   * Retrieves all messages for a specific chat ID.
   * @param {string|number} chatId - The ID of the chat to get messages for.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of message objects for the chat.
   * @async
   */
  async getMessagesForChat(chatId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([MESSAGES_STORE], "readonly");
      const store = transaction.objectStore(MESSAGES_STORE);
      const index = store.index("chatId");
      const request = index.getAll(chatId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error(`Error getting messages for chat ${chatId} from DB:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Retrieves all messages from the database (across all chats).
   * @returns {Promise<Array<object>>} A promise that resolves to an array of all message objects.
   * @async
   */
  async getAllMessages() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([MESSAGES_STORE], "readonly");
      const store = transaction.objectStore(MESSAGES_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error("Error getting all messages from DB:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Adds a message to the database.
   * @param {object} message - The message object to add.
   * @param {string|number} message.chatId - The ID of the chat this message belongs to.
   * @param {string} message.sender - The sender of the message (e.g., "Yo", "Bot").
   * @param {string} [message.text] - The text content of the message.
   * @param {string} [message.audio] - URL of the audio content.
   * @param {string} [message.image] - URL of the image content.
   * @returns {Promise<object>} A promise that resolves to the message object with its new ID and timestamp.
   * @async
   */
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
      request.onerror = () => {
        console.error("Error adding message to DB:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clears all messages for a specific chat ID from the database.
   * @param {string|number} chatId - The ID of the chat to clear messages for.
   * @returns {Promise<void>} A promise that resolves when messages are cleared.
   * @async
   */
  async clearMessagesForChat(chatId) {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([MESSAGES_STORE], "readwrite");
      const store = transaction.objectStore(MESSAGES_STORE);
      const index = store.index("chatId");
      // Get all keys for messages in this chat
      const keyRange = IDBKeyRange.only(chatId);
      const request = index.openCursor(keyRange); // Use cursor to delete one by one

      const deletePromises = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          deletePromises.push(new Promise((resolveDelete, rejectDelete) => {
            const deleteRequest = store.delete(cursor.primaryKey);
            deleteRequest.onsuccess = () => resolveDelete();
            deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
          }));
          cursor.continue();
        } else {
          // All messages for the chat ID have been processed
          Promise.all(deletePromises).then(resolve).catch(reject);
        }
      };
      request.onerror = () => {
        console.error(`Error clearing messages for chat ${chatId} from DB:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clears all messages from the messages store (across all chats).
   * @returns {Promise<void>} A promise that resolves when all messages are cleared.
   * @async
   */
  async clearMessages() {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([MESSAGES_STORE], "readwrite");
      const store = transaction.objectStore(MESSAGES_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error("Error clearing all messages from DB:", request.error);
        reject(request.error);
      };
    });
  }
}

/**
 * @type {ChatDB}
 * @description Singleton instance of the ChatDB class.
 */
export const chatDB = new ChatDB();
