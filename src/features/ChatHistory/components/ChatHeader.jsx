import React, { useState } from "react";
import useChatListStore from "../stores/chatListStore";
import useMessageStore from "../../../features/Chat/stores/messageStore";
import useSettingsStore from "../../../features/Settings/stores/settingsStore";
import useThemeMode from "../../../features/Settings/hooks/useThemeMode"; 

import TrashIcon from "../../../shared/icons/TrashIcon";
import VolumeIcon from "../../../shared/icons/VolumeIcon";
import ChatSidebar from "./ChatSidebar";
import "../../../features/Chat/components/chat-styles.css"; 
import "./ChatHeader.css"; 

/**
 * @file ChatHeader.jsx
 * @description Header component for the chat application. It displays the application logo,
 * provides buttons for various actions like toggling audio responses, clearing messages,
 * changing themes, and opening the chat sidebar.
 * 
 * This component does not receive direct props for its core functionality but uses
 * various Zustand stores and custom hooks to manage its state and actions.
 */
export default function ChatHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentChat = useChatListStore((state) => state.currentChat);
  const clearMessages = useMessageStore((state) => state.clearMessages);
  
  const { 
    audioResponses, 
    toggleAudioResponses, 
    useHardcodedResponses, 
    toggleResponseMode 
  } = useSettingsStore((state) => ({
    audioResponses: state.audioResponses,
    toggleAudioResponses: state.toggleAudioResponses,
    useHardcodedResponses: state.useHardcodedResponses,
    toggleResponseMode: state.toggleResponseMode,
  }));

  const { darkMode, toggleTheme } = useThemeMode(); 

  /**
   * Toggles the visibility of the chat sidebar.
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  /**
   * Handles clearing messages for the current active chat.
   * If no chat is active, it does nothing.
   */
  const handleClearMessages = () => {
    if (currentChat) {
      clearMessages(currentChat.id); 
    } else {
      console.warn("ChatHeader: No current chat to clear messages from.");
    }
  };

  return (
    <>
      <header className="chat-header">
        <button
          onClick={toggleSidebar}
          className="menu-button"
          aria-label="Menú"
          title="Abrir menú"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12H21M3 6H21M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="header-logo">
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="16" width="48" height="32" rx="8" fill="#2E8CCB"/>
            <ellipse cx="20" cy="32" rx="4" ry="4" fill="white"/>
            <ellipse cx="32" cy="32" rx="4" ry="4" fill="white"/>
            <ellipse cx="44" cy="32" rx="4" ry="4" fill="white"/>
            <path d="M16 48L8 56V16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V40C56 44.4183 52.4183 48 48 48H16Z" fill="#2E8CCB"/>
          </svg>
          <span className="header-logo-text">Rag IA</span>
        </div>
        <div className="header-buttons">
          <button
            onClick={toggleAudioResponses}
            className={`action-button ${audioResponses ? "active" : ""}`}
            aria-label={
              audioResponses
                ? "Desactivar respuestas de voz"
                : "Activar respuestas de voz"
            }
            title={
              audioResponses
                ? "Desactivar respuestas de voz"
                : "Activar respuestas de voz"
            }
          >
            <VolumeIcon />
          </button>
          <button
            onClick={toggleResponseMode}
            className={`action-button-hardcoded ${useHardcodedResponses ? "active" : ""}`}
            aria-label={
              useHardcodedResponses
                ? "Usar respuestas de API"
                : "Usar respuestas predefinidas"
            }
            title={
              useHardcodedResponses
                ? "Usar respuestas de API"
                : "Usar respuestas predefinidas"
            }
          >
            {useHardcodedResponses ? "🤖" : "🔌"}
          </button>
          <button
            onClick={handleClearMessages} 
            className="clear-button"
            aria-label="Borrar mensajes del chat actual"
            title="Borrar mensajes del chat actual"
            disabled={!currentChat} 
          >
            <TrashIcon />
          </button>
          <button
            onClick={toggleTheme} 
            className="theme-toggle"
            aria-label="Cambiar tema"
            title="Cambiar tema"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>
      
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}>
          <div
            className="floating-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <ChatSidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
