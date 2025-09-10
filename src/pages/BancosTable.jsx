import React, { useState, useEffect, useMemo } from 'react';
import { 
    Eye, 
    EyeOff, 
    DollarSign, 
    CheckCircle,
    XCircle, 
    Banknote,
    Search,
    Filter,
    Download,
    RefreshCw,
    AlertCircle,
    ArrowUp,
    ArrowDown,
    ArrowUpDown
} from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario'; // Asume que este hook sigue siendo relevante para tu app
import axios from 'axios';

export const BancosTable = ({ onEdit, onView }) => {
    // Estados principales
    const [todosLosBancos, setTodosLosBancos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados de filtros y búsqueda
    const [filtroNombre, setFiltroNombre] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    // Estados de paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

    // Estados de ordenamiento
    const [ordenarPor, setOrdenarPor] = useState('nombre');
    const [tipoOrden, setTipoOrden] = useState('asc');

    // Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Función para cargar todos los bancos desde la API
    const cargarTodosLosBancos = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.get(`${apiUrl}/banco`);
            setTodosLosBancos(response.data.data || response.data);
        } catch (error) {
            console.error('Error al cargar bancos:', error);
            setError('Error al cargar los registros de bancos');
        } finally {
            setIsLoading(false);
        }
    };

    // Efecto para cargar datos iniciales una sola vez
    useEffect(() => {
        cargarTodosLosBancos();
    }, []);

    // Función para filtrar los datos en el cliente
    const datosFiltrados = useMemo(() => {
        let datosFiltrados = [...todosLosBancos];

        // Aplicar filtro de nombre
        if (filtroNombre.trim()) {
            datosFiltrados = datosFiltrados.filter(banco => 
                banco.nombre?.toLowerCase().includes(filtroNombre.toLowerCase())
            );
        }

        return datosFiltrados;
    }, [todosLosBancos, filtroNombre]);

    // Función para ordenar los datos en el cliente
    const datosOrdenados = useMemo(() => {
        const datosParaOrdenar = [...datosFiltrados];
        
        return datosParaOrdenar.sort((a, b) => {
            let valorA, valorB;

            switch (ordenarPor) {
                case 'nombre':
                    valorA = a.nombre;
                    valorB = b.nombre;
                    break;
                case 'saldo':
                    valorA = a.saldo;
                    valorB = b.saldo;
                    break;
                case 'estado':
                    valorA = a.estado;
                    valorB = b.estado;
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
    }, [filtroNombre]);

    // Función para limpiar filtros
    const limpiarFiltros = () => {
        setFiltroNombre('');
        setPaginaActual(1);
    };

    // Función para manejar el ordenamiento
    const handleOrdenar = (campo) => {
        if (ordenarPor === campo) {
            setTipoOrden(tipoOrden === 'asc' ? 'desc' : 'asc');
        } else {
            setOrdenarPor(campo);
            setTipoOrden('asc');
        }
        setPaginaActual(1);
    };

    // Función para exportar datos
    const exportarDatos = () => {
        try {
            const datosParaExportar = datosOrdenados;
            const csvContent = "data:text/csv;charset=utf-8," + 
                "ID,Nombre,Saldo,Estado\n" +
                datosParaExportar.map(banco => 
                    `${banco.id},` +
                    `"${banco.nombre}",` +
                    `${banco.saldo},` +
                    `${banco.estado ? 'Activo' : 'Inactivo'}`
                ).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `bancos_${new Date().toISOString().split('T')[0]}.csv`);
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
                            <h1 className="text-3xl font-bold text-gray-900">Bancos</h1>
                            <p className="text-gray-600 mt-1">Gestión de la lista de bancos</p>
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
                                onClick={cargarTodosLosBancos}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Banco</label>
                                <input
                                    type="text"
                                    value={filtroNombre}
                                    onChange={(e) => setFiltroNombre(e.target.value)}
                                    placeholder="Buscar por nombre..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
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
                                {totalRegistros !== todosLosBancos.length && 
                                    ` (filtrado de ${todosLosBancos.length} totales)`
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
                                <h2 className="text-lg font-semibold text-gray-900">Registros de Bancos</h2>
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
                                {todosLosBancos.length === 0 
                                    ? "No se encontraron bancos registrados"
                                    : "No se encontraron bancos con los filtros aplicados"
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
                                                onClick={() => handleOrdenar('id')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>ID</span>
                                                    {renderIconoOrden('id')}
                                                </div>
                                            </th>
                                            <th 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleOrdenar('nombre')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Nombre</span>
                                                    {renderIconoOrden('nombre')}
                                                </div>
                                            </th>
                                            <th 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleOrdenar('saldo')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Saldo</span>
                                                    {renderIconoOrden('saldo')}
                                                </div>
                                            </th>
                                            <th 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleOrdenar('estado')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Estado</span>
                                                    {renderIconoOrden('estado')}
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {datosPaginados.map((banco, index) => (
                                            <tr key={banco.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{banco.id}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{banco.nombre}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-green-600">
                                                        {formatearMoneda(banco.saldo)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        banco.estado
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {banco.estado ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        {onView && (
                                                            <button
                                                                onClick={() => onView(banco)}
                                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {onEdit && (
                                                            <button
                                                                onClick={() => onEdit(banco)}
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
                                            
                                            {/* Números de página */}
                                            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                                                const pageNumber = Math.max(1, Math.min(totalPaginas - 4, paginaActual - 2)) + i;
                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => setPaginaActual(pageNumber)}
                                                        className={`px-3 py-1 border rounded text-sm ${
                                                            paginaActual === pageNumber
                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                : 'border-gray-300 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            })}
                                            
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
    )};
