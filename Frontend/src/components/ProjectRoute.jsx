// frontend/src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../services/api";

export function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ✅ Intenta obtener datos del usuario desde /auth/me
        // La cookie se envía automáticamente gracias a withCredentials: true
        await api.get("/auth/me");
        setIsAuthenticated(true);
      } catch (error) {
        // ❌ Si falla (401), el usuario no está autenticado
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  // ⏳ Mientras verifica, muestra estado de carga (opcional pero recomendado)
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // 🔒 Si no está autenticado, redirigir al login guardando la ruta original
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Si está autenticado, renderizar el contenido protegido
  return children;
}