// src/TokenSender.jsx

import React, { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { apiRequest } from "./auth/AuthConfig";

// URL de nuestro API Gateway
const backendUrl = "https://l1rrd80so3.execute-api.us-east-1.amazonaws.com/desarrollo/api/v1";

export function TokenSender() {

    const { instance, accounts } = useMsal();

    const [tokenJWT, setTokenJWT] = useState("");
    const [apiResponse, setApiResponse] = useState("");
    const [loading, setLoading] = useState(false);

    // Obtener token de Azure
    const acquireAccessToken = async () => {

        const request = {
            ...apiRequest,
            account: accounts[0]
        };

        try {

            const response = await instance.acquireTokenSilent(request);

            return response.accessToken;

        } catch (silentError) {

            console.warn(
                "Fallo el token silencioso, redirigiendo a Azure:",
                silentError
            );

            sessionStorage.setItem(
                "msal_pending_api_call",
                "1"
            );

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

            if (!accessToken) return;

            setTokenJWT(accessToken);

            console.log(
                "Token JWT obtenido con éxito:",
                accessToken
            );

            // Enviar token al API Gateway
            const res = await fetch(backendUrl, {

                method: "GET",

                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }

            });

            const text = await res.text();

            let data;

            try {

                data = JSON.parse(text);

            } catch {

                data = text;

            }

            if (!res.ok) {

                setApiResponse(
                    `HTTP ${res.status} ${res.statusText}\n\n${
                        typeof data === "string"
                            ? data
                            : JSON.stringify(data, null, 2)
                    }`
                );

            } else {

                setApiResponse(
                    typeof data === "string"
                        ? data
                        : JSON.stringify(data, null, 2)
                );

            }

        } catch (error) {

            console.error(
                "Error al adquirir el token o consultar la API:",
                error
            );

            setApiResponse(
                "Error crítico de autenticación: " + error.message
            );

        } finally {

            setLoading(false);

        }
    };

    // Reintentar después de una redirección de Azure
    useEffect(() => {

        if (
            sessionStorage.getItem(
                "msal_pending_api_call"
            ) === "1"
        ) {

            sessionStorage.removeItem(
                "msal_pending_api_call"
            );

            handleGetTokenAndCallApi();

        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (accounts.length === 0) return null;

    return (

        <div
            style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '6px'
            }}
        >

            <h3>
                Prueba de envío de Token al Backend
            </h3>

            <p
                style={{
                    fontSize: '14px',
                    color: '#555'
                }}
            >

                Haz clic para obtener tu Token JWT de Azure y enviarlo en el header{' '}

                <code
                    style={{
                        background: '#eee',
                        padding: '2px 4px'
                    }}
                >
                    Authorization: Bearer &lt;token&gt;
                </code>.

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

                {
                    loading
                        ? "Obteniendo Token..."
                        : "Obtener Token y Enviar al Backend"
                }

            </button>

            {tokenJWT && (

                <div style={{ marginTop: '15px' }}>

                    <h4>
                        Token JWT Capturado:
                    </h4>

                    <textarea

                        readOnly

                        value={tokenJWT}

                        rows={4}

                        style={{
                            width: '100%',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            padding: '8px',
                            background: '#fff'
                        }}

                    />

                </div>

            )}

            {apiResponse && (

                <div style={{ marginTop: '15px' }}>

                    <h4>
                        Respuesta del Backend / API Gateway:
                    </h4>

                    <pre
                        style={{
                            background: '#333',
                            color: '#adff2f',
                            padding: '10px',
                            borderRadius: '4px',
                            overflowX: 'auto',
                            fontSize: '12px'
                        }}
                    >

                        {apiResponse}

                    </pre>

                </div>

            )}

        </div>

    );
}