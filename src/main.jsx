// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./auth/AuthConfig";

// =====================================================================
// Simula window.crypto.subtle para entornos HTTP en IP
// =====================================================================
if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.subtle)) {
  window.crypto = window.crypto || {};
  window.crypto.subtle = {
    digest: async (algo, data) => {
      // Stub seguro básico para permitir pasar la validación inicial de MSAL
      const msgBuffer = new TextEncoder().encode("msal-http-mock");
      return crypto.subtle ? await crypto.subtle.digest(algo, data) : msgBuffer.buffer;
    },
    generateKey: async () => ({}),
    sign: async () => new ArrayBuffer(32),
    verify: async () => true,
    encrypt: async () => new ArrayBuffer(32),
    decrypt: async () => new ArrayBuffer(32),
  };
}
// =====================================================================

const msalInstance = new PublicClientApplication(msalConfig);

// Registro de fallos interactivos (login/acquireToken) en consola con detalle.
msalInstance.addEventCallback((event) => {
  if (
    event.eventType === EventType.LOGIN_FAILURE ||
    event.eventType === EventType.ACQUIRE_TOKEN_FAILURE
  ) {
    console.error("Fallo de MSAL:", event.error);
  }
});

function mostrarErrorPantalla(titulo, detalle) {
  document.getElementById('root').innerHTML =
    '<div style="font-family:Arial;padding:20px">' +
    `<h3 style="color:#d83b01">${titulo}</h3>` +
    `<pre style="background:#f3f2f1;padding:10px;border-radius:4px;white-space:pre-wrap">` +
    `${detalle}\n\nRecarga la pagina para reintentar. Si el error menciona AADSTS650053 o AADSTS65001,\nrevisa la configuracion de "Expose an API" en el registro de la aplicacion de Azure.` +
    '</pre></div>';
}

function detalleError(error) {
  return [
    `codigo: ${error?.errorCode ?? "(sin codigo)"}`,
    `mensaje: ${error?.errorMessage ?? error?.message}`,
    `correlationId: ${error?.correlationId ?? "(sin correlationId)"}`,
    error?.errorDescription ? `descripcion: ${error.errorDescription}` : ""
  ].filter(Boolean).join("\n");
}

async function bootstrap() {
  // MSAL exige inicializar la instancia antes de cualquier interaccion.
  await msalInstance.initialize();

  // Procesa la respuesta si regresamos de una redireccion de Azure (login o consentimiento).
  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      console.info("Autenticacion por redirect completada:", {
        usuario: response.account?.username,
        scopes: response.scopes
      });
    }
  } catch (error) {
    // Un fallo del protocolo (scope inexistente, consentimiento denegado, etc.)
    // llega aqui con el detalle en la descripcion: se muestra y se detiene.
    console.error("Error al procesar la respuesta de Azure:", error);
    window.history.replaceState(null, "", window.location.pathname);
    mostrarErrorPantalla("Azure devolvio un error al procesar el token", detalleError(error));
    return;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </React.StrictMode>
  );
}

bootstrap().catch((error) => {
  console.error("Error al inicializar MSAL:", error);
  mostrarErrorPantalla("No se pudo inicializar la autenticación de Azure", detalleError(error));
});