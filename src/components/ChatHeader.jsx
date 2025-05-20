import React, { useState } from "react";
import useChatStore from "../store/chatStore";
import useThemeMode from "../hooks/useThemeMode";
import TrashIcon from "./icons/TrashIcon";
import VolumeIcon from "./icons/VolumeIcon";
import ChatSidebar from "./ChatSidebar";
import "./chat-styles.css";

export default function ChatHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { 
    clearMessages, 
    toggleAudioResponses, 
    audioResponses, 
    toggleResponseMode, 
    useHardcodedResponses 
  } = useChatStore();
  const { darkMode, toggleTheme } = useThemeMode();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
            onClick={clearMessages}
            className="clear-button"
            aria-label="Borrar mensajes"
            title="Borrar mensajes"
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
