# ChatWeb IA RAG

## Descripción General

Aplicación de chat web que interactúa con un backend de IA RAG (Retrieval Augmented Generation) para proporcionar respuestas a las consultas de los usuarios. Permite la comunicación mediante mensajes de texto, audio e imágenes. La persistencia del chat se maneja localmente mediante IndexedDB.

## Arquitectura

El proyecto ha sido refactorizado siguiendo principios de **Arquitectura Orientada a Features** (similar a Screaming Architecture), donde la estructura de carpetas principal refleja las funcionalidades de la aplicación en lugar de tipos de componentes genéricos. Esto busca mejorar la modularidad, escalabilidad y mantenibilidad del código.

Principales componentes de la arquitectura:

*   **Features (`src/features/`)**: Contienen módulos específicos de una funcionalidad (Chat, ChatHistory, Settings), cada uno con sus propios componentes, stores (si aplica), hooks y servicios.
*   **Core (`src/core/`)**: Contiene la lógica central y compartida de la aplicación, como la configuración del cliente API (`api/`), la instancia de base de datos (`db/`), stores globales (aunque ahora se prefieren stores por feature), y assets base.
*   **Shared (`src/shared/`)**: Contiene componentes, utilidades o hooks que pueden ser compartidos entre múltiples features pero no son parte del `core` de la aplicación (ej. componentes de UI genéricos como iconos).
*   **Gestión de Estado (Zustand)**: Se utiliza Zustand para la gestión de estado. El store monolítico original ha sido dividido en stores específicos por feature para mejorar la cohesión y reducir el acoplamiento:
    *   `useMessageStore`: Gestiona los mensajes del chat activo, estados de carga y envío de mensajes.
    *   `useChatListStore`: Gestiona la lista de chats, el chat actual y las operaciones CRUD sobre los chats.
    *   `useSettingsStore`: Gestiona configuraciones de la aplicación como el tema (oscuro/claro), preferencias de respuesta de audio y motor TTS.

## Estructura del Proyecto

/chatweb
|-- public/                     # Assets públicos
|-- src/                        # Código fuente de la aplicación
|   |-- core/                   # Lógica central y compartida
|   |   |-- api/                # Cliente API (axiosInstance, funciones de servicio API)
|   |   |-- assets/             # Assets base (ej. react.svg)
|   |   |-- db/                 # Configuración y manejo de IndexedDB (chatDB.js)
|   |-- features/               # Módulos de funcionalidades específicas
|   |   |-- Chat/               # Funcionalidad de chat principal
|   |   |   |-- components/     # Componentes React para el chat (ChatScreen, MessageList, MessageInput, InitialScreen)
|   |   |   |-- hooks/          # Hooks específicos del chat (ej. useAudioRecorder)
|   |   |   |-- services/       # Servicios específicos del chat (ej. hardcodedResponses)
|   |   |   |-- stores/         # Store Zustand para mensajes (messageStore.js)
|   |   |-- ChatHistory/        # Funcionalidad de historial/sidebar de chats
|   |   |   |-- components/     # Componentes para el historial (ChatSidebar, ChatHeader)
|   |   |   |-- modals/         # Modales para el historial (ej. DeleteAllChatsModal)
|   |   |   |-- stores/         # Store Zustand para la lista de chats (chatListStore.js)
|   |   |-- Settings/           # Funcionalidad de configuraciones
|   |   |   |-- hooks/          # Hooks para configuraciones (ej. useThemeMode)
|   |   |   |-- services/       # Servicios para configuraciones (ej. ttsService.js)
|   |   |   |-- stores/         # Store Zustand para configuraciones (settingsStore.js)
|   |-- shared/                 # Componentes/utilidades compartidas
|   |   |-- icons/              # Componentes de iconos SVG
|   |-- App.jsx                 # Componente raíz de la aplicación
|   |-- main.jsx                # Punto de entrada principal de la aplicación
|   |-- index.css               # Estilos globales
|-- .envExample                 # Ejemplo de variables de entorno
|-- .gitignore
|-- eslint.config.js            # Configuración de ESLint
|-- index.html                  # HTML principal
|-- package.json
|-- vite.config.js              # Configuración de Vite

## Módulos Clave y Descripciones

*   **`src/App.jsx`**: Componente principal que inicializa la aplicación, gestiona el tema y renderiza el layout base.
*   **`src/core/api/api.js`**: Define las funciones para interactuar con el backend (enviar mensajes, sintetizar audio). Utiliza `axiosInstance`.
*   **`src/core/api/axiosInstance.js`**: Configuración de la instancia de Axios (URL base, headers por defecto, interceptores).
*   **`src/core/db/chatDB.js`**: Clase para interactuar con IndexedDB, manejando la persistencia de chats y mensajes.
*   **`src/features/Chat/components/ChatScreen.jsx`**: Orquesta la vista principal del chat, integrando la lista de mensajes y el input.
*   **`src/features/Chat/components/MessageList.jsx`**: Muestra la lista de mensajes del chat activo.
*   **`src/features/Chat/components/MessageInput.jsx`**: Maneja el input del usuario (texto, audio) y las acciones de envío.
*   **`src/features/ChatHistory/components/ChatSidebar.jsx`**: Muestra la lista de chats y permite crear, seleccionar o eliminar chats.
*   **`src/features/Settings/stores/settingsStore.js`**: Gestiona el estado de las configuraciones (tema, audio, motor TTS).
*   **`src/features/Settings/services/ttsService.js`**: Provee una capa de abstracción para la síntesis de voz, permitiendo usar diferentes motores (API, Navegador).

## Flujo de la Aplicación (Ejemplos)

**Envío de un mensaje de texto:**

1.  Usuario escribe en `MessageInput.jsx` y presiona enviar.
2.  `MessageInput.jsx` llama a la acción `sendMessage` de `useMessageStore`.
3.  `sendMessage` en `messageStore.js`:
    a.  Añade el mensaje del usuario al estado local y a `chatDB`.
    b.  Actualiza el título del chat si es el primer mensaje (vía `useChatListStore`).
    c.  Llama a la función `sendTextMessage` de `src/core/api/api.js`.
    d.  Al recibir respuesta, añade el mensaje del bot al estado y `chatDB`.
    e.  Si las respuestas de audio están activadas (vía `useSettingsStore`), llama a `speakText` de `settingsStore` para reproducir la respuesta.
4.  `MessageList.jsx` se actualiza mostrando los nuevos mensajes.

**Cambio de Tema:**

1.  Usuario hace clic en el botón de cambio de tema en `ChatHeader.jsx`.
2.  Se llama a la acción `toggleDarkMode` de `useSettingsStore`.
3.  El estado `darkMode` en `settingsStore` cambia.
4.  `App.jsx` (y otros componentes que usen `useThemeMode` o `useSettingsStore`) reaccionan al cambio, aplicando las clases CSS correspondientes para el tema oscuro/claro.

## Configuración y Ejecución

1.  **Clonar el repositorio.**
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar variables de entorno:**
    *   Copiar `.envExample` a `.env`.
    *   Ajustar las URLs del backend y cualquier API key necesaria en `.env`. (Ej: `VITE_API_URL`, `VITE_API_KEY`).
4.  **Ejecutar la aplicación en modo desarrollo:**
    ```bash
    npm run dev
    ```
    Esto iniciará la aplicación, generalmente en `http://localhost:3001`.

## Decisiones de Refactorización y Notas

*   **Arquitectura Orientada a Features**: Adoptada para mejorar la organización del código a medida que el proyecto crece.
*   **Stores de Zustand por Feature**: Se dividió el store global para una mejor separación de concerns.
*   **Servicio de API Centralizado**: Toda la comunicación con el backend se maneja a través de `src/core/api/api.js` usando una instancia configurada de Axios.
*   **Eliminación de LemonFoxTTS**: La funcionalidad de TTS de LemonFox fue eliminada debido a problemas técnicos persistentes que impedían su correcta integración y afectaban la estabilidad de la aplicación. La síntesis de voz ahora se basa en el motor TTS del navegador y un servicio API configurado.

### Optimizaciones y Mejoras (En Español)

Durante el proceso de refactorización, se aplicaron algunas optimizaciones y se identificaron áreas para futuras mejoras:

*   **Optimizaciones Aplicadas:**
    *   Se utilizó `React.memo` en todos los componentes de iconos (`src/shared/icons/`) para prevenir re-renderizados innecesarios de estos componentes puramente presentacionales.

*   **Componentes No Optimizados (Debido a Limitaciones Técnicas Durante la Refactorización Asistida):**
    *   `src/features/Chat/components/InitialScreen.jsx`
    *   `src/features/Chat/components/MessageList.jsx`
    *   `src/features/Chat/components/MessageInput.jsx`
    *   **Razón:** Durante la refactorización asistida por IA, se encontraron limitaciones con las herramientas de edición de código que impidieron aplicar `React.memo` a estos componentes o `useCallback` a las funciones que se les pasan como props.

*   **Mejoras Manuales Futuras Sugeridas:**
    *   **Aplicar `React.memo`:** Considerar envolver `InitialScreen.jsx`, `MessageList.jsx`, y `MessageInput.jsx` con `React.memo`. Para `MessageInput.jsx` y cualquier otro componente que reciba funciones como props, asegurarse de que dichas funciones estén memoizadas con `useCallback` en el componente padre para que `React.memo` sea efectivo.
    *   **Memoizar Callbacks en Hooks:** Revisar `useAudioRecorder.js` para asegurar que la función `toggleRecording` devuelta esté envuelta en `useCallback` si es necesario, para optimizar componentes que la consuman.
    *   **Documentación JSDoc Incompleta:** Debido a las mismas limitaciones de herramientas, no se pudo completar la documentación JSDoc para los siguientes archivos:
        *   `src/features/Chat/services/hardcodedResponses.js`
        *   `src/core/db/chatDB.js`
        Se recomienda añadir JSDoc a todas las funciones y métodos exportados en estos archivos para mejorar la mantenibilidad.

## Pruebas (Testing)

(Sección para futura documentación de estrategias de prueba, librerías, etc. Actualmente no se han añadido tests automatizados como parte de esta refactorización).
