import { useState, useEffect, useMemo } from 'react';
import {
    Eye,
    DollarSign,
    Calendar,
    Search,
    Filter,
    Download,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Banknote,
    Building2,
    FileText
} from 'lucide-react';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import axios from 'axios';

export const HistorialBancarioTable = ({ onEdit, onView }) => {
    // Estados principales
    const [todosLosRegistros, setTodosLosRegistros] = useState([]);
    const [bancosDisponibles, setBancosDisponibles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados de filtros y búsqueda
    const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
    const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
    const [filtroBanco, setFiltroBanco] = useState('');
    const [busquedaObservacion, setBusquedaObservacion] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    // Estados de paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

    // Estados de ordenamiento
    const [ordenarPor, setOrdenarPor] = useState('fecha');
    const [tipoOrden, setTipoOrden] = useState('desc');

    // Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Función para cargar todos los registros de historial bancario
    const cargarTodosLosRegistros = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.get(`${apiUrl}/historial-saldo`);
            setTodosLosRegistros(response.data || []);
        } catch (error) {
            console.error('Error al cargar historial bancario:', error);
            setError('Error al cargar los registros de historial bancario');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para cargar los bancos disponibles (para el select de filtro)
    const cargarBancosDisponibles = async () => {
        try {
            const response = await axios.get(`${apiUrl}/banco/activos`);
            setBancosDisponibles(response.data || []);
        } catch (error) {
            console.error('Error al cargar bancos:', error);
        }
    };

    // Efecto para cargar datos iniciales una sola vez
    useEffect(() => {
        cargarTodosLosRegistros();
        cargarBancosDisponibles();
    }, []);

    // Función para filtrar los datos en el cliente
    const datosFiltrados = useMemo(() => {
        let datos = [...todosLosRegistros];

        // Convertir las fechas de filtro a objetos Date para una comparación precisa
        const fechaDesde = filtroFechaDesde ? new Date(filtroFechaDesde) : null;
        const fechaHasta = filtroFechaHasta ? new Date(filtroFechaHasta) : null;

        // Aplicar filtro de fecha
        if (fechaDesde || fechaHasta) {
            datos = datos.filter(registro => {
                const fechaRegistro = new Date(registro.registroFinancieroDiario.fecha);
                let cumpleDesde = true;
                let cumpleHasta = true;

                if (fechaDesde) {
                    cumpleDesde = fechaRegistro >= fechaDesde;
                }
                if (fechaHasta) {
                    cumpleHasta = fechaRegistro <= fechaHasta;
                }
                return cumpleDesde && cumpleHasta;
            });
        }
        
        // Aplicar filtro de banco
        if (filtroBanco) {
            datos = datos.filter(registro =>
                registro.banco?.nombre === filtroBanco
            );
        }
    
        return datos;
    }, [todosLosRegistros, filtroFechaDesde, filtroFechaHasta, filtroBanco]);

    // Función para ordenar los datos en el cliente
    const datosOrdenados = useMemo(() => {
        const datosParaOrdenar = [...datosFiltrados];

        return datosParaOrdenar.sort((a, b) => {
            let valorA, valorB;

            switch (ordenarPor) {
                case 'fecha':
                    valorA = new Date(a.fechaRegistro);
                    valorB = new Date(b.fechaRegistro);
                    break;
                case 'monto':
                    valorA = a.saldo;
                    valorB = b.saldo;
                    break;
                case 'banco':
                    valorA = a.banco?.nombre || '';
                    valorB = b.banco?.nombre || '';
                    break;
                default:
                    valorA = a[ordenarPor];
                    valorB = b[ordenarPor];
            }

            // Comparación
            if (valorA < valorB) return tipoOrden === 'asc' ? -1 : 1;
            if (valorA > valorB) return tipoOrden === 'asc' ? 1 : -1;
            return 0;
        });
    }, [datosFiltrados, ordenarPor, tipoOrden]);

    // Datos paginados
    const datosPaginados = useMemo(() => {
        const inicio = (paginaActual - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;
        return datosOrdenados.slice(inicio, fin);
    }, [datosOrdenados, paginaActual, registrosPorPagina]);

    // Reset de página cuando cambien los filtros
    useEffect(() => {
        setPaginaActual(1);
    }, [filtroFechaDesde, filtroFechaHasta, filtroBanco, busquedaObservacion]);

    // Función para limpiar filtros
    const limpiarFiltros = () => {
        setFiltroFechaDesde('');
        setFiltroFechaHasta('');
        setFiltroBanco('');
        setBusquedaObservacion('');
        setPaginaActual(1);
    };

    // Función para manejar el ordenamiento
    const handleOrdenar = (campo) => {
        if (ordenarPor === campo) {
            setTipoOrden(tipoOrden === 'asc' ? 'desc' : 'asc');
        } else {
            setOrdenarPor(campo);
            setTipoOrden('desc');
        }
        setPaginaActual(1);
    };

    // Función para exportar datos
    const exportarDatos = () => {
        try {
            const datosParaExportar = datosOrdenados;
            const csvContent = "data:text/csv;charset=utf-8," +
                "Fecha,Dia,Banco,Saldo\n" +
                datosParaExportar.map(registro =>
                    `${formatearFecha(registro.registroFinancieroDiario.fecha)},` +
                    `${obtenerDiaDeLaSemana(registro.fechaRegistro)},` +
                    `"${registro.banco?.nombre || 'N/A'}",` +
                    `${registro.saldo}`
                ).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `historial_bancario_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSuccess('Datos exportados exitosamente');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error al exportar los datos');
            setTimeout(() => setError(''), 3000);
        }
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

    // Cálculos de paginación
    const totalRegistros = datosOrdenados.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    const indiceInicio = totalRegistros === 0 ? 0 : (paginaActual - 1) * registrosPorPagina + 1;
    const indiceFin = Math.min(paginaActual * registrosPorPagina, totalRegistros);

    // Función para renderizar el ícono de ordenamiento
    const renderIconoOrden = (campo) => {
        if (ordenarPor !== campo) {
            return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
        }
        return tipoOrden === 'asc'
            ? <ArrowUp className="h-4 w-4 text-blue-600" />
            : <ArrowDown className="h-4 w-4 text-blue-600" />;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Historial Bancario Diario</h1>
                            <p className="text-gray-600 mt-1">Visualiza y gestiona los saldos diarios de los bancos</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Filter className="h-4 w-4" />
                                <span>Filtros</span>
                            </button>
                            <button
                                onClick={exportarDatos}
                                disabled={datosOrdenados.length === 0}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <Download className="h-4 w-4" />
                                <span>Exportar</span>
                            </button>
                            <button
                                onClick={cargarTodosLosRegistros}
                                disabled={isLoading}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                <span>Actualizar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mensajes de estado */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-700">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-green-700">{success}</span>
                    </div>
                )}

                {/* Panel de Filtros */}
                {mostrarFiltros && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
                                <input
                                    type="date"
                                    value={filtroFechaDesde}
                                    onChange={(e) => setFiltroFechaDesde(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
                                <input
                                    type="date"
                                    value={filtroFechaHasta}
                                    onChange={(e) => setFiltroFechaHasta(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Banco</label>
                                <select
                                    value={filtroBanco}
                                    onChange={(e) => setFiltroBanco(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todos</option>
                                    {bancosDisponibles.map((banco) => (
                                        <option key={banco.id} value={banco.nombre}>{banco.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={limpiarFiltros}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                )}

                {/* Estadísticas rápidas */}
                {!isLoading && (
                    <div className="mb-6 bg-white rounded-xl shadow-md p-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                                Mostrando {totalRegistros} registros
                                {totalRegistros !== todosLosRegistros.length &&
                                    ` (filtrado de ${todosLosRegistros.length} totales)`
                                }
                            </span>
                            <span>
                                Página {paginaActual} de {totalPaginas || 1}
                            </span>
                        </div>
                    </div>
                )}

                {/* Tabla Principal */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Header de la tabla con información */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-lg font-semibold text-gray-900">Registros de Historial Bancario</h2>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    {totalRegistros} registros
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <select
                                    value={registrosPorPagina}
                                    onChange={(e) => {
                                        setRegistrosPorPagina(parseInt(e.target.value));
                                        setPaginaActual(1);
                                    }}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={10}>10 por página</option>
                                    <option value={25}>25 por página</option>
                                    <option value={50}>50 por página</option>
                                    <option value={100}>100 por página</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Cargando registros...</span>
                        </div>
                    ) : datosPaginados.length === 0 ? (
                        <div className="text-center py-12">
                            <Banknote className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
                            <p className="text-gray-500">
                                {todosLosRegistros.length === 0
                                    ? "No se encontraron registros de historial bancario."
                                    : "No se encontraron registros con los filtros aplicados."
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Tabla */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleOrdenar('fecha')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Fecha</span>
                                                    {renderIconoOrden('fecha')}
                                                </div>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleOrdenar('banco')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <Building2 className="h-4 w-4" />
                                                    <span>Banco</span>
                                                    {renderIconoOrden('banco')}
                                                </div>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleOrdenar('monto')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>Saldo</span>
                                                    {renderIconoOrden('monto')}
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {datosPaginados.map((registro) => (
                                            <tr key={registro.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {formatearFecha(registro.registroFinancieroDiario.fecha)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {obtenerDiaDeLaSemana(registro.fechaRegistro)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {registro.banco?.nombre || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-green-600">
                                                        {formatearMoneda(registro.saldo)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        {onView && (
                                                            <button
                                                                onClick={() => onView(registro)}
                                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {onEdit && (
                                                            <button
                                                                onClick={() => onEdit(registro)}
                                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                                                title="Editar"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {totalPaginas > 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Mostrando {indiceInicio} a {indiceFin} de {totalRegistros} registros
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                                                disabled={paginaActual === 1}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Anterior
                                            </button>
                                            <button
                                                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                                                disabled={paginaActual === totalPaginas}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};