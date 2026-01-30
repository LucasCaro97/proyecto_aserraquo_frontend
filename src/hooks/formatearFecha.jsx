import { useCallback } from "react";

export const useFechaFormateador = () => {

    //Crea la fecha ignorando UTC
    const parsearFechaLocal = useCallback( (fechaStr) => {
        if (!fechaStr) return null;
        
        const [year, month, day] = fechaStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }, []);

    //Formatea directamente sin pasar por objetos Date complejos
   const formatearFechaSimple = useCallback((fechaStr) => {
    if(!fechaStr) return '—';
    const [year, month, day] = fechaStr.split('-');
    return `${parseInt(day)}/${parseInt(month)}/${year}`;
    }, []);
    
    return { formatearFecha: formatearFechaSimple, parsearFechaLocal };
}
