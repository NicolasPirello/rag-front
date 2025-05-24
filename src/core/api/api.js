import axiosInstance from "./axiosInstance";

/**
 * Sends a text message to the backend API.
 * @param {string} messageText - The text of the message to send.
 * @returns {Promise<object>} A promise that resolves to an object containing the bot's response 
 *                            and a boolean indicating if it's speakable.
 *                            Example: { response: "Hello there!", speakable: true }
 * @throws {Error} If the API request fails.
 */
export const sendTextMessage = async (messageText) => {
  try {
    const response = await axiosInstance.post("/query", {
      query: messageText,
      filters: {} 
    });
    return {
      response: response.data.answer || response.data.response || "No specific response field found.",
      speakable: response.data.speakable !== undefined ? response.data.speakable : true 
    };
  } catch (error) {
    console.error("Error in sendTextMessage:", error.response ? error.response.data : error.message);
    throw error; 
  }
};

/**
 * Sends an audio blob to the backend API for processing.
 * @param {Blob} audioBlob - The audio data blob (e.g., a WAV file).
 * @returns {Promise<object>} A promise that resolves to an object containing the bot's response 
 *                            (often a transcription or a reply based on audio) and a speakable flag.
 * @throws {Error} If the API request fails.
 */
export const sendAudioMessage = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "audio.wav"); 

    const response = await axiosInstance.post("/ask_audio", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      response: response.data.answer || response.data.response || response.data.respuesta || "No specific response field found.",
      speakable: response.data.speakable !== undefined ? response.data.speakable : true
    };
  } catch (error) {
    console.error("Error in sendAudioMessage:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Sends an image file to the backend API for processing.
 * @param {File} imageFile - The image file to send.
 * @returns {Promise<object>} A promise that resolves to an object containing the bot's response 
 *                            (e.g., an analysis or a reply based on the image) and a speakable flag.
 * @throws {Error} If the API request fails.
 */
export const sendImageMessage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image_file", imageFile, imageFile.name || "image.png");

    const response = await axiosInstance.post("/ask/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      response: response.data.respuesta || response.data.answer || response.data.response || "No specific response field found.",
      speakable: response.data.speakable !== undefined ? response.data.speakable : true
    };
  } catch (error) {
    console.error("Error in sendImageMessage:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Transforms text into speech using a synthesis API.
 * @param {string} text - The text to synthesize.
 * @param {number} [speed=99.0] - The speed of the speech.
 * @param {string} [voice="es_ar_2"] - The voice to use for synthesis.
 * @param {boolean} [slow=false] - Whether to use a slower version of the voice.
 * @returns {Promise<Blob>} A promise that resolves to an audio Blob.
 * @throws {Error} If the API request fails or the response is not a Blob.
 */
export const transformAudioText = async (
  text,
  speed = 99.0,
  voice = "es_ar_2",
  slow = false
) => {
  try {
    const response = await axiosInstance.post("/synthesize", {
      text,
      slow,
      speed,
      voice,
    }, {
      responseType: 'blob', 
    });
    if (!(response.data instanceof Blob)) {
      throw new Error("API did not return a Blob for audio synthesis.");
    }
    return response.data; 
  } catch (error) {
    console.error("Error in transformAudioText:", error.response ? error.response.data : error.message);
    throw error;
  }
};
