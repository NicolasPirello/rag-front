import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import SendIcon from "./icons/SendIcon";
import MicIcon from "./icons/MicIcon";
import ChatHeader from "./ChatHeader";
import InitialScreen from "./InitialScreen";
import "./chat-styles.css";

const API_URL = import.meta.env.VITE_API_URL || "https://apirag.nicolaspirello.com";
const API_KEY = import.meta.env.VITE_API_KEY || "";

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "Yo", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/query`,
        { query: message },
        {
          headers: {
            "Content-Type": "application/json",
            "x-app-auth": API_KEY,
          },
        }
      );

      const botMessage = {
        sender: "Bot",
        text: response.data?.answer || "Sin respuesta.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "Bot",
        text: "Ocurrió un error al contactar la API.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    setMessage(textarea.value);
  };

  const showInitialScreen = messages.length === 0;

  return (
    <>
      <ChatHeader />

      <main className={showInitialScreen ? "main-initial" : "main-chat"}>
        {showInitialScreen ? (
          <InitialScreen />
        ) : (
          <div className="chat-messages" ref={chatBoxRef}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === "Yo" ? "user-message" : "bot-message"}`}
              >
                <div className="message-content">{msg.text}</div>
              </div>
            ))}

            {isLoading && (
              <div className="message bot-message">
                <div className="message-content loading">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`chat-input-area ${showInitialScreen ? "initial-input" : ""}`}>
          <textarea
            ref={inputRef}
            value={message}
            onChange={adjustTextareaHeight}
            onKeyDown={handleKeyDown}
            placeholder={showInitialScreen ? "¿Cómo puedo ayudarte hoy? (V1)" : "Escribe un mensaje... (V1)"}
            className="chat-input"
            rows={1}
            disabled={isLoading}
          />
          <div className="chat-buttons">
            <button
              onClick={handleSendMessage}
              className="send-button"
              disabled={!message.trim() || isLoading}
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
