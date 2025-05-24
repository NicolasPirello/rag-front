// src/features/Settings/services/ttsService.js
import { transformAudioText } from '../../../core/api/api.js';

/**
 * Synthesizes text to speech using the backend API.
 * @param {string} text - The text to synthesize.
 * @returns {Promise<string>} A promise that resolves to an object URL for the synthesized audio Blob.
 * @throws {Error} If the API request or blob creation fails.
 * @async
 * @private
 */
async function synthesizeViaAPI(text) {
  const audioBlob = await transformAudioText(text); 
  if (!(audioBlob instanceof Blob)) {
    throw new Error("API did not return a valid Blob for audio synthesis.");
  }
  return URL.createObjectURL(audioBlob);
}

/**
 * Synthesizes text to speech using the browser's built-in SpeechSynthesis API.
 * @param {string} text - The text to synthesize.
 * @returns {Promise<void>} A promise that resolves when speech playback is complete, or rejects on error.
 * @throws {Error} If SpeechSynthesis is not supported or if playback fails.
 * @async
 * @private
 */
async function synthesizeViaBrowser(text) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      console.error("Browser Speech Synthesis not supported.");
      return reject(new Error("Browser Speech Synthesis not supported."));
    }
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES"; // TODO: Make configurable
    utterance.rate = 1.0;   // TODO: Make configurable
    // utterance.pitch = 1.0;
    // utterance.volume = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      console.error("Browser Speech Synthesis error:", event.error);
      reject(new Error(event.error));
    };
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * @namespace ttsService
 * @description Service for synthesizing text to speech using various engines.
 */
export const ttsService = {
  /**
   * Synthesizes text to speech using the specified engine.
   * @memberof ttsService
   * @param {string} text - The text to synthesize.
   * @param {'api' | 'browser'} [engine='api'] - The TTS engine to use.
   * @returns {Promise<string|Promise<void>>} 
   *          For 'api' engine, returns a Promise resolving to an object URL for the audio.
   *          For 'browser' engine, returns a Promise that resolves when playback is complete.
   * @throws {Error} If an invalid engine is selected or if synthesis/playback fails.
   * @async
   */
  synthesizeText: async (text, engine = 'api') => {
    if (engine === 'api') {
      return await synthesizeViaAPI(text);
    } else if (engine === 'browser') {
      return await synthesizeViaBrowser(text); // Returns promise that resolves on end
    }
    // Removed LemonFox condition
    console.error('Invalid TTS engine selected or LemonFox no longer supported:', engine);
    throw new Error('Invalid TTS engine selected or LemonFox no longer supported');
  }
};
