// src/components/CrearRegistroModal.jsx
import { useState } from 'react';
import { Calendar, Save, X, AlertCircle } from 'lucide-react';
// 💡 Importaciones de react-datepicker
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Importa los estilos CSS
import { es } from 'date-fns/locale'; // Importa la localización en español

// Función auxiliar: Devuelve un objeto Date de hoy
const getTodayDate = () => {
    // Usamos un objeto Date para la librería de selección
    return new Date(); 
};

// Función auxiliar para formatear Date a string YYYY-MM-DD (para la API)
const formatDateForApi = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // Esto asegura que la API reciba 'YYYY-MM-DD'
    return `${year}-${month}-${day}`; 
};

export const CrearRegistroModal = ({ isOpen, onClose, onCrearRegistro, isCreating, error }) => {
    // El estado ahora guarda un objeto Date
    const [fechaSeleccionada, setFechaSeleccionada] = useState(getTodayDate());

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convertir el objeto Date seleccionado a string 'YYYY-MM-DD' para la función API
        const fechaApi = formatDateForApi(fechaSeleccionada);
        onCrearRegistro(fechaApi);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                        Crear Registro Diario
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-700">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Fecha
                        </label>
                        <div className="relative">
                            {/* 💡 Uso del componente DatePicker */}
                            <DatePicker
                                id="fecha"
                                selected={fechaSeleccionada}
                                onChange={(date) => setFechaSeleccionada(date)}
                                // Establece el formato de visualización en DD/MM/YYYY
                                dateFormat="dd/MM/yyyy" 
                                // Establece la localización para usar nombres de días/meses en español
                                locale={es} 
                                // Clase para que el input se vea como el resto de tus formularios
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                            />
                            
                            {/* Icono de Calendario */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isCreating}
                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-colors ${
                            isCreating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                    >
                        {isCreating ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Creando...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5 mr-2" />
                                Crear Registro
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};