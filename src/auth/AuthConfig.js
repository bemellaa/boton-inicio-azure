export const msalConfig = {
    auth: {
        clientId: "e5ece131-cd6a-469c-b21b-c69aa689316f",       // Reemplaza con el Application (client) ID de tu registro en Azure AD / Entra ID
        authority: "https://login.microsoftonline.com/e5372bf0-c5e3-4286-887c-79069f209c1f", // Reemplaza con tu Directory (tenant) ID o usa "common" si es multi-tenant
        redirectUri: "http://localhost:5173",    // Debe coincidir exactamente con la URL configurada en las Redirect URIs de Azure
        postLogoutRedirectUri: "http://localhost:5173",
    },
    cache: {
        cacheLocation: "sessionStorage",         // Dónde se guardan los datos de la sesión ("sessionStorage" o "localStorage")
        storeAuthStateInCookie: false,           // Set to true if you have issues on older browsers
    },
};

// Permisos (scopes) que solicitas al iniciar sesion
export const loginRequest = {
    scopes: ["User.Read"] // Permiso basico para leer el perfil del usuario autenticado de Microsoft Graph
};

// Scopes para consumir TU PROPIO backend (resource server).
// Requiere haber configurado "Expose an API" en el registro de la app en Azure:
// Application ID URI: api://e5ece131-cd6a-469c-b21b-c69aa689316f y scope .read-write .
// Un token con este scope SI es un JWT firmado por el tenant que Spring puede validar;
// los de Graph vienen encriptados y siempre fallarian.
export const apiRequest = {
    scopes: ["api://e5ece131-cd6a-469c-b21b-c69aa689316f/desarrollo/read-wride"]
};