// src/features/Chat/stores/messageStore.js
import { create } from "zustand";
import { chatDB } from "../../../core/db/chatDB.js";
import { sendTextMessage, sendAudioMessage, sendImageMessage } from "../../../core/api/api.js";
import { getHardcodedResponse } from "../services/hardcodedResponses.js";
import useChatListStore from "../../ChatHistory/stores/chatListStore.js";
import useSettingsStore from "../../Settings/stores/settingsStore.js";

/**
 * Generates a chat title based on the first message content.
 * @param {object} message - The first message object.
 * @returns {string} The generated chat title.
 */
const generateChatTitle = (message) => {
  if (message.audio) {
    return "Chat de Audio";
  }
  if (message.image) {
    return "Chat de Imagen";
  }
  // For text messages, take the first 3-4 words
  if (message.text) {
    const words = message.text.split(" ").slice(0, 4);
    return words.join(" ") + (words.length > 3 ? "..." : "");
  }
  return "Nuevo Chat"; // Default if no content
};

/**
 * Zustand store for managing chat messages and message-related actions.
 */
const useMessageStore = create((set, get) => ({
  messages: [], // Messages for the currently active chat
  loadingMessages: false, // Tracks loading state for messages of the current chat

  /**
   * Initializes messages for the specified chat ID from the database.
   * If no chatId is provided, it clears the current messages.
   * @param {string | null} chatId - The ID of the chat to load messages for, or null to clear messages.
   * @async
   */
  initializeMessages: async (chatId) => {
    if (!chatId) {
      set({ messages: [], loadingMessages: false });
      // console.log("MessageStore: Cleared messages due to no chatId.");
      return;
    }
    // console.log(`MessageStore: Initializing messages for chat ${chatId}`);
    set({ loadingMessages: true });
    try {
      const chatMessages = await chatDB.getMessagesForChat(chatId);
      set({ messages: chatMessages || [], loadingMessages: false });
      // console.log(`MessageStore: Loaded ${chatMessages?.length || 0} messages for chat ${chatId}`);
    } catch (error) {
      console.error(`MessageStore: Error loading messages for chat ${chatId}:`, error);
      set({ messages: [], loadingMessages: false });
    }
  },

  /**
   * Adds a message to the specified chat and updates the store.
   * If it's the first user message in the chat, it also updates the chat title.
   * @param {object} message - The message object to add.
   * @param {string} message.sender - The sender of the message ("Yo" or "Bot").
   * @param {string} [message.text] - The text content of the message.
   * @param {string} [message.audio] - URL of the audio content.
   * @param {string} [message.image] - URL of the image content.
   * @param {string} chatId - The ID of the chat this message belongs to.
   * @returns {Promise<object|null>} A promise that resolves to the saved message object with its ID, or null on error.
   * @async
   */
  addMessage: async (message, chatId) => {
    if (!chatId) {
      console.error("MessageStore: addMessage called without chatId.");
      return null;
    }
    
    const messageWithChatId = { ...message, chatId };
    try {
      const savedMessage = await chatDB.addMessage(messageWithChatId);
      // console.log("MessageStore: Message saved to DB", savedMessage);

      const chatListState = useChatListStore.getState();
      if (chatListState.currentChat?.id === chatId) {
        set((state) => ({ messages: [...state.messages, savedMessage] }));
      }

      const messagesInDbForChat = await chatDB.getMessagesForChat(chatId);
      if (messagesInDbForChat.length === 1 && message.sender === "Yo") {
        const newTitle = generateChatTitle(savedMessage);
        // console.log(`MessageStore: First user message, updating title for chat ${chatId} to "${newTitle}"`);
        chatListState.updateChatTitle(chatId, newTitle);
      }
      return savedMessage;
    } catch (error) {
      console.error("MessageStore: Error saving message to DB or updating state:", error);
      return null;
    }
  },
  
  /**
   * Sends a user's text message to the backend (or uses hardcoded responses)
   * and adds both the user's message and the bot's response to the store.
   * Triggers TTS for the bot's response if enabled.
   * @param {string} text - The text message from the user.
   * @param {object} currentChat - The current active chat object.
   * @param {string} currentChat.id - The ID of the current active chat.
   * @async
   */
  sendMessage: async (text, currentChat) => {
    if (!text.trim() || !currentChat || !currentChat.id) {
      return;
    }
    const chatId = currentChat.id;
    
    await get().addMessage({ sender: "Yo", text }, chatId);
    set({ loadingMessages: true }); 

    try {
      const settingsState = useSettingsStore.getState();
      let botResponseData;

      if (settingsState.useHardcodedResponses) {
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500)); 
        const responseText = getHardcodedResponse(text);
        botResponseData = { response: responseText, answer: responseText, speakable: true }; 
      } else {
        const apiResult = await sendTextMessage(text);
        botResponseData = { 
          response: apiResult.response || "No se pudo obtener respuesta.", // api.js now standardizes to 'response'
          speakable: apiResult.speakable !== undefined ? apiResult.speakable : true 
        };
      }
      
      await get().addMessage({ sender: "Bot", text: botResponseData.response }, chatId);
      
      if (settingsState.audioResponses && botResponseData.speakable && botResponseData.response) {
        await settingsState.speakText(botResponseData.response);
      }
    } catch (error) {
      console.error("MessageStore: Error sending message or getting bot response:", error);
      await get().addMessage({ sender: "Bot", text: "Error al obtener respuesta." }, chatId);
      if (useSettingsStore.getState().audioResponses) {
        await useSettingsStore.getState().speakText("Error al obtener respuesta.");
      }
    } finally {
      set({ loadingMessages: false });
    }
  },

  /**
   * Sends a user's audio message (and optional transcription) to the backend
   * (or uses hardcoded responses) and adds messages to the store.
   * Triggers TTS for the bot's response if enabled.
   * @param {Blob} audioBlob - The audio data blob.
   * @param {string|null} transcribedText - Optional transcription of the audio.
   * @param {object} currentChat - The current active chat object.
   * @param {string} currentChat.id - The ID of the current active chat.
   * @async
   */
  sendAudioMessage: async (audioBlob, transcribedText, currentChat) => {
    if (!currentChat || !currentChat.id) {
      return;
    }
    const chatId = currentChat.id;

    const audioUrl = URL.createObjectURL(audioBlob);
    await get().addMessage({ sender: "Yo", audio: audioUrl, text: transcribedText || undefined }, chatId);
    set({ loadingMessages: true });

    try {
      const settingsState = useSettingsStore.getState();
      let apiResult;
      if (settingsState.useHardcodedResponses){
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        const responseText = getHardcodedResponse(transcribedText || "audio input");
        apiResult = { response: responseText, speakable: true }; // Standardized to 'response'
      } else if (transcribedText && transcribedText.trim()) {
        apiResult = await sendTextMessage(transcribedText); 
      } else {
        apiResult = await sendAudioMessage(audioBlob); 
      }
      
      const botResponseText = apiResult.response || "No se pudo procesar el audio."; // Standardized to 'response'
      await get().addMessage({ sender: "Bot", text: botResponseText }, chatId);

      if (settingsState.audioResponses && (apiResult.speakable !== false) && botResponseText) {
        await settingsState.speakText(botResponseText);
      }
    } catch (error) {
      console.error("MessageStore: Error sending audio message or getting bot response:", error);
      const errorMsg = "Error al procesar el audio.";
      await get().addMessage({ sender: "Bot", text: errorMsg }, chatId);
      if (useSettingsStore.getState().audioResponses) {
        await useSettingsStore.getState().speakText(errorMsg);
      }
    } finally {
      set({ loadingMessages: false });
    }
  },

  /**
   * Sends a user's image message to the backend (or uses hardcoded responses)
   * and adds messages to the store. Triggers TTS for the bot's response if enabled.
   * @param {File} imageFile - The image file to send.
   * @param {object} currentChat - The current active chat object.
   * @param {string} currentChat.id - The ID of the current active chat.
   * @async
   */
  sendImageMessage: async (imageFile, currentChat) => {
    if (!currentChat || !currentChat.id) {
      return;
    }
    const chatId = currentChat.id;

    const imagePreview = URL.createObjectURL(imageFile);
    await get().addMessage({ sender: "Yo", text: "Imagen enviada:", image: imagePreview }, chatId);
    set({ loadingMessages: true });

    try {
      const settingsState = useSettingsStore.getState();
      let apiResult;

      if (settingsState.useHardcodedResponses) {
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        apiResult = { response: getHardcodedResponse("image input"), speakable: true }; // Standardized
      } else {
        apiResult = await sendImageMessage(imageFile); 
      }
      
      const botResponseText = apiResult.response || "No se pudo procesar la imagen."; // Standardized
      await get().addMessage({ sender: "Bot", text: botResponseText }, chatId);

      if (settingsState.audioResponses && (apiResult.speakable !== false) && botResponseText) {
        await settingsState.speakText(botResponseText);
      }
    } catch (error) {
      console.error("MessageStore: Error sending image message or getting bot response:", error);
      const errorMsg = "Error al procesar la imagen.";
      await get().addMessage({ sender: "Bot", text: errorMsg }, chatId);
      if (useSettingsStore.getState().audioResponses) {
        await useSettingsStore.getState().speakText(errorMsg);
      }
    } finally {
      set({ loadingMessages: false });
    }
  },

  /**
   * Clears all messages for the specified chat ID from the database and updates the store.
   * @param {string} chatId - The ID of the chat to clear messages for.
   * @async
   */
  clearMessages: async (chatId) => {
    if (!chatId) {
      console.warn("MessageStore: clearMessages called without chatId.");
      return;
    }
    // console.log(`MessageStore: Clearing messages for chat ${chatId}`);
    try {
      await chatDB.clearMessagesForChat(chatId);
      const chatListState = useChatListStore.getState();
      if (chatListState.currentChat?.id === chatId) {
        set({ messages: [] });
      }
      // console.log(`MessageStore: Messages cleared for chat ${chatId}`);
    } catch (error) {
      console.error(`MessageStore: Error clearing messages for chat ${chatId}:`, error);
    }
  },
}));

export default useMessageStore;
