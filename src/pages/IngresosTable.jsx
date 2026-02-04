import React, { useState, useEffect, useMemo } from 'react';
import {
    Eye,
    DollarSign,
    Calendar,
    User,
    FileText,
    Search,
    Filter,
    Download,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    CornerDownLeft,
    Trash2
} from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import { obtenerFechaActual } from '../hooks/obtenerFechaActual';
import axios from 'axios';
import Swal from 'sweetalert2';

export const IngresosTable = ({ onEdit, onView }) => {
    // Estados principales
    const [todosLosIngresos, setTodosLosIngresos] = useState([]); // Datos originales del servidor
    const [tiposDeIngreso, setTiposDeIngreso] = useState([]); // Tipos de ingreso para el filtro
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fechaActual = obtenerFechaActual();

    // Estados de filtros y búsqueda
    const [filtroTipoIngreso, setFiltroTipoIngreso] = useState('');
    const [filtroUsuario, setFiltroUsuario] = useState('');
    const [busquedaObservacion, setBusquedaObservacion] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    // NUEVOS ESTADOS PARA FILTROS POR SERVIDOR
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    // Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Hook personalizado para obtener el usuario
    const { usuario } = useUsuario();

    //1- Función para cargar todos los ingresos del dia actual
    const cargarTodosLosIngresos = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.get(`${apiUrl}/ingreso/fecha/${fechaActual}`);
            setTodosLosIngresos(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
            setError('Error al cargar los registros de ingresos');
        } finally {
            setIsLoading(false);
        }
    };

    //2- Carga de datos por rango de fechas
    const buscarPorRangoFechas = async () => {
        if (!fechaInicio || !fechaFin) {
            setError('Debes seleccionar ambas fechas para filtrar');
            setTimeout(() => setError(''), 5000);
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            // Petición a la API usando pathVariables: /api/egreso/rango/YYYY-MM-DD/YYYY-MM-DD
            const response = await axios.get(`${apiUrl}/ingreso/fecha-between/${fechaInicio}/${fechaFin}`);
            setTodosLosIngresos(response.data.data || response.data);
            setSuccess(`Mostrando registros desde ${fechaInicio} hasta ${fechaFin}`);
        } catch (error) {
            console.error(error);
            setError('Error al buscar registros en el rango seleccionado');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para cargar los tipos de ingreso (para el select de filtro)
    const cargarTiposDeIngreso = async () => {
        try {
            const response = await axios.get(`${apiUrl}/tipo-ingreso`);
            setTiposDeIngreso(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar tipos de ingreso:', error);
        }
    };

    // Efecto para cargar datos iniciales una sola vez
    useEffect(() => {
        cargarTodosLosIngresos();
        cargarTiposDeIngreso();
    }, []);

    // Limpiar filtros y volver a hoy
    const restablecerYHoy = () => {
        setFechaInicio('');
        setFechaFin('');
        cargarTodosLosIngresos();
        setSuccess(null)
    };

    // Funciones de formato
    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        const partes = fechaString.split('-');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    };

    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(valor);
    };

    const handleDelete = async (id) => {
        // 1. Solicitar motivo con SweetAlert2
        const { value: motivo } = await Swal.fire({
            title: '¿Confirmar eliminación?',
            text: "Si la operación contiene cheques asociados, estos serán liberados. Por favor, indica el motivo:",
            icon: 'warning',
            input: 'text',
            inputPlaceholder: 'Escribe el motivo de la eliminación aquí...',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return '¡Es obligatorio indicar un motivo para auditar la eliminación!';
                }
            }
        });

        // 2. Si el usuario confirmó y escribió un motivo
        if (motivo) {
            try {
                setIsLoading(true);

                // 3. Petición DELETE enviando el objeto con la propiedad observacionEliminado
                const response = await axios.delete(`${apiUrl}/ingreso/safeDelete/${id}`, {
                    data: motivo
                }
                );

                if (response.status === 200) {
                    // 4. Actualizar la lista localmente
                    setTodosLosIngresos((prevIngresos) => prevIngresos.filter((ingreso) => ingreso.id !== id));

                    // 5. Alerta de éxito profesional
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'El ingreso ha sido borrado con éxito.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            } catch (err) {
                console.error("Error al eliminar el ingreso:", err);
                Swal.fire('Error', 'No se pudo completar la operación.', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Registros de Ingresos</h1>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Filter className="h-4 w-4" /> <span>Filtrar por Fecha</span>
                        </button>
                        <button onClick={restablecerYHoy} className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> <span>Hoy</span>
                        </button>
                    </div>
                </div>

                {/* Mensajes de error/éxito con estilos Tailwind centrados */}
                {(error || success) && (
                    <div className="flex justify-center mb-6">
                        <div className={`flex items-center px-4 py-2 rounded-full border shadow-sm ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                            {error ? <AlertCircle className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            <span className="text-sm font-medium">{error || success}</span>
                        </div>
                    </div>
                )}

                {/* Panel de Filtros por Rango */}
                {mostrarFiltros && (
                    <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={buscarPorRangoFechas}
                                    disabled={!fechaInicio || !fechaFin || isLoading}
                                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${!fechaInicio || !fechaFin ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                >
                                    {isLoading ? 'Buscando...' : 'Aplicar Filtro'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla Principal */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Cargando servidor...</span>
                        </div>
                    ) : todosLosIngresos.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl">
                            <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {!fechaInicio && !fechaFin ? "No hay ingresos registrados hoy" : "No hay resultados en este rango"}
                            </h3>
                            <p className="text-gray-500">Intenta buscar en otras fechas o actualizar la vista.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observación</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {todosLosIngresos.map((ingreso) => (
                                        <tr key={ingreso.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className='flex items-center justify-center w-10 h-10 border-2 rounded-lg  border-gray-100 bg-gray-400'> {ingreso.id} </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatearFecha(ingreso.registroFinancieroDiario?.fecha)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-green-600">
                                                {formatearMoneda(ingreso.monto)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {ingreso.tipoIngreso?.nombre || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 italic">
                                                {ingreso.observacion || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <Trash2 onClick={() => handleDelete(ingreso.id)} className="h-4 w-4 text-red-600 hover:text-red-900 rounded-md hover:bg-red-100 transition-colors" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};