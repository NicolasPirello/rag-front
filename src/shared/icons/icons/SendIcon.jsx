import React from "react";

/**
 * @file SendIcon.jsx
 * @description Icon component for a send action, typically used for submitting messages.
 * Wrapped with React.memo for performance optimization.
 */
const SendIcon = (props) => ( 
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props} // Spread any additional props passed to the component
  >
    <path d="m22 2-7 20-4-9-9-4Z"></path>
    <path d="M22 2 11 13"></path>
  </svg>
);

export default React.memo(SendIcon);
