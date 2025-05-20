import React from "react";
import "../chat-styles.css";

const DeleteAllChatsModal = ({ onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3 className="modal-title">Confirmar eliminación</h3>
      <p className="modal-text">
        ¿Estás seguro que deseas eliminar todos los chats? Esta acción no se
        puede deshacer.
      </p>
      <div className="modal-buttons">
        <button className="modal-button cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button className="modal-button confirm" onClick={onConfirm}>
          Eliminar todos
        </button>
      </div>
    </div>
  </div>
);

export default DeleteAllChatsModal;
