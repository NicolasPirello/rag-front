// Configuración de la API de LemonFox
import useChatStore from "../store/chatStore";

const LEMONFOX_API_KEY = 'EifV5MZwVtPKiGKMNIV8CDkm1J0ZFhuR'; 
const LEMONFOX_API_URL = 'https://api.lemonfox.ai/v1/audio/speech';

export const speakWithLemonFox = async (textToSpeak) => {
  if (!LEMONFOX_API_KEY) {
    console.error('Error: API Key de LemonFox no configurada en src/services/lemonFoxTTS.js');
    alert('Error: La API Key de LemonFox no está configurada. Revisa la consola para más detalles.');
    useChatStore.setState({ isPlayingAudio: false });
    return;
  }

  if (!textToSpeak || typeof textToSpeak !== 'string' || !textToSpeak.trim()) {
    console.warn('LemonFox TTS: Texto vacío o inválido proporcionado.');
    useChatStore.setState({ isPlayingAudio: false });
    return;
  }

  try {
    console.log(`LemonFox TTS: Solicitando audio para: "${textToSpeak}"`);
    const response = await fetch(LEMONFOX_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEMONFOX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: textToSpeak,
        voice: 'alex',
        response_format: 'mp3',
        language: 'es'
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error con la API de LemonFox: ${response.status} ${response.statusText}`, errorBody);
      // Podrías mostrar un error más amigable al usuario aquí si es necesario.
      useChatStore.setState({ isPlayingAudio: false });
      throw new Error(`Error de la API de LemonFox: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    
    // Verificar si el blob tiene un tipo MIME de audio válido
    if (!audioBlob.type.startsWith('audio/')) {
        console.error('LemonFox TTS: La respuesta no parece ser un archivo de audio válido.', audioBlob.type);
        // Intentar reproducir de todas formas, o manejar el error como prefieras
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    console.log('LemonFox TTS: Reproduciendo audio...');
    await audio.play();

    // Devolver una promesa que se resuelva cuando el audio termine de reproducirse
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        console.log('LemonFox TTS: Audio finalizado.');
        URL.revokeObjectURL(audioUrl); // Limpiar el objeto URL
        useChatStore.setState({ isPlayingAudio: false });
        resolve();
      };
      audio.onerror = (e) => {
        console.error('LemonFox TTS: Error al reproducir audio.', e);
        URL.revokeObjectURL(audioUrl);
        useChatStore.setState({ isPlayingAudio: false });
        reject(e);
      };
    });

  } catch (error) {
    console.error('Error al procesar TTS con LemonFox:', error);
    useChatStore.setState({ isPlayingAudio: false });
    // Aquí podrías implementar un fallback al TTS del navegador si lo deseas,
    // o simplemente registrar el error.
  }
}; 