import React, { useState, useEffect, useMemo } from 'react';
import {
    Eye,
    Trash2,
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
    CornerUpRight, // Icono representativo para egresos
    Wallet, // Nuevo Icono para Cheques
} from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import { obtenerFechaActual } from '../hooks/obtenerFechaActual';
import axios from 'axios';
import Swal from 'sweetalert2';

export const EgresosTable = () => {
    // Estados principales
    const [todosLosEgresos, setTodosLosEgresos] = useState([]); // Datos originales del servidor
    const [tiposDeEgreso, setTiposDeEgreso] = useState([]); // Tipos de egreso para el filtro
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fechaActual = obtenerFechaActual();

    // Estados de filtros y búsqueda
    const [filtroTipoEgreso, setFiltroTipoEgreso] = useState('');
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

    //1- Función para cargar todos los egresos del dia actual
    const cargarTodosLosEgresos = async () => {
        setIsLoading(true);
        setError('');

        try {
            // Nota: Se asume que el backend devuelve el campo 'chequeResumen' en cada egreso
            const response = await axios.get(`${apiUrl}/egreso/fecha/${fechaActual}`);
            setTodosLosEgresos(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar egresos:', error);
            setError('Error al cargar los registros de egresos');
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
            const response = await axios.get(`${apiUrl}/egreso/fecha-between/${fechaInicio}/${fechaFin}`);
            setTodosLosEgresos(response.data.data || response.data);
            setSuccess(`Mostrando registros desde ${fechaInicio} hasta ${fechaFin}`);
        } catch (error) {
            console.error(error);
            setError('Error al buscar registros en el rango seleccionado');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para cargar los tipos de egreso (para el select de filtro)
    const cargarTiposDeEgreso = async () => {
        try {
            const response = await axios.get(`${apiUrl}/tipo-egreso`);
            setTiposDeEgreso(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar tipos de egreso:', error);
        }
    };

    // Efecto para cargar datos iniciales una sola vez
    useEffect(() => {
        cargarTodosLosEgresos();
        cargarTiposDeEgreso();
    }, []);

    // Limpiar filtros y volver a hoy
    const restablecerYHoy = () => {
        setFechaInicio('');
        setFechaFin('');
        cargarTodosLosEgresos();
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

    // Función MODIFICADA para renderizar los cheques
    const renderCheques = (cheques) => {
        // Usamos chequeResumen
        if (!cheques || cheques.length === 0) {
            return (
                <span className="text-xs text-gray-500 flex items-center">
                    <Wallet className="h-3 w-3 mr-1" /> Ninguno
                </span>
            );
        }

        // Mostrar solo los primeros 3 números de cheque
        const chequesVisibles = cheques.slice(0, 3);
        const chequesRestantes = cheques.length - 3;

        return (
            <div className="flex flex-col space-y-1">
                {chequesVisibles.map((cheque) => (
                    // Renderizamos el nroCheque. Si es null, usamos el ID.
                    <span
                        key={cheque.id}
                        className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block"
                        title={`Monto: ${formatearMoneda(cheque.monto)}`} // Tooltip para ver el monto
                    >
                        {cheque.numeroCheque || `ID: ${cheque.id}`}
                    </span>
                ))}
                {chequesRestantes > 0 && (
                    <span className="text-xs text-gray-500 mt-1">
                        + {chequesRestantes} más
                    </span>
                )}
            </div>
        );
    };

    const handleDelete = async (id) => {
        const { value: motivo } = await Swal.fire({
            title: '¿Confirmar eliminación?',
            text: "Por favor, indica el motivo:",
            icon: 'warning',
            input: 'text',
            inputPlaceholder: 'Escribe el motivo aquí...',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return '¡Es obligatorio indicar un motivo!';
                }
            }
        });

        // Si el usuario confirma y escribe un motivo
        if (motivo) {
            try {
                // Enviamos el motivo en el cuerpo (body) de la petición
                // Nota: Verifica si tu backend espera el motivo en el body o como Query Param
                const response = await axios.delete(`${apiUrl}/egreso/safeDelete/${id}`, {
                    data: motivo,
                });

                if (response.status === 200) {
                    // Actualizamos la lista localmente
                    setTodosLosEgresos(prev => prev.filter(egreso => egreso.id !== id));

                    // Alerta de éxito elegante
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'El registro ha sido borrado con éxito.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            } catch (err) {
                console.error("Error al eliminar:", err);
                Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Registros de Egresos</h1>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Filter className="h-4 w-4" /> <span>Filtrar por Fecha</span>
                        </button>
                        <button onClick={cargarTodosLosEgresos} className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg">
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

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {isLoading ? (
                        <div className="py-12 text-center text-gray-600">Cargando datos del servidor...</div>
                    ) : todosLosEgresos.length === 0 ? (
                        <div className="text-center py-12 bg-white">
                            <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {!fechaInicio && !fechaFin
                                    ? "No hay registros cargados hoy"
                                    : "No hay registros en el rango seleccionado"}
                            </h3>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                {!fechaInicio && !fechaFin
                                    ? `Aún no se han realizado egresos en la fecha ${formatearFecha(fechaActual)}.`
                                    : "Intenta ajustar las fechas de búsqueda para encontrar lo que necesitas."}
                            </p>
                            {!fechaInicio && !fechaFin && (
                                <button
                                    onClick={() => setMostrarFiltros(true)}
                                    className="mt-4 text-blue-600 hover:underline text-sm font-medium"
                                >
                                    Buscar en fechas anteriores
                                </button>
                            )}
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheques</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {todosLosEgresos.map((egreso) => (
                                        <tr key={egreso.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className='flex items-center justify-center w-10 h-10 border-2 rounded-lg  border-gray-100 bg-gray-400'> {egreso.id} </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatearFecha(egreso.registroFinancieroDiario?.fecha)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-red-600">
                                                {formatearMoneda(egreso.monto)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {egreso.tipoEgreso?.nombre}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {egreso.chequeResumen?.length > 0 ? (
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                                                        {egreso.chequeResumen.length} Cheques
                                                    </span>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <Trash2 onClick={() => handleDelete(egreso.id)} className="h-4 w-4 text-red-600 hover:text-red-900 rounded-md hover:bg-red-100 transition-colors" />
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
    );
};