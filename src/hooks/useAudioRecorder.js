// Hook personalizado para manejar la grabación de audio
import { useRef, useCallback } from "react";
import useChatStore from "../store/chatStore";

const SHOULD_TRANSCRIPT = import.meta.env.VITE_TRANSCRIPT_AUDIO === "TRUE";

const useAudioRecorder = () => {
  const { setRecording, sendAudioMessage } = useChatStore();
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);

  // Iniciar la grabación de audio
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      // Configurar el reconocimiento de voz solo si está habilitado
      if (SHOULD_TRANSCRIPT) {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          throw new Error(
            "El reconocimiento de voz no está soportado en este navegador"
          );
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "es-ES";
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
          const last = event.results.length - 1;
          const text = event.results[last][0].transcript;
          console.log("Texto transcrito:", text);
          // Almacenar el texto transcrito
          recognitionRef.current.transcription = text;
        };

        recognition.onerror = (event) => {
          console.error("Error en el reconocimiento de voz:", event.error);
        };

        recognitionRef.current = recognition;
      }

      // Configurar la recolección de chunks de audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = []; // Limpiar chunks anteriores

      // Iniciar la grabación y el reconocimiento si está habilitado
      mediaRecorder.start();
      if (SHOULD_TRANSCRIPT && recognitionRef.current) {
        recognitionRef.current.start();
      }
      setRecording(true);
    } catch (err) {
      console.error("Error al iniciar la grabación:", err);
      alert(
        "No se pudo acceder al micrófono o el reconocimiento de voz no está disponible"
      );
    }
  }, [setRecording]);

  // Detener la grabación de audio
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (SHOULD_TRANSCRIPT && recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Crear el blob de audio cuando se detiene la grabación
      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
          chunksRef.current = [];

          // Wait for transcription to complete only if enabled
          let transcribedText = null;
          if (SHOULD_TRANSCRIPT && recognitionRef.current) {
            // Give some time for the transcription to finish
            await new Promise((resolve) => setTimeout(resolve, 500));
            transcribedText = recognitionRef.current.transcription;
            // console.log("Final transcribed text:", transcribedText);
          }

          await sendAudioMessage(audioBlob, transcribedText);
        } catch (error) {
          console.error("Error in onstop handler:", error);
        }
      };

      // Limpiar la transcripción si está habilitada
      if (SHOULD_TRANSCRIPT && recognitionRef.current) {
        recognitionRef.current.transcription = "";
      }

      // Liberar el micrófono
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setRecording(false);
    }
  }, [setRecording, sendAudioMessage]);

  // Alternar entre iniciar y detener la grabación
  const toggleRecording = useCallback(
    (isRecording) => {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    },
    [startRecording, stopRecording]
  );

  return {
    startRecording,
    stopRecording,
    toggleRecording,
  };
};

export default useAudioRecorder;
