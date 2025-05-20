import axiosInstance from "./axiosInstance";

export const sendTextMessage = async (message) => {
  try {
    const { data } = await axiosInstance.post("/query", {
      query: message,
      filters: {}
    });
    return data;
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    throw error;
  }
};

export const sendAudioMessage = async (audioBlob) => {
  try {
    const file = new File([audioBlob], "audio.wav", { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio_file", file);

    const { data } = await axiosInstance.post("/ask_audio", formData);
    return data;
  } catch (error) {
    console.error("Error al enviar audio:", error);
    throw error;
  }
};

export const sendImageMessage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image_file", imageFile);

    const { data } = await axiosInstance.post("/ask/image", formData);
    return data;
  } catch (error) {
    console.error("Error al enviar imagen:", error);
    throw error;
  }
};

export const transformAudioText = async (
  text,
  speed = 99.0,
  voice = "es_ar_2",
  slow = false
) => {
  try {
    const response = await fetch("/synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        slow,
        speed,
        voice,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("Audio response:", response);
    return await response.blob();
  } catch (error) {
    console.error("Error al transformar texto a audio:", error);
    throw error;
  }
};
