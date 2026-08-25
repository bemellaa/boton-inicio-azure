// src/LoginButton.jsx
import React from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth/AuthConfig";

export function LoginButton() {
    const { instance, accounts } = useMsal();

    const handleLogin = () => {
        // Flujo por redireccion: navega a la pagina de login de Microsoft y vuelve a la app.
        // Es mas fiable que el popup (evita bloqueos del navegador y popups que no se cierran).
        instance.loginRedirect(loginRequest).catch(e => {
            console.error("Error en el inicio de sesión:", e);
        });
    };

    const handleLogout = () => {
        // Cierra sesión
        instance.logoutRedirect().catch(e => {
            console.error("Error al cerrar sesión:", e);
        });
    };

    // Si ya hay una cuenta activa, muestra el nombre y el botón de salir
    if (accounts.length > 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '14px', color: '#333' }}>
                    Hola, <strong>{accounts[0].name}</strong>
                </span>
                <button 
                    onClick={handleLogout}
                    style={{
                        backgroundColor: '#d83b01',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Cerrar Sesión
                </button>
            </div>
        );
    }

    // Si no ha iniciado sesión, muestra el botón oficial de Microsoft
    return (
        <button 
            onClick={handleLogin}
            style={{
                backgroundColor: '#2f2f2f',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}
        >
            {/* Pequeño icono simulado de Microsoft */}
            <span style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 6px)', gap: '2px' }}>
                <span style={{ backgroundColor: '#f25022', width: '6px', height: '6px' }}></span>
                <span style={{ backgroundColor: '#7fba00', width: '6px', height: '6px' }}></span>
                <span style={{ backgroundColor: '#00a4ef', width: '6px', height: '6px' }}></span>
                <span style={{ backgroundColor: '#ffb900', width: '6px', height: '6px' }}></span>
            </span>
            Iniciar sesión con Microsoft
        </button>
    );
}