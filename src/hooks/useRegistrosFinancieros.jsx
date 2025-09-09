import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useRegistrosFinancieros = (autoLoad = true) => {
    const [registrosDisponibles, setRegistrosDisponibles] = useState([]);
    const [isLoadingRegistros, setIsLoadingRegistros] = useState(false);
    const [error, setError] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL;

    const cargarRegistrosFinancieros = useCallback(async () => {
        setIsLoadingRegistros(true);
        setError('');
        
        try {
            const response = await axios.get(`${apiUrl}/registro-financiero/sorted-top10-desc`);
            setRegistrosDisponibles(response.data);
            return response.data;
        } catch (error) {
            console.error('Error al cargar registros financieros:', error);
            const errorMessage = 'Error al cargar los registros financieros diarios';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoadingRegistros(false);
        }
    }, [apiUrl]);

    // Auto-cargar registros si autoLoad es true
    useEffect(() => {
        if (autoLoad) {
            cargarRegistrosFinancieros();
        }
    }, [autoLoad, cargarRegistrosFinancieros]);

    // Función para crear un registro del día actual
    const crearRegistroDelDia = useCallback(async () => {
        setError('');
        
        try {
            const fechaHoy = new Date().toISOString().split('T')[0];
            const response = await axios.post(`${apiUrl}/registro-financiero`, { fecha: fechaHoy });
            
            // Recargar la lista después de crear el registro
            await cargarRegistrosFinancieros();
            
            return response.data;
        } catch (error) {
            console.error('Error al crear registro del día:', error);
            
            let errorMessage = 'Error al crear el registro del día actual';
            if (error.response?.status === 400 && error.response?.data?.errorMessage?.includes('Ya existe')) {
                errorMessage = 'Ya existe un registro para el día de hoy';
            }            
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [apiUrl, cargarRegistrosFinancieros]);

    // Función para limpiar errores
    const clearError = useCallback(() => {
        setError('');
    }, []);

    return {
        registrosDisponibles,
        isLoadingRegistros,
        error,
        cargarRegistrosFinancieros,
        crearRegistroDelDia,
        clearError
    };
};