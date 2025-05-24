// src/features/ChatHistory/stores/chatListStore.js
import { create } from "zustand";
import { chatDB } from "../../../core/db/chatDB.js";

/**
 * Zustand store for managing the list of chats, the current active chat,
 * and actions related to chat list management.
 */
const useChatListStore = create((set, get) => ({
  chats: [], // Array of chat objects
  currentChat: null, // The currently active chat object

  /**
   * Initializes the chat list from the database.
   * If no chats exist, creates a default chat.
   * Sets the first chat in the list as the current chat.
   * @async
   */
  initializeChats: async () => {
    try {
      const savedChats = await chatDB.getAllChats();
      if (!savedChats || savedChats.length === 0) {
        await get().createChat("Default Chat"); 
      } else {
        set({ chats: savedChats, currentChat: savedChats[0] });
      }
    } catch (error) {
      console.error("Error initializing chats:", error);
      if (get().chats.length === 0) {
         await get().createChat("Error Recovery Chat");
      }
    }
  },

  /**
   * Creates a new chat with the given title, adds it to the database and store,
   * and sets it as the current active chat.
   * @param {string} title - The title for the new chat.
   * @returns {Promise<object|null>} A promise that resolves to the newly created chat object, or null on error.
   * @async
   */
  createChat: async (title) => {
    try {
      const newChat = await chatDB.createChat(title);
      set((state) => ({
        chats: [...state.chats, newChat],
        currentChat: newChat,
      }));
      return newChat;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null; 
    }
  },

  /**
   * Switches the current active chat to the one with the specified ID.
   * If the chat is not found, it attempts to switch to the first available chat
   * or creates a fallback chat if none exist.
   * @param {string} chatId - The ID of the chat to switch to.
   * @async
   */
  switchChat: async (chatId) => {
    try {
      if (get().currentChat?.id === chatId) {
        return;
      }
      const chat = await chatDB.getChat(chatId);
      if (chat) {
        set({ currentChat: chat });
      } else {
        console.warn(`Chat with id ${chatId} not found.`);
        const currentChats = get().chats;
        if (currentChats.length > 0) {
            set({ currentChat: currentChats[0] });
        } else {
            await get().createChat("Fallback Chat");
        }
      }
    } catch (error) {
      console.error("Error switching chat:", error);
    }
  },
  
  /**
   * Updates the title of a specified chat.
   * @param {string} chatId - The ID of the chat to update.
   * @param {string} newTitle - The new title for the chat.
   * @async
   */
  updateChatTitle: async (chatId, newTitle) => {
    const currentChats = get().chats;
    const chatToUpdate = currentChats.find(chat => chat.id === chatId);

    if (!chatToUpdate) {
        console.error(`Chat with id ${chatId} not found for title update.`);
        return;
    }

    const updatedChatData = { ...chatToUpdate, title: newTitle };
    try {
      const savedChat = await chatDB.updateChat(updatedChatData);
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === savedChat.id ? savedChat : chat
        ),
        currentChat: state.currentChat?.id === savedChat.id ? savedChat : state.currentChat,
      }));
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  },

  /**
   * Deletes a chat with the specified ID from the database and store.
   * If the deleted chat was the current one, it updates the current chat.
   * If no chats remain, a default chat is created.
   * @param {string} chatId - The ID of the chat to delete.
   * @async
   */
  deleteChat: async (chatId) => {
    try {
      await chatDB.deleteChat(chatId); 
      
      const state = get();
      const updatedChats = state.chats.filter((chat) => chat.id !== chatId);
      let newCurrentChat = state.currentChat;

      if (state.currentChat?.id === chatId) { 
        if (updatedChats.length > 0) {
          newCurrentChat = updatedChats[0]; 
        } else {
          newCurrentChat = null; 
        }
      }
      
      set({ chats: updatedChats, currentChat: newCurrentChat });

      if (!get().currentChat && get().chats.length === 0) {
         await get().createChat("Default Chat After Deletion");
      }

    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  },

  /**
   * Deletes all chats from the database and store.
   * After deletion, a new default chat is created.
   * @async
   */
  deleteAllChats: async () => {
    try {
      const currentChats = get().chats; 
      for (const chat of currentChats) {
        await chatDB.deleteChat(chat.id); 
      }
      await get().createChat("Default Chat After All Deleted");
    } catch (error)      console.error("Error deleting all chats:", error);
    }
  },
}));

export default useChatListStore;
