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
  },

  // NUEVAS FUNCIONES PARA EVALUACIONES
  obtenerCursosInstructor: async (instructorId) => {
    const response = await fetch(`${API_BASE_URL}/api/instructor/cursos?instructorId=${instructorId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error ${response.status}`);
    }
    
    return response.json();
  },

  obtenerAlumnosCurso: async (cursoId) => {
    const response = await fetch(`${API_BASE_URL}/api/cursos/alumnos?cursoId=${cursoId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error ${response.status}`);
    }
    
    return response.json();
  },

  obtenerCalificacionesCurso: async (cursoId) => {
    const response = await fetch(`${API_BASE_URL}/api/evaluaciones/calificaciones?cursoId=${cursoId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error ${response.status}`);
    }
    
    return response.json();
  },

  guardarCalificacion: async (calificacionData) => {
    const response = await fetch(`${API_BASE_URL}/api/evaluaciones/guardar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(calificacionData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error ${response.status}`);
    }
    
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