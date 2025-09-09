import React from 'react'

export const obtenerDiaDeLaSemana = (fechaString) => {
  const diasDeLaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const fecha = new Date(fechaString + 'T00:00:00'); // Añadimos la hora para evitar problemas de zona horaria
  return diasDeLaSemana[fecha.getDay()];
}
