// src/TokenSender.jsx
import React, { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { apiRequest } from "./auth/AuthConfig";

// URL del backend: se puede sobreescribir con VITE_API_URL en un archivo .env
// Ruta relativa "/api/v1": el proxy de Vite (vite.config.js) la reenvia a
// http://localhost:8080 evitando CORS. NO poner "localhost:8080/..." aqui,
// fetch lo interpretaria como URL invalida dentro del origen del frontend.
const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export function TokenSender() {
    const { instance, accounts } = useMsal();
    const [tokenJWT, setTokenJWT] = useState("");
    const [apiResponse, setApiResponse] = useState("");
    const [loading, setLoading] = useState(false);

    // Adquiere el token: primero silencioso y, si requiere interaccion
    // (ej. consentimiento de un scope nuevo), navega a Azure y vuelve.
    const acquireAccessToken = async () => {
        const request = {
            ...apiRequest,
            account: accounts[0]
        };

        try {
            const response = await instance.acquireTokenSilent(request);
            return response.accessToken;
        } catch (silentError) {
            console.warn("Fallo el token silencioso, redirigiendo a Azure:", silentError);
            sessionStorage.setItem("msal_pending_api_call", "1");
            await instance.acquireTokenRedirect(request);
            return null;
        }
    };

    const handleGetTokenAndCallApi = async () => {
        if (accounts.length === 0) return;

        setLoading(true);
        setApiResponse("");

        try {
            const accessToken = await acquireAccessToken();
            // Si es null, se inicio una redireccion a Azure: al volver, el
            // efecto de abajo reejecuta esta funcion automaticamente.
            if (!accessToken) return;
            setTokenJWT(accessToken);
            console.log("Token JWT obtenido con éxito:", accessToken);

            // Enviar el token al Backend / API Gateway mediante Authorization: Bearer
            const res = await fetch(backendUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            });

            // El backend puede responder texto plano o JSON; se parsea de forma tolerante.
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }

            if (!res.ok) {
                setApiResponse(`HTTP ${res.status} ${res.statusText}\n\n${typeof data === "string" ? data : JSON.stringify(data, null, 2)}`);
            } else {
                setApiResponse(typeof data === "string" ? data : JSON.stringify(data, null, 2));
            }

        } catch (error) {
            console.error("Error al adquirir el token o consultar la API:", error);
            setApiResponse("Error crítico de autenticación: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Si la pagina recargo por una redireccion de consentimiento, reejecuta
    // automaticamente la llamada que quedo pendiente.
    useEffect(() => {
        if (sessionStorage.getItem("msal_pending_api_call") === "1") {
            sessionStorage.removeItem("msal_pending_api_call");
            handleGetTokenAndCallApi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (accounts.length === 0) return null;

    return (
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '6px' }}>
            <h3>Prueba de envío de Token al Backend</h3>
            <p style={{ fontSize: '14px', color: '#555' }}>
                Haz clic para obtener tu Token JWT de Azure y enviarlo en el header <code style={{ background: '#eee', padding: '2px 4px' }}>Authorization: Bearer &lt;token&gt;</code>.
            </p>

            <button
                onClick={handleGetTokenAndCallApi}
                disabled={loading}
                style={{
                    backgroundColor: '#107c10',
                    color: 'white',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginTop: '10px'
                }}
            >
                {loading ? "Obteniendo Token..." : "Obtener Token y Enviar al Backend"}
            </button>

            {tokenJWT && (
                <div style={{ marginTop: '15px' }}>
                    <h4>Token JWT Capturado:</h4>
                    <textarea
                        readOnly
                        value={tokenJWT}
                        rows={4}
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '11px', padding: '8px', background: '#fff' }}
                    />
                </div>
            )}

            {apiResponse && (
                <div style={{ marginTop: '15px' }}>
                    <h4>Respuesta del Backend / API Gateway:</h4>
                    <pre style={{ background: '#333', color: '#adff2f', padding: '10px', borderRadius: '4px', overflowX: 'auto', fontSize: '12px' }}>
                        {apiResponse}
                    </pre>
                </div>
            )}
        </div>
    );
}
