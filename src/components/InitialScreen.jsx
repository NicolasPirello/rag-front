import React from 'react';
import './chat-styles.css'; 

// Asumiendo que tienes un componente o SVG para el logo tipo 'asterisco' de Claude
// import SparkleIcon from './icons/SparkleIcon'; 

function InitialScreen() {
  return (
    <div className="initial-screen">
      <div className="initial-screen-content">
        <div className="initial-heading">
          <img src="/SofIA/escudoPolicia.svg" alt="Logo" className="initial-logo-icon" />
          <h2 className="initial-title">¿Cómo puedo ayudarte hoy?</h2>
        </div>
      </div>
    </div>
  );
}

export default InitialScreen; 