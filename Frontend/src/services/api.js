
import axios from 'axios';

// URL base: cambia esto cuando hagas deploy a producción
const API_URL = 'http://localhost:8000';

// Instancia de Axios configurada para cookies HttpOnly
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ CRÍTICO: Permite enviar/recibir cookies
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Sesión expirada o token inválido
      console.warn('Sesión no válida - redirigir a login');
      // Opcional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;