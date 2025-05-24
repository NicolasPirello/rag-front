import React, { useState, useRef } from 'react';
import SendIcon from '../../../shared/icons/SendIcon';
import MicIcon from '../../../shared/icons/MicIcon';
// import ImageIcon from '../../../shared/icons/ImageIcon'; // Commented out as per original

/**
 * @file MessageInput.jsx
 * @description Component for user input, including text area, send button, and microphone button.
 * It handles user input state, message sending, and toggling audio recording.
 *
 * @param {object} props - The component's props.
 * @param {object|null} props.currentChat - The current active chat object. Required to send messages.
 * @param {function} props.onSendMessage - Callback function to send a text message. 
 *                                         Expected signature: `(text, currentChat) => Promise<void>`.
 * @param {boolean} props.isLoading - Flag indicating if a message is currently being processed (e.g., bot typing).
 * @param {boolean} props.isPlayingAudio - Flag indicating if audio is currently playing.
 * @param {function} props.toggleRecording - Callback function to toggle audio recording.
 * @param {boolean} props.isRecording - Flag indicating if audio recording is currently active.
 * @param {boolean} props.showInitialScreen - Flag to adjust placeholder text if it's an initial, empty screen.
 * @param {React.RefObject<HTMLTextAreaElement>} props.inputRef - Ref to the textarea element for focus management.
 */
const MessageInput = ({
  currentChat,
  onSendMessage,
  isLoading,
  isPlayingAudio,
  toggleRecording,
  isRecording,
  showInitialScreen,
  inputRef, 
}) => {
  const [userInput, setUserInput] = useState("");
  // const fileInputRef = useRef(null); // Image functionality is commented out

  /**
   * Handles sending the current user input as a text message.
   * Clears the input field after sending.
   * @async
   */
  const handleSendMessageInternal = async () => {
    if (userInput.trim() && currentChat) {
      await onSendMessage(userInput, currentChat); 
      setUserInput(""); 
    }
  };

  /**
   * Handles the key down event in the textarea, specifically for 'Enter' to send messages.
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} e - The keyboard event.
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageInternal();
    }
  };

  // Image change handler is commented out as the feature is not active.
  // const handleImageChangeInternal = (e) => { 
  //   const file = e.target.files?.[0];
  //   if (file && currentChat && props.onSendImageMessage) { // Assuming onSendImageMessage would be a prop
  //     props.onSendImageMessage(file, currentChat); 
  //     e.target.value = ""; 
  //   }
  // };

  /**
   * Adjusts the height of the textarea dynamically based on its content, up to a maximum.
   * Updates the user input state.
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - The change event.
   */
  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto"; 
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; 
    setUserInput(textarea.value);
  };

  return (
    <div className={`chat-input-area ${showInitialScreen ? 'initial-input' : ''}`}>
      <textarea
        ref={inputRef} 
        value={userInput}
        onChange={adjustTextareaHeight}
        onKeyDown={handleKeyDown}
        placeholder={showInitialScreen ? "¿Cómo puedo ayudarte hoy?" : "Escribe un mensaje..."}
        className="chat-input"
        rows={1}
        disabled={isLoading || isPlayingAudio}
      />
      <div className="chat-buttons">
        {/* Image button functionality is commented out.
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChangeInternal}
          accept="image/*"
          style={{ display: "none" }}
          id="image-upload-input"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="image-button"
          disabled={isLoading || isPlayingAudio}
          aria-label="Adjuntar imagen"
          title="Adjuntar imagen"
        >
          <ImageIcon />
        </button> */}
        <button
          onClick={toggleRecording} 
          className={`record-button ${isRecording ? "recording" : ""}`}
          disabled={isLoading || isPlayingAudio}
          aria-label={isRecording ? "Detener grabación" : "Grabar mensaje"}
          title={isRecording ? "Detener grabación" : "Grabar mensaje"}
        >
          <MicIcon />
        </button>
        <button
          onClick={handleSendMessageInternal}
          className="send-button"
          disabled={!userInput.trim() || isLoading || isPlayingAudio}
          aria-label="Enviar mensaje"
          title="Enviar mensaje"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
