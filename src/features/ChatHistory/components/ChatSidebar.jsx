import React, { useState } from "react";
import useChatListStore from "../stores/chatListStore"; 
import DeleteAllChatsModal from "../modals/DeleteAllChatsModal";
import DeleteSingleChatModal from "../modals/DeleteSingleChatModal";
import "../../../features/Chat/components/chat-styles.css"; 
// import { focusOnInput } from '../../Chat/components/ChatScreen'; // Example of how to import if needed

/**
 * @file ChatSidebar.jsx
 * @description Sidebar component for managing chat conversations. It allows users to
 * create new chats, switch between existing chats, and delete chats.
 *
 * @param {object} props - The component's props.
 * @param {function} props.onClose - Callback function to close the sidebar.
 */
export default function ChatSidebar({ onClose }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null); // Stores the chat object staged for single deletion

  const {
    chats,
    currentChat,
    createChat,
    switchChat,
    deleteChat,
    deleteAllChats,
  } = useChatListStore((state) => ({
    chats: state.chats,
    currentChat: state.currentChat,
    createChat: state.createChat,
    switchChat: state.switchChat,
    deleteChat: state.deleteChat,
    deleteAllChats: state.deleteAllChats,
  }));

  /**
   * Triggers the global focus event for the chat input.
   * Assumes ChatScreen or another component listens for "focusOnChatInput".
   */
  const focusChatInput = () => {
    window.dispatchEvent(new CustomEvent("focusOnChatInput"));
  };

  /**
   * Handles the creation of a new chat.
   * Calls the createChat action, closes the sidebar, and focuses the chat input.
   * @async
   */
  const handleCreateChat = async () => {
    await createChat("Nuevo Chat"); // Default title for new chats
    onClose(); 
    focusChatInput(); 
  };

  /**
   * Handles switching to a different chat.
   * @param {string} chatId - The ID of the chat to switch to.
   */
  const handleChatClick = (chatId) => {
    switchChat(chatId);
    onClose();
  };

  /**
   * Stages a chat for deletion by setting it in local state and showing the confirmation modal.
   * @param {React.MouseEvent} e - The click event.
   * @param {object} chat - The chat object to be deleted.
   */
  const handleDeleteChat = (e, chat) => {
    e.stopPropagation(); 
    setChatToDelete(chat);
  };

  /**
   * Confirms and executes the deletion of the staged chat.
   * @async
   */
  const handleConfirmDeleteChat = async () => {
    if (chatToDelete) {
      await deleteChat(chatToDelete.id);
      setChatToDelete(null); 
    }
  };

  /**
   * Shows the confirmation modal for deleting all chats.
   */
  const handleDeleteAllChats = () => {
    setShowDeleteModal(true);
  };

  /**
   * Confirms and executes the deletion of all chats.
   * @async
   */
  const handleConfirmDeleteAll = async () => {
    await deleteAllChats();
    setShowDeleteModal(false); 
    onClose(); 
  };

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <img src="" alt="App Logo" className="header-logo" /> {/* Placeholder for logo */}
          <span>Conversaciones</span>
        </div>
        <button
          className="close-sidebar-button"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          ×
        </button>
      </div>

      <div className="sidebar-actions">
        <button className="new-chat-button" onClick={handleCreateChat}>
          Nuevo Chat
        </button>
      </div>

      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${currentChat?.id === chat.id ? "active" : ""}`}
            onClick={() => handleChatClick(chat.id)}
            role="button" // Added for accessibility
            tabIndex={0}  // Added for accessibility
            onKeyDown={(e) => e.key === 'Enter' && handleChatClick(chat.id)} // Added for accessibility
          >
            <span className="chat-title">
              {chat.title || `Chat ${chat.id}`} 
            </span>
            <button
              className="delete-chat-button"
              onClick={(e) => handleDeleteChat(e, chat)}
              title="Eliminar chat"
              aria-label={`Eliminar chat ${chat.title || `Chat ${chat.id}`}`}
            >
              ×
            </button>
          </div>
        ))}
        {chats.length === 0 && (
          <div className="no-chats-message">
            No hay chats. Crea uno nuevo para comenzar.
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <button
          className="delete-all-chats"
          onClick={handleDeleteAllChats}
          disabled={chats.length === 0}
        >
          Borrar todos los chats
        </button>
      </div>

      {showDeleteModal && (
        <DeleteAllChatsModal
          onConfirm={handleConfirmDeleteAll}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {chatToDelete && (
        <DeleteSingleChatModal
          chatTitle={chatToDelete.title || `Chat ${chatToDelete.id}`}
          onConfirm={handleConfirmDeleteChat}
          onCancel={() => setChatToDelete(null)}
        />
      )}
    </div>
  );
}
