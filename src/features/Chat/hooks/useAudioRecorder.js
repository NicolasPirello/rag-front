// src/features/Chat/hooks/useAudioRecorder.js
import { useRef, useCallback } from "react";
import useMessageStore from "../stores/messageStore"; 
import useSettingsStore from "../../../features/Settings/stores/settingsStore"; 

const SHOULD_TRANSCRIPT = import.meta.env.VITE_TRANSCRIPT_AUDIO === "TRUE";

/**
 * @file useAudioRecorder.js
 * @description Custom hook for managing audio recording and speech-to-text transcription.
 * It interacts with `useMessageStore` to send audio messages and `useSettingsStore`
 * to manage the global recording state.
 *
 * @param {object|null} currentChat - The current active chat object. This is required to
 *                                    associate the recorded audio message with the correct chat.
 *                                    If null, audio messages cannot be sent.
 * @returns {{toggleRecording: function}} An object containing:
 *  - `toggleRecording` {function}: A function to start or stop audio recording.
 */
const useAudioRecorder = (currentChat) => { 
  const { sendAudioMessage } = useMessageStore((state) => ({
    sendAudioMessage: state.sendAudioMessage,
  }));
  const { setRecording } = useSettingsStore((state) => ({
    setRecording: state.setRecording,
  }));

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null); 
  const chunksRef = useRef([]);

  /**
   * Starts audio recording and, if enabled, speech recognition.
   * @async
   */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      if (SHOULD_TRANSCRIPT) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.lang = "es-ES"; // TODO: Make configurable
          recognitionRef.current.continuous = true; 
          recognitionRef.current.interimResults = false; 

          recognitionRef.current.onresult = (event) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            if (recognitionRef.current) { 
                 recognitionRef.current.transcription = text; 
            }
          };
          recognitionRef.current.onerror = (event) => {
            console.error("AudioRecorder: Speech recognition error", event.error);
          };
          recognitionRef.current.start();
        } else {
          console.warn("AudioRecorder: Speech Recognition API not supported.");
        }
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        let transcribedText = null;
        if (SHOULD_TRANSCRIPT && recognitionRef.current) {
          transcribedText = recognitionRef.current.transcription || null;
          recognitionRef.current.transcription = ""; 
        }
        
        if (currentChat && currentChat.id) { 
          await sendAudioMessage(audioBlob, transcribedText, currentChat);
        } else {
          console.error("AudioRecorder: No currentChat available to send audio message.");
          // Optionally, inform the user via an alert or a non-modal notification
        }
        
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setRecording(false); 
      };

      mediaRecorderRef.current.start();
      setRecording(true); 
    } catch (err) {
      console.error("AudioRecorder: Error starting recording:", err);
      // alert("No se pudo acceder al micrófono o el reconocimiento de voz no está disponible.");
      // Consider a less intrusive way to inform the user, or rely on console for dev.
      setRecording(false);
    }
  }, [setRecording, sendAudioMessage, currentChat]); 

  /**
   * Stops the current audio recording and speech recognition if active.
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); 
      if (SHOULD_TRANSCRIPT && recognitionRef.current && recognitionRef.current.stop) {
        recognitionRef.current.stop(); 
      }
    }
  }, []); 

  /**
   * Toggles the audio recording state (starts if not recording, stops if recording).
   * Relies on the global `recording` state from `useSettingsStore` to determine current status.
   */
  const toggleRecording = useCallback(() => {
    const isCurrentlyRecording = useSettingsStore.getState().recording;
    if (isCurrentlyRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [startRecording, stopRecording]); // Dependencies on the memoized start/stop functions

  return { toggleRecording }; 
};

export default useAudioRecorder;
