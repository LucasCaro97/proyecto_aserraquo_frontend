import React from 'react'
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const useUsuario = () => {
    const [usuario, setUsuario] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    
        useEffect(() => {
        const obtenerUsuarioDelToken = () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const token = localStorage.getItem('authToken');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    setUsuario({ 
                        id: decodedToken.id, 
                        nombre: decodedToken.sub, 
                        rol: decodedToken.authorities
                    });
                } else {
                    setUsuario(null);
                    setError('No se encontró token de autenticación');
                }
            } catch (error) {
                console.error('Error al obtener usuario del token:', error);
                setError('Error al obtener información del usuario');
                setUsuario(null);
            } finally {
                setIsLoading(false);
            }
        };

        obtenerUsuarioDelToken();
    }, []);

   // Función para actualizar manualmente el usuario (útil después de login)
    const actualizarUsuario = () => {
        const obtenerUsuarioDelToken = () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const token = localStorage.getItem('authToken');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    setUsuario({ 
                        id: decodedToken.id, 
                        nombre: decodedToken.sub 
                    });
                } else {
                    setUsuario(null);
                }
            } catch (error) {
                console.error('Error al obtener usuario del token:', error);
                setError('Error al obtener información del usuario');
                setUsuario(null);
            } finally {
                setIsLoading(false);
            }
        };

        obtenerUsuarioDelToken();
    };

    // Función para limpiar el usuario (útil para logout)
    const limpiarUsuario = () => {
        setUsuario(null);
        setError(null);
        setIsLoading(false);
    };

    return {
        usuario,
        isLoading,
        error,
        actualizarUsuario,
        limpiarUsuario
    };
};