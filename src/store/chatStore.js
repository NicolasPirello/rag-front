// Chat store utilizando Zustand
import { create } from "zustand";
import {
  sendTextMessage,
  sendAudioMessage,
  sendImageMessage,
  transformAudioText
} from "../services/api.js";
import { chatDB } from "../services/db/chatDB.js";
import { getHardcodedResponse } from "../services/hardcodedResponses.js";

// Función auxiliar para generar el título del chat
const generateChatTitle = (message) => {
  if (message.audio) {
    return "Chat ingreso de audio...";
  }
  if (message.image) {
    return "Chat ingreso de imagen...";
  }
  // Para mensajes de texto, tomar las primeras 3-4 palabras
  const words = message.text.split(" ").slice(0, 4);
  return words.join(" ") + "...";
};

const useChatStore = create((set, get) => ({
  // Estado
  messages: [],
  chats: [],
  currentChat: null,
  loadingChats: {}, // Nuevo estado para trackear loading por chat
  darkMode: false,
  recording: false,
  audioResponses: false,
  activeConversationChatId: null, // Nuevo estado para tracking del chat activo
  ttsEngine: 'api', // Opciones: 'browser', 'lemonfox', 'api'
  useHardcodedResponses: false, // Opciones: true para respuestas hardcodeadas, false para la API real
  isPlayingAudio: false, // Estado para rastrear cuando se está reproduciendo audio

  // Inicialización: cargar chats y mensajes desde IndexedDB
  initialize: async () => {
    try {
      const savedChats = await chatDB.getAllChats();

      // Si no hay chats, crear uno por defecto
      if (!savedChats || savedChats.length === 0) {
        const defaultChat = await chatDB.createChat("Chat con SofIA");
        set({
          chats: [defaultChat],
          currentChat: defaultChat,
          messages: [],
        });
        return;
      }

      // Si hay chats, usar el primero como activo
      set({ chats: savedChats });
      const firstChat = savedChats[0];
      const chatMessages = await chatDB.getMessagesForChat(firstChat.id);
      set({
        currentChat: firstChat,
        messages: chatMessages || [],
      });
    } catch (error) {
      console.error("Error al cargar datos desde IndexedDB:", error);
    }
  },

  // Gestión de chats
  createChat: async (title) => {
    try {
      const newChat = await chatDB.createChat(title);
      set((state) => ({
        chats: [...state.chats, newChat],
        currentChat: newChat,
        messages: [],
      }));
      return newChat;
    } catch (error) {
      console.error("Error al crear chat:", error);
    }
  },

  switchChat: async (chatId) => {
    try {
      const chat = await chatDB.getChat(chatId);
      if (chat) {
        const chatMessages = await chatDB.getMessagesForChat(chatId);
        set({
          currentChat: chat,
          messages: chatMessages || [],
        });
      }
    } catch (error) {
      console.error("Error al cambiar de chat:", error);
    }
  },

  deleteChat: async (chatId) => {
    try {
      await chatDB.deleteChat(chatId);
      set((state) => {
        const updatedChats = state.chats.filter((chat) => chat.id !== chatId);
        const newState = { chats: updatedChats };

        // Si el chat eliminado era el actual o no quedan chats, crear uno nuevo
        if (state.currentChat?.id === chatId || updatedChats.length === 0) {
          // Si no quedan chats, crear uno por defecto
          if (updatedChats.length === 0) {
            chatDB.createChat("Chat con SofIA").then((defaultChat) => {
              set({
                chats: [defaultChat],
                currentChat: defaultChat,
                messages: [],
              });
            });
          } else {
            // Si quedan chats, seleccionar el primero
            newState.currentChat = updatedChats[0];
            newState.messages = [];
          }
        }

        return newState;
      });
    } catch (error) {
      console.error("Error al eliminar chat:", error);
    }
  },

  deleteAllChats: async () => {
    try {
      // Obtener todos los chats actuales
      const currentChats = await chatDB.getAllChats();

      // Eliminar todos los chats uno por uno para asegurar que se eliminen sus mensajes
      for (const chat of currentChats) {
        await chatDB.deleteChat(chat.id);
      }

      // Crear un nuevo chat por defecto
      const defaultChat = await chatDB.createChat("Chat con SofIA");

      // Actualizar el estado
      set({
        chats: [defaultChat],
        currentChat: defaultChat,
        messages: [],
      });
    } catch (error) {
      console.error("Error al eliminar todos los chats:", error);
    }
  },

  // Actualizar título del chat
  updateChatTitle: async (title) => {
    const currentChat = get().currentChat;
    if (!currentChat) return;

    const updatedChat = { ...currentChat, title };
    try {
      const savedChat = await chatDB.updateChat(updatedChat);
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === savedChat.id ? savedChat : chat
        ),
        currentChat: savedChat,
      }));
    } catch (error) {
      console.error("Error al actualizar título del chat:", error);
    }
  },

  // Acciones
  setDarkMode: (isDark) => set({ darkMode: isDark }),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  setRecording: (isRecording) => set({ recording: isRecording }),

  toggleAudioResponses: () => {
    set((state) => ({ audioResponses: !state.audioResponses }));
  },

  // Función para convertir texto a voz
  speakText: async (text) => {
    if (!text) return;

    const currentEngine = get().ttsEngine;
    const audioResponsesEnabled = get().audioResponses;

    if (!audioResponsesEnabled) return;

    try {
      // Indicar que se está reproduciendo audio
      set({ isPlayingAudio: true });
      
      if (currentEngine === 'api') {
        // Usar el servicio de transformación de texto a audio
        const audioBlob = await transformAudioText(text);

        // Crear una URL para el blob de audio
        const audioUrl = URL.createObjectURL(audioBlob);

        // Crear y reproducir el elemento de audio
        const audio = new Audio(audioUrl);
        // Reproducir el audio
        await audio.play();
        
        // Devolver una promesa que se resuelva cuando el audio termine
        return new Promise((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            set({ isPlayingAudio: false });
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            set({ isPlayingAudio: false });
            resolve();
          };
        });
      } 
      else if (currentEngine === 'lemonfox') {
        // Lógica para LemonFox TTS
        const { speakWithLemonFox } = await import('../services/lemonFoxTTS.js');
        await speakWithLemonFox(text);
      } 
      else { // 'browser' o cualquier otro valor
        // Intenta usar el bridge nativo primero
        if (window.Android && window.Android.speak) {
          window.Android.speak(text);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Espera estimada
          set({ isPlayingAudio: false });
          return;
        }

        // Si no hay bridge nativo, usa la Web Speech API como fallback
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel(); // Detener cualquier habla anterior
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "es-ES"; // Puedes ajustar el idioma
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          return new Promise((resolve) => {
            utterance.onend = () => {
              set({ isPlayingAudio: false });
              resolve();
            };
            utterance.onerror = () => {
              set({ isPlayingAudio: false });
              resolve();
            };
            window.speechSynthesis.speak(utterance);
          });
        } else {
          console.error("No hay sistema de síntesis de voz (navegador) disponible");
          set({ isPlayingAudio: false });
        }
      }
    } catch (error) {
      console.error("Error in speakText:", error);
      
      // Fallback a Web Speech API si los otros métodos fallan
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "es-ES";
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          window.speechSynthesis.speak(utterance);
        } catch (fallbackError) {
          console.error("Error en fallback de síntesis de voz:", fallbackError);
        } finally {
          set({ isPlayingAudio: false });
        }
      } else {
        set({ isPlayingAudio: false });
      }
    } finally {
      // En caso de que no se haya resuelto correctamente en algún otro lugar
      setTimeout(() => {
        set({ isPlayingAudio: false });
      }, 10000); // Timeout de seguridad después de 10 segundos
    }
  },

  // Función auxiliar para agregar mensajes
  addMessageToStore: async (message) => {
    const state = get();
    const chatId = state.activeConversationChatId || state.currentChat?.id;
    if (!chatId) return;

    const messageWithChatId = {
      ...message,
      chatId: chatId,
    };

    try {
      const savedMessage = await chatDB.addMessage(messageWithChatId);

      // Si el chat del mensaje es el actual, actualizar mensajes en pantalla
      if (chatId === state.currentChat?.id) {
        const newMessages = [...state.messages, savedMessage];
        set({ messages: newMessages });

        // Si es el primer mensaje del usuario, actualizar el título del chat
        if (newMessages.length === 1 && message.sender === "Yo") {
          const newTitle = generateChatTitle(message);
          await get().updateChatTitle(newTitle);
        }
      }
    } catch (error) {
      console.error("Error al guardar mensaje en IndexedDB:", error);
      if (chatId === state.currentChat?.id) {
        set((state) => ({
          messages: [...state.messages, messageWithChatId],
        }));
      }
    }
  },

  // Función auxiliar para manejar el loading de chats específicos
  setLoadingForChat: (chatId, isLoading) => {
    set((state) => ({
      loadingChats: {
        ...state.loadingChats,
        [chatId]: isLoading,
      },
    }));
  },

  // Enviar mensaje de texto
  sendMessage: async (text) => {
    if (!text.trim()) return;

    const currentChatId = get().currentChat?.id;
    set({ activeConversationChatId: currentChatId });

    // Añadir mensaje del usuario al chat
    const newMessage = { sender: "Yo", text };
    await get().addMessageToStore(newMessage);
    get().setLoadingForChat(currentChatId, true);

    try {
      let botResponse;
      
      // Decidir si usar respuestas hardcodeadas o la API
      if (get().useHardcodedResponses) {
        // Simular retraso para que parezca que está procesando
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        // Obtener respuesta hardcodeada
        const responseText = getHardcodedResponse(text);
        botResponse = { response: responseText, speakable: true };
      } else {
        // Llamar al servicio API como antes
        botResponse = await sendTextMessage(text);
      }

      // Añadir respuesta del bot al chat
      const botMessage = { sender: "Bot", text: botResponse.response };
      await get().addMessageToStore(botMessage);
      
      // Marcar como no cargando antes de reproducir el audio
      get().setLoadingForChat(currentChatId, false);
      set({ activeConversationChatId: null });

      // Reproducir audio si está habilitado
      const store = get();
      if (store.audioResponses && botResponse.speakable) {
        await store.speakText(botResponse.response);
      }
    } catch (error) {
      console.error("Error en sendMessage:", error);
      const errorMessage = "Error al obtener respuesta";
      const errorBotMessage = { sender: "Bot", text: errorMessage };
      await get().addMessageToStore(errorBotMessage);

      get().setLoadingForChat(currentChatId, false);
      set({ activeConversationChatId: null });

      const store = get();
      if (store.audioResponses) {
        await store.speakText(errorMessage);
      }
    }
  },

  // Enviar mensaje de audio
  sendAudioMessage: async (audioBlob, transcribedText = null) => {
    const currentChatId = get().currentChat?.id;
    set({ activeConversationChatId: currentChatId });

    const audioUrl = URL.createObjectURL(audioBlob);
    const userMessage = {
      sender: "Yo",
      audio: audioUrl,
      text: transcribedText || undefined,
    };
    await get().addMessageToStore(userMessage);
    get().setLoadingForChat(currentChatId, true);

    try {
      let response;
      if (transcribedText && transcribedText.trim()) {
        response = await sendTextMessage(transcribedText);
      } else {
        response = await sendAudioMessage(audioBlob);
      }

      const botResponse = response.response || response.respuesta;
      const botMessage = { sender: "Bot", text: botResponse };
      await get().addMessageToStore(botMessage);

      // Desactivar indicador de carga antes de reproducir el audio
      get().setLoadingForChat(currentChatId, false);
      set({ activeConversationChatId: null });

      const store = get();
      if (store.audioResponses && botResponse) {
        await store.speakText(botResponse);
      }
    } catch (error) {
      console.error("Error en sendAudioMessage:", error);
      const errorMessage = "Error al procesar audio";
      const errorBotMessage = { sender: "Bot", text: errorMessage };
      await get().addMessageToStore(errorBotMessage);

      get().setLoadingForChat(currentChatId, false);
      set({ activeConversationChatId: null });

      const store = get();
      if (store.audioResponses) {
        await store.speakText(errorMessage);
      }
    }
  },

  // Enviar mensaje con imagen
  sendImageMessage: async (imageFile) => {
    const currentChatId = get().currentChat?.id;
    set({ activeConversationChatId: currentChatId });

    const imagePreview = URL.createObjectURL(imageFile);
    const userMessage = {
      sender: "Yo",
      text: "Imagen enviada:",
      image: imagePreview,
    };
    await get().addMessageToStore(userMessage);
    get().setLoadingForChat(currentChatId, true);

    try {
      const response = await sendImageMessage(imageFile);
      const botMessage = { sender: "Bot", text: response.respuesta };
      await get().addMessageToStore(botMessage);

      // Desactivar indicador de carga antes de reproducir el audio
      get().setLoadingForChat(currentChatId, false);
      set({ activeConversationChatId: null });

      const store = get();
      if (store.audioResponses) {
        await store.speakText(response.respuesta);
      }
    } catch (error) {
      console.error("Error en sendImageMessage:", error);
      const errorMessage = "Error al procesar la imagen";
      const errorBotMessage = { sender: "Bot", text: errorMessage };
      await get().addMessageToStore(errorBotMessage);

      get().setLoadingForChat(currentChatId, false);
      set({ activeConversationChatId: null });

      const store = get();
      if (store.audioResponses) {
        await store.speakText(errorMessage);
      }
    }
  },

  // Limpiar mensajes del chat actual
  clearMessages: async () => {
    const currentChat = get().currentChat;
    if (!currentChat) return;

    try {
      await chatDB.clearMessagesForChat(currentChat.id);
      set({ messages: [] });
    } catch (error) {
      console.error("Error al limpiar mensajes de IndexedDB:", error);
      set({ messages: [] });
    }
  },

  // Método para cambiar el motor TTS
  setTTSEngine: (engine) => {
    set({ ttsEngine: engine });
    console.log(`Motor TTS cambiado a: ${engine}`);
  },

  // Método para alternar entre respuestas hardcodeadas y API
  toggleResponseMode: () => {
    set((state) => ({ useHardcodedResponses: !state.useHardcodedResponses }));
    const newMode = !get().useHardcodedResponses;
    console.log(`Modo de respuestas cambiado a: ${newMode ? 'hardcodeadas' : 'API real'}`);
  },
}));

export default useChatStore;
