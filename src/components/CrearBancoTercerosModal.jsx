import React, { useState } from 'react';
import axios from 'axios';
// Asumo que sigues usando 'lucide-react' para los íconos
import { X, Loader2 } from 'lucide-react'; 

// Componente Modal para dar de alta un Banco de Terceros
const CrearBancoTerceroModal = ({ isOpen, onClose, onSuccess }) => {
    // URL de la API (la tomamos del entorno como en ChequesForm)
    const apiUrl = import.meta.env.VITE_API_URL; 
    const [nombre, setNombre] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Si no está abierto, no renderizar nada
    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!nombre.trim()) {
            setError("El nombre del banco es obligatorio.");
            setLoading(false);
            return;
        }

        try {
            // Petición POST a la API
            const response = await axios.post(`${apiUrl}/banco-terceros`, {
                nombre: nombre.trim()
            });
            
            // Éxito: limpiar el estado, cerrar el modal, y notificar al padre
            setNombre('');
            onSuccess(response.data); // Llama a la función del padre para refrescar la lista
            
        } catch (err) {
            console.error("Error al crear banco:", err);
            const errorMessage = err.response
                ? `Error ${err.response.data.errorCode}: ${err.response.data.errorMessage || 'Fallo de la API al crear banco.'}`
                : 'Error de red o conexión al servidor.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Estructura básica de un modal con fondo semi-transparente
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
                <h3 className="text-lg font-bold mb-4">Dar de Alta Banco de Terceros</h3>
                
                {/* Botón de cerrar */}
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>

                <form onSubmit={handleSubmit}>
                    {/* Campo Nombre */}
                    <div className="mb-4">
                        <label htmlFor="nombreBanco" className="block text-sm font-medium text-gray-700">
                            Nombre del Banco
                        </label>
                        <input
                            type="text"
                            id="nombreBanco"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Mensaje de error */}
                    {error && (
                        <div className="text-red-500 text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {/* Botón de envío */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                    Creando...
                                </>
                            ) : 'Crear Banco'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearBancoTerceroModal;