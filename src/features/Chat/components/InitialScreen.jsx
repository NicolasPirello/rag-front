import React from 'react';
import './chat-styles.css'; 

// Asumiendo que tienes un componente o SVG para el logo tipo 'asterisco' de Claude
// import SparkleIcon from './icons/SparkleIcon'; 

function InitialScreen() {
  return (
    <div className="initial-screen">
      <div className="initial-screen-content">
        <div className="initial-heading">
          <span className="initial-logo-icon" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="16" width="48" height="32" rx="8" fill="#2E8CCB"/>
              <ellipse cx="20" cy="32" rx="4" ry="4" fill="white"/>
              <ellipse cx="32" cy="32" rx="4" ry="4" fill="white"/>
              <ellipse cx="44" cy="32" rx="4" ry="4" fill="white"/>
              <path d="M16 48L8 56V16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V40C56 44.4183 52.4183 48 48 48H16Z" fill="#2E8CCB"/>
            </svg>
          </span>
          <h2 className="initial-title">¿Cómo puedo ayudarte hoy?</h2>
        </div>
      </div>
    </div>
  );
}

export default InitialScreen; 