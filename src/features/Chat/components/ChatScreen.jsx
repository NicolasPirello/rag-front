import React, { useRef, useEffect } from "react";
import useChatListStore from "../../../features/ChatHistory/stores/chatListStore";
import useMessageStore from "../stores/messageStore";
import useSettingsStore from "../../../features/Settings/stores/settingsStore";
import useAudioRecorder from "../hooks/useAudioRecorder";

// import ChatHeader from "../../../features/ChatHistory/components/ChatHeader"; // No longer directly rendered here
import InitialScreen from './InitialScreen';
import MessageList from './MessageList'; 
import MessageInput from './MessageInput'; 
import "./chat-styles.css";

/**
 * @file ChatScreen.jsx
 * @description Main component for the chat interface. It orchestrates message display,
 * user input, and integrates with various stores for state management.
 * It handles the presentation of either an initial welcome screen or the active chat view.
 */
export default function ChatScreen() {
  // const chatBoxRef = useRef(null); // This ref is now internal to MessageList
  const inputRef = useRef(null);   // Ref for the text input field, passed to MessageInput

  // Get state and actions from stores
  const currentChat = useChatListStore((state) => state.currentChat);
  const { messages, loadingMessages, initializeMessages, sendMessage } = useMessageStore((state) => ({
    messages: state.messages,
    loadingMessages: state.loadingMessages,
    initializeMessages: state.initializeMessages,
    sendMessage: state.sendMessage,
    // sendAudioMessage and sendImageMessage are used by useAudioRecorder and potentially MessageInput directly
  }));
  
  const { recording, isPlayingAudio } = useSettingsStore((state) => ({
    recording: state.recording,
    isPlayingAudio: state.isPlayingAudio,
  }));

  const { toggleRecording } = useAudioRecorder(currentChat); 

  // Effect to initialize messages when currentChat changes
  useEffect(() => {
    if (currentChat) {
      initializeMessages(currentChat.id);
    } else {
      initializeMessages(null); // Clear messages if no chat is selected
    }
  }, [currentChat, initializeMessages]);

  // Focus management for MessageInput
  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleFocusEvent = () => focusInput();
    window.addEventListener("focusOnChatInput", handleFocusEvent);
    // Initial focus when a chat is selected and not showing initial screen, and input is available
    if (currentChat && messages.length > 0 && inputRef.current) {
        focusInput();
    }
    return () =>
      window.removeEventListener("focusOnChatInput", handleFocusEvent);
  }, [currentChat, messages]);


  if (!currentChat) {
    return (
      <main className="empty-state">
        <div className="no-chat-selected-message">
          <h2>Bienvenido a RAG IA Creado por Nicolás Pirello</h2>
          <p>Selecciona un chat o crea uno nuevo para empezar.</p>
        </div>
      </main>
    );
  }

  const showInitialScreen = messages.length === 0 && !loadingMessages;

  return (
    <>
      {/* ChatHeader is rendered by the App layout, not directly by ChatScreen */}
      <main className={showInitialScreen ? 'main-initial' : 'main-chat'}>
        {showInitialScreen ? (
          <InitialScreen />
        ) : (
          <MessageList 
            messages={messages} 
            isLoadingMessages={loadingMessages} 
            isPlayingAudio={isPlayingAudio}
          />
        )}
        
        <MessageInput
          currentChat={currentChat}
          onSendMessage={sendMessage} 
          isLoading={loadingMessages}
          isPlayingAudio={isPlayingAudio}
          toggleRecording={toggleRecording}
          isRecording={recording}
          showInitialScreen={showInitialScreen}
          inputRef={inputRef} 
        />
      </main>
    </>
  );
}

/**
 * Dispatches a global custom event to focus on the chat input field.
 * This can be called from other components (e.g., ChatSidebar after creating a new chat).
 */
export const focusOnInput = () => {
  window.dispatchEvent(new CustomEvent("focusOnChatInput"));
};
