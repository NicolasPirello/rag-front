# Aplicacion Front-End del Chat de Policia

Este repositorio se encuentra vinculado al repositorio https://gitlab.seguridadciudad.gob.ar/nicolas.pirello/ia-pc donde se encuentra la implementacion de la API junto con su Readme.


## 1.0 Configuración (Esto en caso de usar Ngrok para exponer la API Globalmente)

Es importante que en Vite se configuren ambos dominios expuestos por Ngrok (el de la API y el frontend) para evitar problemas de CORS. Además, en la aplicación React, la URL base (BASE_URL) debe ser la del túnel correspondiente a la API.

### Configuración del Chat en React

Configuración de Vite: En archivo **vite.config.js** debera verse similar a este:

```
import { defineConfig } from  'vite';

  
export  default  defineConfig({

server: {

host:  true, // Permite acceso desde cualquier IP

strictPort:  true,

port:  5173,

cors:  true, // Habilita CORS globalmente

allowedHosts: [
"https://tudominio-api.ngrok-free.app",
"https://tudominio-react.ngrok-free.app"
],

}

});
```
Aca es donde esta parte del codigo es de suma importancia para que el audio funcione y el motivo por el cual debemos llegar a ejecutar el proyecto asi es que si o si es necesario HTTPS para utilizar la funcion de Audio.

**allowedHosts: [
"https://tudominio-api.ngrok-free.app",
"https://tudominio-react.ngrok-free.app"
],**

Estas URL´s deben ser reemplazadas por las que sirve NGROK en el momento de ejecutarlo, ya que cada nueva ejecucion esas URL´s cambian.

-------------------------------------------------------------

### Configuración de la URL Base en React

En AudioRecorder.jsx, cambia BASE_URL:

const BASE_URL = "https://tudominio-api.ngrok-free.app"; (La URL que expone Ngrok con el puerto 5001 que correponde al de la API. El puerto 5173 pertenece al propio proyecto de React)

Dentro del componente AudioRecorder.jsx tenemos la opcion de elegir si queremos usar la API en Local (Sin pasar por Tunel de Ngrok, osea no funcionaria el audio) o usar el Tunel de NGROK
 
- true si querés usar ngrok
- false para LocalHost

**const  isNgrok  =  false**; // Cambia a true si querés usar ngrok, false para LocalHost

const  BASE_URL  =  isNgrok

?  "https://tudominio-api.ngrok-free.app"

:  "http://localhost:5001";

### Instalación y Ejecución del Chat
npm install
npm run dev
