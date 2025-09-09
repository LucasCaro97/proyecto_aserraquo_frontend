import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const PrivateRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();
  
  if (isLoading) {
    // Muestra un mensaje de carga mientras se verifica el token
    return <div>Cargando...</div>; 
  }

  if (!isLoggedIn) {
    // Redirige al usuario al login si no está autenticado
    return <Navigate to="/login" replace />;
  }
  
  // Renderiza el componente hijo si el usuario está autenticado
  return children ? children : <Outlet />;
};