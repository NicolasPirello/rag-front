import React, { useEffect, useRef } from 'react';

/**
 * @file MessageList.jsx
 * @description Component responsible for displaying a list of chat messages,
 * handling loading states, and audio playback indicators.
 * 
 * @param {object} props - The component's props.
 * @param {Array<object>} props.messages - Array of message objects to display. 
 *                                         Each message object should have at least `id`, `sender`, `text`, 
 *                                         and optionally `audio` (URL string) or `image` (URL string).
 * @param {boolean} props.isLoadingMessages - Flag indicating if messages are currently loading 
 *                                            (e.g., bot is typing).
 * @param {boolean} props.isPlayingAudio - Flag indicating if audio is currently playing, 
 *                                         which might affect UI (e.g., showing an audio playing indicator).
 */
const MessageList = ({ messages, isLoadingMessages, isPlayingAudio }) => {
  const chatBoxRef = useRef(null);

  /**
   * Scrolls the chat box to the bottom.
   */
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  // Effect to scroll to bottom when messages, loading, or audio playing state changes.
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoadingMessages, isPlayingAudio]);

  return (
    <div className="chat-messages" ref={chatBoxRef}>
      {messages.map((msg, index) => (
        <div
          key={msg.id || index} // msg.id from DB should be preferred and unique
          className={`message ${
            msg.sender === "Yo" ? "user-message" : "bot-message"
          } ${msg.audio ? "audio-message" : ""}`}
        >
          <div className="message-content">
            {!msg.audio && msg.text}
            {msg.image && (
              <img
                src={msg.image}
                alt="Imagen enviada" // Consider more descriptive alt text if possible
                className="message-image"
              />
            )}
            {msg.audio && (
              <audio
                controls
                src={msg.audio}
                className="message-audio"
                preload="metadata" // Good for performance
              >
                Tu navegador no soporta el elemento de audio.
              </audio>
            )}
          </div>
        </div>
      ))}

      {/* Loading indicator for bot response */}
      {isLoadingMessages && !isPlayingAudio && (
        <div className="message bot-message">
          <div className="message-content loading">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      )}

      {/* Audio playing indicator */}
      {isPlayingAudio && (
        <div className="message bot-message">
          <div className="message-content audio-playing">
            <span className="audio-icon">🔊</span>
            <span className="audio-text">Reproduciendo audio...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
