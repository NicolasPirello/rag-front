import React from "react";
import "../../../features/Chat/components/chat-styles.css";

const DeleteSingleChatModal = ({ onConfirm, onCancel, chatTitle }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3 className="modal-title">Confirmar eliminación</h3>
      <p className="modal-text">
        ¿Estás seguro que deseas eliminar el chat "{chatTitle}"? Esta acción no
        se puede deshacer.
      </p>
      <div className="modal-buttons">
        <button className="modal-button cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button className="modal-button confirm" onClick={onConfirm}>
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

export default DeleteSingleChatModal;
