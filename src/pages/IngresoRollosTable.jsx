import { useState, useEffect } from 'react';
import { Scale, Calendar, Search, RefreshCw, Filter, X, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';

export const TablaRollos = () => {
    // Estados principales
    const [rollos, setRollos] = useState([]);
    const [rollosFiltrados, setRollosFiltrados] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados para filtros
    const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
    const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
    const [filtroUsuario, setFiltroUsuario] = useState('');
    const [filtroPesoMin, setFiltroPesoMin] = useState('');
    const [filtroPesoMax, setFiltroPesoMax] = useState('');

    // Estados para ordenamiento
    const [ordenPor, setOrdenPor] = useState('id');
    const [ordenDireccion, setOrdenDireccion] = useState('desc');

    // Estados para paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const [registrosPorPagina] = useState(10);

    // Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Cargar todos los rollos
    const cargarRollos = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            const response = await axios.get(`${apiUrl}/rollos-ingresados`);
            setRollos(response.data);
            setRollosFiltrados(response.data);
        } catch (error) {
            console.error('Error al cargar rollos:', error);
            setError('Error al cargar los registros de rollos');
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        cargarRollos();
    }, []);

    // Aplicar filtros
    useEffect(() => {
        let resultado = [...rollos];

        // Filtro por fecha desde
        if (filtroFechaDesde) {
            const fechaDesde = new Date(filtroFechaDesde);
            resultado = resultado.filter(rollo => {
                const fechaRollo = new Date(rollo.registroFinancieroDiario.fecha);
                return fechaRollo >= fechaDesde;
            });
        }

        // Filtro por fecha hasta
        if (filtroFechaHasta) {
            const fechaHasta = new Date(filtroFechaHasta);
            // Agregar 23:59:59 al día seleccionado para incluir todo el día
            fechaHasta.setHours(23, 59, 59, 999);
            resultado = resultado.filter(rollo => {
                const fechaRollo = new Date(rollo.registroFinancieroDiario.fecha);
                return fechaRollo <= fechaHasta;
            });
        }

        // Filtro por usuario
        if (filtroUsuario) {
            resultado = resultado.filter(rollo =>
                rollo.usuario.nombre.toLowerCase().includes(filtroUsuario.toLowerCase())
            );
        }

        // Filtro por peso mínimo
        if (filtroPesoMin) {
            resultado = resultado.filter(rollo =>
                parseFloat(rollo.peso) >= parseFloat(filtroPesoMin)
            );
        }

        // Filtro por peso máximo
        if (filtroPesoMax) {
            resultado = resultado.filter(rollo =>
                parseFloat(rollo.peso) <= parseFloat(filtroPesoMax)
            );
        }

        // Aplicar ordenamiento
        resultado.sort((a, b) => {
            let valorA, valorB;

            switch (ordenPor) {
                case 'id':
                    valorA = a.id;
                    valorB = b.id;
                    break;
                case 'peso':
                    valorA = parseFloat(a.peso);
                    valorB = parseFloat(b.peso);
                    break;
                case 'fecha':
                    valorA = new Date(a.registroFinancieroDiario.fecha);
                    valorB = new Date(b.registroFinancieroDiario.fecha);
                    break;
                case 'usuario':
                    valorA = a.usuario.nombre.toLowerCase();
                    valorB = b.usuario.nombre.toLowerCase();
                    break;
                default:
                    valorA = a.id;
                    valorB = b.id;
            }

            if (ordenDireccion === 'asc') {
                return valorA > valorB ? 1 : -1;
            } else {
                return valorA < valorB ? 1 : -1;
            }
        });

        setRollosFiltrados(resultado);
        setPaginaActual(1); // Resetear a la primera página cuando se filtran los datos
    }, [rollos, filtroFechaDesde, filtroFechaHasta, filtroUsuario, filtroPesoMin, filtroPesoMax, ordenPor, ordenDireccion]);

    // Limpiar filtros
    const limpiarFiltros = () => {
        setFiltroFechaDesde('');
        setFiltroFechaHasta('');
        setFiltroUsuario('');
        setFiltroPesoMin('');
        setFiltroPesoMax('');
        setPaginaActual(1);
    };

    // Cambiar ordenamiento
    const cambiarOrdenamiento = (campo) => {
        if (ordenPor === campo) {
            setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc');
        } else {
            setOrdenPor(campo);
            setOrdenDireccion('desc');
        }
    };

    const formatearFecha = (fechaString) => {
        // Si la fecha es "2025-09-02", split la convierte en ["2025", "09", "02"]
        const partes = fechaString.split('-');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    };

    // Calcular paginación
    const indiceInicio = (paginaActual - 1) * registrosPorPagina;
    const indiceFin = indiceInicio + registrosPorPagina;
    const rollosPaginados = rollosFiltrados.slice(indiceInicio, indiceFin);
    const totalPaginas = Math.ceil(rollosFiltrados.length / registrosPorPagina);

    const obtenerUsuariosUnicos = () => {
        const usuarios = rollos.map(rollo => rollo.usuario.nombre);
        return [...new Set(usuarios)].sort();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Registro de Rollos</h1>
                            <p className="text-gray-600 mt-1">
                                Visualiza y gestiona todos los registros de rollos ingresados
                            </p>
                        </div>
                        <button
                            onClick={cargarRollos}
                            disabled={isLoading}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>Actualizar</span>
                        </button>
                    </div>
                </div>

                {/* Panel de filtros */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <Filter className="h-5 w-5" />
                            <span>Filtros</span>
                        </h2>
                        <button
                            onClick={limpiarFiltros}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                        >
                            <X className="h-4 w-4" />
                            <span>Limpiar filtros</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Filtro fecha desde */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha desde
                            </label>
                            <input
                                type="date"
                                value={filtroFechaDesde}
                                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Filtro fecha hasta */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha hasta
                            </label>
                            <input
                                type="date"
                                value={filtroFechaHasta}
                                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Filtro usuario */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Usuario
                            </label>
                            <select
                                value={filtroUsuario}
                                onChange={(e) => setFiltroUsuario(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Todos los usuarios</option>
                                {obtenerUsuariosUnicos().map(usuario => (
                                    <option key={usuario} value={usuario}>{usuario}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtros de peso */}
                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Peso min (tn)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={filtroPesoMin}
                                    onChange={(e) => setFiltroPesoMin(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Min"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Peso max (tn)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={filtroPesoMax}
                                    onChange={(e) => setFiltroPesoMax(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Max"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resumen de filtros aplicados */}
                    <div className="mt-4 text-sm text-gray-600">
                        Mostrando {rollosFiltrados.length} de {rollos.length} registros
                    </div>
                </div>

                {/* Mensajes de error */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-700">{error}</span>
                    </div>
                )}

                {/* Tabla de registros */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Cargando registros...</span>
                        </div>
                    ) : rollosFiltrados.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Scale className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
                            <p>No se encontraron rollos que coincidan con los filtros aplicados</p>
                        </div>
                    ) : (
                        <>
                            {/* Tabla */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => cambiarOrdenamiento('id')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>ID</span>
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </th>
                                            <th 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => cambiarOrdenamiento('peso')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Peso (tn)</span>
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </th>
                                            <th 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => cambiarOrdenamiento('fecha')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Fecha</span>
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </th>
                                            <th 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => cambiarOrdenamiento('usuario')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Usuario</span>
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {rollosPaginados.map((rollo, index) => (
                                            <tr 
                                                key={rollo.id} 
                                                className={`hover:bg-gray-50 transition-colors ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                                                }`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{rollo.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex items-center space-x-2">
                                                        <Scale className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium">{parseFloat(rollo.peso).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <div>
                                                            <div className="font-medium">
                                                                {formatearFecha(rollo.registroFinancieroDiario.fecha)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {obtenerDiaDeLaSemana(rollo.registroFinancieroDiario.fecha)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-blue-600 font-medium text-xs">
                                                                {rollo.usuario.nombre.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium">{rollo.usuario.nombre}</span>
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
                                            Mostrando {indiceInicio + 1} a {Math.min(indiceFin, rollosFiltrados.length)} de {rollosFiltrados.length} registros
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                                                disabled={paginaActual === 1}
                                                className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            
                                            <div className="flex space-x-1">
                                                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                                                    .filter(pagina => 
                                                        pagina === 1 || 
                                                        pagina === totalPaginas || 
                                                        Math.abs(pagina - paginaActual) <= 1
                                                    )
                                                    .map((pagina, index, arr) => (
                                                        <div key={pagina} className="flex items-center">
                                                            {index > 0 && arr[index - 1] !== pagina - 1 && (
                                                                <span className="px-2 text-gray-400">...</span>
                                                            )}
                                                            <button
                                                                onClick={() => setPaginaActual(pagina)}
                                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                                    pagina === paginaActual
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'text-gray-700 hover:bg-gray-100'
                                                                }`}
                                                            >
                                                                {pagina}
                                                            </button>
                                                        </div>
                                                    ))}
                                            </div>

                                            <button
                                                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                                                disabled={paginaActual === totalPaginas}
                                                className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Estadísticas resumen */}
                {!isLoading && rollosFiltrados.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Scale className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Registros</p>
                                    <p className="text-2xl font-bold text-gray-900">{rollosFiltrados.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Scale className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Peso Total</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {rollosFiltrados.reduce((sum, rollo) => sum + parseFloat(rollo.peso), 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tn
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Scale className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Peso Promedio</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {(rollosFiltrados.reduce((sum, rollo) => sum + parseFloat(rollo.peso), 0) / rollosFiltrados.length).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tn
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};