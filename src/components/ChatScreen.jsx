import React, { useRef, useState, useEffect } from "react";
import useChatStore from "../store/chatStore";
import useAudioRecorder from "../hooks/useAudioRecorder";
import SendIcon from "./icons/SendIcon";
import MicIcon from "./icons/MicIcon";
import ImageIcon from "./icons/ImageIcon";
import ChatHeader from "./ChatHeader";
import InitialScreen from './InitialScreen';
import "./chat-styles.css";

const API_URL = import.meta.env.VITE_API_URL || "https://apirag.nicolaspirello.com";
const API_KEY = import.meta.env.VITE_API_KEY || "";

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  const { messages, recording, addMessageToStore, currentChat, loadingChats, isPlayingAudio, sendImageMessage } = useChatStore();
  const isLoading = currentChat ? loadingChats[currentChat.id] : false;
  const { toggleRecording } = useAudioRecorder();

  // Función para hacer focus en el input
  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Función para hacer scroll al fondo
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const handleFocusEvent = () => focusInput();
    window.addEventListener("focusOnChatInput", handleFocusEvent);
    return () =>
      window.removeEventListener("focusOnChatInput", handleFocusEvent);
  }, []);

  useEffect(() => {
    if (messages.length > 0 && chatBoxRef.current) {
      scrollToBottom();
    }
  }, [messages, currentChat?.id]);

  useEffect(() => {
    if (messages.length > 0 && isLoading && chatBoxRef.current) {
        scrollToBottom();
    }
  }, [isLoading]);

  const handleSendMessage = async () => {
    if (message.trim() && currentChat) {
      // Mensaje del usuario
      await addMessageToStore({ sender: "Yo", text: message });
      setMessage("");
      // Mensaje del bot (respuesta de la API)
      try {
        const response = await fetch(`${API_URL}/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-app-auth": API_KEY,
          },
          body: JSON.stringify({ query: message }),
        });
        const data = await response.json();
        const botMessage = {
          sender: "Bot",
          text: data?.answer || "Sin respuesta.",
        };
        await addMessageToStore(botMessage);
      } catch (error) {
        await addMessageToStore({ sender: "Bot", text: "Error al contactar con la API." });
        console.error("Error:", error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && currentChat) {
      sendImageMessage(file);
      e.target.value = "";
    }
  };

  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    setMessage(textarea.value);
  };

  if (!currentChat) {
    return (
      <>
        <ChatHeader />
        <main className="empty-state">
          <div className="no-chat-selected-message">
            <h2>Bienvenido a RAG IA Creado por Nicolás Pirello</h2>
            <p>Selecciona un chat o crea uno nuevo para empezar.</p>
          </div>
        </main>
      </>
    );
  }

  const showInitialScreen = messages.length === 0;

  return (
    <>
      <ChatHeader />
      
      <main className={showInitialScreen ? 'main-initial' : 'main-chat'}>
        {showInitialScreen ? (
          <InitialScreen />
        ) : (
          <div className="chat-messages" ref={chatBoxRef}>
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`message ${
                  msg.sender === "Yo" ? "user-message" : "bot-message"
                } ${msg.audio ? "audio-message" : ""}`}
              >
                <div className="message-content">
                  {!msg.audio && msg.text}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Imagen enviada"
                      className="message-image"
                    />
                  )}
                  {msg.audio && (
                    <audio
                      controls
                      src={msg.audio}
                      className="message-audio"
                      preload="metadata"
                    >
                      Tu navegador no soporta el elemento de audio.
                    </audio>
                  )}
                </div>
              </div>
            ))}

            {isLoading && !isPlayingAudio && (
              <div className="message bot-message">
                <div className="message-content loading">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}

            {isPlayingAudio && (
              <div className="message bot-message">
                <div className="message-content audio-playing">
                  <span className="audio-icon">🔊</span>
                  <span className="audio-text">Reproduciendo audio...</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className={`chat-input-area ${showInitialScreen ? 'initial-input' : ''}`}>
          <textarea
            ref={inputRef}
            value={message}
            onChange={adjustTextareaHeight}
            onKeyDown={handleKeyDown}
            placeholder={showInitialScreen ? "¿Cómo puedo ayudarte hoy?" : "Escribe un mensaje..."}
            className="chat-input"
            rows={1}
            disabled={isLoading || isPlayingAudio}
          />
          <div className="chat-buttons">
            {/* <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: "none" }}
              id="image-upload-input"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="image-button"
              disabled={isLoading}
              aria-label="Adjuntar imagen"
              title="Adjuntar imagen"
            >
              <ImageIcon />
            </button> */}
            <button
              onClick={() => toggleRecording(recording)}
              className={`record-button ${recording ? "recording" : ""}`}
              disabled={isLoading || isPlayingAudio}
              aria-label={recording ? "Detener grabación" : "Grabar mensaje"}
              title={recording ? "Detener grabación" : "Grabar mensaje"}
            >
              <MicIcon />
            </button>
            <button
              onClick={handleSendMessage}
              className="send-button"
              disabled={!message.trim() || isLoading || isPlayingAudio}
              aria-label="Enviar mensaje"
              title="Enviar mensaje"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export const focusOnInput = () => {
  window.dispatchEvent(new CustomEvent("focusOnChatInput"));
};
