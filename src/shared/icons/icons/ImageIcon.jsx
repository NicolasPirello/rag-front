import React from "react";

/**
 * @file ImageIcon.jsx
 * @description Icon component for displaying an image placeholder or image-related action.
 * Wrapped with React.memo for performance optimization.
 */
const ImageIcon = (props) => ( 
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default React.memo(ImageIcon);
