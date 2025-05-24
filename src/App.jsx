import React, { useEffect } from "react";
import ChatScreen from "./features/Chat/components/ChatScreen";
import useChatListStore from "./features/ChatHistory/stores/chatListStore"; // New store
import useSettingsStore from "./features/Settings/stores/settingsStore"; // New store
// import useThemeMode from "./features/Settings/hooks/useThemeMode"; // No longer directly used here for body class

const App = () => {
  // Directly use settingsStore for darkMode to apply to body
  const darkMode = useSettingsStore((state) => state.darkMode);
  const initializeChats = useChatListStore((state) => state.initializeChats);
  const initializeSettings = useSettingsStore((state) => state.initializeSettings);

  useEffect(() => {
    // Initialize core settings and chat list
    initializeSettings();
    initializeChats(); 
    // messageStore.initializeMessages will be called by ChatScreen based on currentChat
  }, [initializeChats, initializeSettings]);

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
