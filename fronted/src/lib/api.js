// src/lib/api.js

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  login: async (usuario, contrasena) => {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contrasena }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error ${response.status}`);
    }
    
    return response.json();
  },

  health: async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.json();
  }
};

export const testConnection = async () => {
  try {
    const response = await fetch(API_BASE_URL, {
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch (error) {
    console.error('Error de conexión:', error);
    return false;
  }
  
};