import React, { useState } from "react";
import useChatStore from "../store/chatStore";
import { focusOnInput } from "./ChatScreen";
import DeleteAllChatsModal from "./modals/DeleteAllChatsModal";
import DeleteSingleChatModal from "./modals/DeleteSingleChatModal";
import "./chat-styles.css";

export default function ChatSidebar({ onClose }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const {
    chats,
    currentChat,
    createChat,
    switchChat,
    deleteChat,
    deleteAllChats,
  } = useChatStore();

  const handleCreateChat = () => {
    createChat("Nuevo Chat");
    onClose();
    focusOnInput();
  };

  const handleChatClick = (chatId) => {
    switchChat(chatId);
    onClose();
  };

  const handleDeleteChat = (e, chat) => {
    e.stopPropagation();
    setChatToDelete(chat);
  };

  const handleConfirmDeleteChat = async () => {
    if (chatToDelete) {
      await deleteChat(chatToDelete.id);
      setChatToDelete(null);
    }
  };

  const handleDeleteAllChats = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteAll = async () => {
    await deleteAllChats();
    setShowDeleteModal(false);
    onClose();
  };

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <img src="/SofIA/escudoPolicia.svg" alt="Logo Policía" className="header-logo" />
          <span>Sofia</span>
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
          + Nuevo Chat
        </button>
      </div>
      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${
              currentChat?.id === chat.id ? "active" : ""
            }`}
            onClick={() => handleChatClick(chat.id)}
          >
            <span className="chat-title">
              {chat.title || "Chat sin título"}
            </span>
            <button
              className="delete-chat-button"
              onClick={(e) => handleDeleteChat(e, chat)}
              title="Eliminar chat"
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
          chatTitle={chatToDelete.title}
          onConfirm={handleConfirmDeleteChat}
          onCancel={() => setChatToDelete(null)}
        />
      )}
    </div>
  );
}
