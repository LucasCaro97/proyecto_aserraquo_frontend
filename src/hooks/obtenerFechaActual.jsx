import React, { useEffect, useState } from 'react'

export const obtenerFechaActual = (refreshMs = 60000) => {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const [formattedDate, setFormattedDate] = useState(formatDate(new Date()));

  useEffect(() => {
    // Actualiza la fecha en el intervalo definido
    const interval = setInterval(() => {
      setFormattedDate(formatDate(new Date()));
    }, refreshMs);

    return () => clearInterval(interval);
  }, [refreshMs]);
  
    return formattedDate;
}
