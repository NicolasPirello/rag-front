// Mapa de preguntas y respuestas hardcodeadas
const responseMap = {
  // Preguntas generales
  "hola": "¡Hola! ¿En qué puedo ayudarte hoy?",
  "como estas": "Estoy funcionando perfectamente, gracias por preguntar. ¿En qué puedo ayudarte?",
  "quien eres": "Soy un asistente virtual diseñado para responder a tus consultas y ayudarte con tus tareas.",
  "que hora es": "No puedo saber la hora exacta, pero puedes mirar el reloj de tu dispositivo.",
  "adios": "¡Hasta luego! Espero haber sido de ayuda.",
  "gracias": "No hay de qué. ¡Estoy aquí para ayudar!",

  // Consultas policiales simuladas
  "cuando puedo renovar mi dni": "Puedes renovar tu DNI en cualquier oficina de documentación. Necesitas llevar el DNI anterior y una prueba de domicilio.",
  "como denunciar un robo": "Para denunciar un robo, debes acudir a la comisaría más cercana con tu identificación. También puedes iniciar la denuncia a través de la web oficial de la Policía.",
  "donde queda la comisaria mas cercana": "Para encontrar la comisaría más cercana, puedes utilizar el mapa en la web oficial de la Policía o llamar al 091 para información.",
  "requisitos para pasaporte": "Para solicitar el pasaporte necesitas: DNI en vigor, una fotografía reciente, el justificante de pago de la tasa y cita previa en la oficina de expedición.",
  "horario de atencion": "El horario general de atención al público en comisarías es de 09:00 a 14:00 y de 16:00 a 18:00, de lunes a viernes. Para trámites específicos puede variar.",
  "que es un apercimiento": "En el contexto del Decreto número 53 del año 2017 de la Ciudad Autónoma de Buenos Aires, que reglamenta el régimen disciplinario de la Policía de la Ciudad, un apercibimiento es una sanción disciplinaria aplicada por la comisión de una falta leve.",

  // Respuesta por defecto para preguntas no reconocidas
  "default": "No tengo una respuesta específica para esa pregunta. ¿Puedo ayudarte con alguna otra consulta?"
};

/**
 * Busca una respuesta hardcodeada para la pregunta.
 * Primero busca una coincidencia exacta, luego intenta encontrar palabras clave.
 *
 * @param {string} question - La pregunta o mensaje del usuario
 * @returns {string} La respuesta correspondiente o mensaje por defecto
 */
export const getHardcodedResponse = (question) => {
  if (!question) return responseMap.default;
  
  // Normalizar el texto (minúsculas, sin signos, etc.)
  const normalizedQuestion = question.toLowerCase()
    .trim()
    .replace(/[¿?¡!.,;:]/g, '');
  
  // 1. Buscar coincidencia exacta
  if (responseMap[normalizedQuestion]) {
    return responseMap[normalizedQuestion];
  }
  
  // 2. Buscar coincidencias parciales
  for (const key in responseMap) {
    if (key !== 'default' && normalizedQuestion.includes(key)) {
      return responseMap[key];
    }
  }
  
  // 3. Buscar palabras clave en preguntas más largas
  const keywords = [
    {words: ["dni", "renovar"], response: responseMap["cuando puedo renovar mi dni"]},
    {words: ["robo", "denuncia", "denunciar", "robaron"], response: responseMap["como denunciar un robo"]},
    {words: ["comisaria", "comisaría", "policía", "cercana"], response: responseMap["donde queda la comisaria mas cercana"]},
    {words: ["pasaporte", "requisitos", "sacar"], response: responseMap["requisitos para pasaporte"]},
    {words: ["horario", "atención", "atencion", "abierto"], response: responseMap["horario de atencion"]},
    {words: ["hola", "saludos", "buenos días", "buenas"], response: responseMap["hola"]},
    {words: ["adios", "chau", "hasta luego"], response: responseMap["adios"]},
    {words: ["gracias", "agradecido"], response: responseMap["gracias"]}
  ];
  
  for (const {words, response} of keywords) {
    if (words.some(word => normalizedQuestion.includes(word))) {
      return response;
    }
  }
  
  // Si no hay coincidencias, devolver respuesta por defecto
  return responseMap.default;
}; 