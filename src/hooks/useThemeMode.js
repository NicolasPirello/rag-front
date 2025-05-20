// Hook personalizado para manejar el tema oscuro/claro
import { useEffect } from "react";
import useChatStore from "../store/chatStore";

const useThemeMode = () => {
  const { darkMode, setDarkMode, toggleDarkMode } = useChatStore();

  // Efecto para aplicar el tema al body
  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  // Efecto para detectar la preferencia del sistema al iniciar
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(prefersDark);

    // Opcional: listener para cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setDarkMode(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setDarkMode]);

  return {
    darkMode,
    toggleTheme: toggleDarkMode,
  };
};

export default useThemeMode;
