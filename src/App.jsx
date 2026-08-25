// src/App.jsx
import React from 'react';
import { LoginButton } from './component/LoginButton';
import { TokenSender } from './TokenSender';
import { useIsAuthenticated } from "@azure/msal-react";

function App() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Dashboard Frontend - Arquitectura Cloud OIDC</h1>
      <hr style={{ margin: '20px 0' }} />

      <div style={{ marginBottom: '20px' }}>
        <LoginButton />
      </div>

      {isAuthenticated ? (
        <TokenSender />
      ) : (
        <p style={{ color: '#605e5c', fontStyle: 'italic' }}>
          Inicia sesión con tu cuenta de Microsoft para habilitar el consumo del token hacia el API Gateway.
        </p>
      )}
    </div>
  );
}

export default App;