import React, { useEffect } from "react";
import ChatScreen from "./components/ChatScreen";
import useChatStore from "./store/chatStore";
import useThemeMode from "./hooks/useThemeMode";

const App = () => {
  const { darkMode } = useThemeMode();
  const initialize = useChatStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Aplicamos la clase dark/light directamente al body para un mejor control del tema
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Devolvemos directamente el ChatScreen sin envoltorio adicional
  return <ChatScreen />;
};

export default App;
