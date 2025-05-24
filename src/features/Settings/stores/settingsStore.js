// src/features/Settings/stores/settingsStore.js
import { create } from "zustand";
import { ttsService } from "../services/ttsService.js"; 

/**
 * Zustand store for managing application settings, including theme, audio,
 * TTS engine, response mode, and recording/playback states.
 */
const useSettingsStore = create((set, get) => ({
  // State
  darkMode: false,
  audioResponses: false,
  ttsEngine: 'api', // Options: 'browser', 'api' (LemonFox removed)
  useHardcodedResponses: false,
  recording: false, // General recording state
  isPlayingAudio: false,

  /**
   * Initializes settings. Placeholder for future enhancements like loading from localStorage.
   */
  initializeSettings: () => {
    // console.log("Settings initialized.");
    // Future: Load persisted settings from localStorage, e.g.:
    // const persistedDarkMode = localStorage.getItem('darkMode');
    // if (persistedDarkMode !== null) {
    //   set({ darkMode: JSON.parse(persistedDarkMode) });
    // }
  },

  /**
   * Sets the dark mode state.
   * @param {boolean} isDark - True to enable dark mode, false for light mode.
   */
  setDarkMode: (isDark) => {
    set({ darkMode: isDark });
    // Future: localStorage.setItem('darkMode', JSON.stringify(isDark));
  },

  /**
   * Toggles the dark mode state.
   */
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.darkMode;
    // Future: localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    return { darkMode: newDarkMode };
  }),

  /**
   * Sets the recording state.
   * @param {boolean} isRecording - True if recording is active, false otherwise.
   */
  setRecording: (isRecording) => set({ recording: isRecording }),

  /**
   * Toggles the audio responses setting.
   */
  toggleAudioResponses: () => set((state) => ({ audioResponses: !state.audioResponses })),

  /**
   * Sets the Text-To-Speech (TTS) engine.
   * @param {'api' | 'browser'} engine - The TTS engine to use.
   */
  setTTSEngine: (engine) => {
    // Basic validation for engine type could be added here if more engines are supported
    if (engine === 'api' || engine === 'browser') {
      set({ ttsEngine: engine });
      // console.log(`TTS engine set to: ${engine}`);
    } else {
      console.warn(`Attempted to set invalid TTS engine: ${engine}. Defaulting to 'api'.`);
      set({ ttsEngine: 'api' });
    }
  },

  /**
   * Toggles the response mode between using hardcoded responses and the actual API.
   */
  toggleResponseMode: () => set((state) => ({ useHardcodedResponses: !state.useHardcodedResponses })),

  /**
   * Synthesizes and speaks the given text using the currently selected TTS engine.
   * Manages the isPlayingAudio state during playback.
   * @param {string} text - The text to speak.
   * @async
   */
  speakText: async (text) => {
    if (!text || !get().audioResponses) {
      return;
    }
    if (get().isPlayingAudio) {
      return;
    }
    set({ isPlayingAudio: true });
    try {
      const currentEngine = get().ttsEngine;
      // The ttsService.synthesizeText now only handles 'api' and 'browser'
      const audioUrlOrPromise = await ttsService.synthesizeText(text, currentEngine);

      if (typeof audioUrlOrPromise === 'string') { // API engine returns a URL
        const audio = new Audio(audioUrlOrPromise);
        await new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrlOrPromise);
            resolve();
          };
          audio.onerror = (e) => {
            URL.revokeObjectURL(audioUrlOrPromise);
            console.error("SpeakText: Error playing synthesized API audio.", e);
            reject(e); 
          };
          audio.play().catch(e => {
            URL.revokeObjectURL(audioUrlOrPromise);
            console.error("SpeakText: Error initiating audio playback for API audio.", e);
            reject(e);
          });
        });
      } else if (audioUrlOrPromise instanceof Promise) { // Browser engine returns a Promise
        await audioUrlOrPromise;
      }
    } catch (error) {
      console.error("SpeakText action error:", error);
    } finally {
      set({ isPlayingAudio: false });
    }
  },
}));

export default useSettingsStore;
