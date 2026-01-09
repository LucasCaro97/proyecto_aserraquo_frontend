import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    CreditCard,
    ArrowUpCircle,
    ArrowDownCircle,
    Loader2,
    AlertTriangle,
    Eye,
    ListChecks,
    Eraser,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

const TIPO_CHEQUE = {
    EMITIDO: 'EMITIDO',
    RECIBIDO: 'RECIBIDO'
};

// Mapeo simple de estados para colores y etiquetas
const ESTADO_MAP = {
    PENDIENTE: { label: 'En Cartera', color: 'bg-yellow-500' },
    ENTREGADO: { label: 'Entregado', color: 'bg-red-500' },
    DEPOSITADO: { label: 'Depositado', color: 'bg-blue-500' },
    COBRADO: { label: 'Cobrado', color: 'bg-green-500' },
    RECHAZADO: { label: 'Rechazado', color: 'bg-purple-500' },
    ANULADO: { label: 'Anulado', color: 'bg-gray-500' },
};

const ESTADOS_POR_TIPO = {
    [TIPO_CHEQUE.RECIBIDO]: ['PENDIENTE', 'DEPOSITADO', 'RECHAZADO', 'ANULADO'],
    [TIPO_CHEQUE.EMITIDO]: ['ENTREGADO', 'COBRADO', 'RECHAZADO', 'ANULADO']
};


export const ChequesTable = () => {
    // 1. ESTADOS
    const [cheques, setCheques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(TIPO_CHEQUE.RECIBIDO); // Inicia en Cartera
    const navigate = useNavigate();

    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        numeroCheque: '',
        fechaVencimientoDesde: '',
        fechaVencimientoHasta: '',
        terceroNombre: '', // Servirá para Emisor o Beneficiario
        estadoCheque: ''
    });

    const [sortOrder, setSortOrder] = useState('asc');

    const handleClearFilters = () => {
        setFilters({
            numeroCheque: '',
            fechaDesde: '',
            fechaHasta: '',
            entidad: '',
            estado: ''
        });
    };


    // 2. FETCH DE DATOS (useEffect con Axios)
    useEffect(() => {
        const fetchCheques = async () => {
            setLoading(true);
            setError(null);
            try {
                // Endpoint único para obtener todos los cheques
                const response = await axios.get(`${apiUrl}/cheques`);
                setCheques(response.data);

            } catch (err) {
                console.error("Error al cargar cheques:", err);
                const message = err.response
                    ? `Error ${err.response.status}: ${err.response.data.message || 'Fallo de la API.'}`
                    : 'Error de red o conexión al cargar datos.';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchCheques();
    }, []); // Se ejecuta solo una vez al montar

    // 3. LÓGICA DE FILTRADO (useMemo para optimizar el rendimiento)
    const filteredCheques = useMemo(() => {
    // PASO 1: Filtrar los datos
    // Guardamos el resultado en una variable 'result' en lugar de retornarlo inmediatamente
    const result = cheques.filter(cheque => {
        if (cheque.tipoCheque !== activeTab) return false;

        if (filters.numeroCheque && !cheque.numeroCheque.toString().includes(filters.numeroCheque)) {
            return false;
        }

        if (filters.fechaDesde || filters.fechaHasta) {
            const [year, month, day] = cheque.fechaCobro.split('-').map(Number);
            const fechaCheque = new Date(year, month - 1, day).getTime();

            if (filters.fechaDesde) {
                const [dYear, dMonth, dDay] = filters.fechaDesde.split('-').map(Number);
                const desde = new Date(dYear, dMonth - 1, dDay).getTime();
                if (fechaCheque < desde) return false;
            }

            if (filters.fechaHasta) {
                const [hYear, hMonth, hDay] = filters.fechaHasta.split('-').map(Number);
                const hasta = new Date(hYear, hMonth - 1, hDay).getTime();
                if (fechaCheque > hasta) return false;
            }
        }

        if (filters.entidad) {
            const nombre = (cheque.terceroNombre || '').toLowerCase();
            if (!nombre.includes(filters.entidad.toLowerCase())) return false;
        }

        if (filters.estado && cheque.estadoCheque !== filters.estado) {
            return false;
        }

        return true;
    });

    // PASO 2: Ordenar el resultado del filtrado
    // Importante: Usamos [...result] para crear una copia y no mutar el original
    return [...result].sort((a, b) => {
        // Como el formato es YYYY-MM-DD, localeCompare es más rápido y seguro
        const dateA = a.fechaCobro || "";
        const dateB = b.fechaCobro || "";

        return sortOrder === 'asc' 
            ? dateA.localeCompare(dateB) 
            : dateB.localeCompare(dateA);
    });

    // IMPORTANTE: Agregué 'sortOrder' a las dependencias, si no, el memo no se entera del cambio de orden
}, [cheques, activeTab, filters, sortOrder]);

    // Obtiene las columnas y título según la pestaña activa
    const isRecibido = activeTab === TIPO_CHEQUE.RECIBIDO;
    const tableTitle = isRecibido ? 'Cheques Recibidos de Terceros (En Cartera)' : 'Cheques Emitidos (Propios)';

    // Define las columnas de la tabla
    const columns = [
        { header: '# Cheque', accessor: 'numeroCheque' },
        { header: 'Monto', accessor: 'monto', formatter: (m) => `$ ${m.toFixed(2)}` },
        { header: 'Vencimiento', accessor: 'fechaCobro', sorteable: true },
        {
            header: isRecibido ? 'Emisor' : 'Beneficiario',
            accessor: 'terceroNombre'
        },
        { header: 'Egreso Vinculado', accessor: 'egreso', isLinked: true },
        {
            header: isRecibido ? 'Banco Emisor' : 'Cuenta Propia',
            accessor: isRecibido ? 'bancoEmisor' : 'cuentaPropia' // Asumiendo que el DTO de respuesta trae estos campos
        },
        { header: 'Estado', accessor: 'estadoChequeNombre', isStatus: true },
        // ... (otras columnas si las necesitas, como fechaEmision, etc.)
    ];

    // 4. RENDERIZADO DE LA TABLA Y ESTADOS
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6 text-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin inline-block mr-2" />
                <p className="text-gray-600">Cargando cheques...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <header className="flex items-center space-x-4 mb-6 border-b pb-4">
                <ListChecks className="w-8 h-8 text-gray-900" />
                <h1 className="text-2xl font-bold text-gray-900">Visualización de Cheques</h1>
            </header>

            {/* Pestañas de Navegación */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab(TIPO_CHEQUE.RECIBIDO)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${isRecibido
                        ? 'text-emerald-600 border-emerald-600'
                        : 'text-gray-500 border-transparent hover:border-gray-300'
                        }`}
                >
                    <ArrowUpCircle className="w-4 h-4 inline mr-1" /> En Cartera ({cheques.filter(c => c.tipoChequeNombre === TIPO_CHEQUE.RECIBIDO).length})
                </button>
                <button
                    onClick={() => setActiveTab(TIPO_CHEQUE.EMITIDO)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${!isRecibido
                        ? 'text-red-600 border-red-600'
                        : 'text-gray-500 border-transparent hover:border-gray-300'
                        }`}
                >
                    <ArrowDownCircle className="w-4 h-4 inline mr-1" /> Emitidos ({cheques.filter(c => c.tipoChequeNombre === TIPO_CHEQUE.EMITIDO).length})
                </button>
            </div>

            {/* Cabecera con Botón de Filtros */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">{tableTitle}</h2>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
                >
                    <ListChecks className="w-4 h-4" />
                    {showFilters ? 'Cerrar Filtros' : 'Filtros'}
                </button>
            </div>

            {showFilters && (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nro Cheque</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0001..."
                            value={filters.numeroCheque}
                            onChange={(e) => setFilters({ ...filters, numeroCheque: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vto Desde</label>
                        <input type="date" className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            value={filters.fechaDesde} onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vto Hasta</label>
                        <input type="date" className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            value={filters.fechaHasta} onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{isRecibido ? 'Emisor' : 'Beneficiario'}</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            placeholder="Buscar nombre..."
                            value={filters.entidad}
                            onChange={(e) => setFilters({ ...filters, entidad: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            value={filters.estado}
                            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                        >
                            <option value="">Todos</option>
                            {ESTADOS_POR_TIPO[activeTab].map(key => (
                                <option key={key} value={key}>
                                    {ESTADO_MAP[key]?.label || key}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dentro del panel de filtros {showFilters && (...)} */}
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Eraser className="w-4 h-4" />
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            )}

            {filteredCheques.length === 0 ? (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
                    No hay cheques {isRecibido ? 'recibidos' : 'emitidos'} registrados.
                </div>
            ) : (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.accessor}
                                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                                            ${col.sorteable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                                        onClick={() => {
                                            if (col.sorteable) {
                                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                            }
                                        }}
                                    >
                                        <div className='flex items-center gap-2'>
                                            {col.header}
                                            {col.sorteable && (
                                                <div className="flex flex-col">
                                                    <ChevronUp className={`w-3 h-3 -mb-1 ${sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-300'}`} />
                                                    <ChevronDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-300'}`} />
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCheques.map((cheque) => {
                                const estadoInfo = ESTADO_MAP[cheque.estadoCheque] || ESTADO_MAP.PENDIENTE;

                                // Asume que el DTO de respuesta tiene un objeto de banco o cuenta
                                const bancoDisplay = isRecibido
                                    ? cheque.bancoTerceros?.nombre || cheque.bancoEmisor || 'N/A'
                                    : cheque.cuentaBancaria?.nombre || cheque.cuentaPropia || 'N/A';

                                return (
                                    <tr key={cheque.id} className="hover:bg-gray-50 transition-colors">
                                        {columns.map((col) => (
                                            <td key={col.accessor} className="px-6 py-4 whitespace-nowrap">
                                                {/* LÓGICA PARA RENDERIZAR LA COLUMNA DE EGRESO O ESTADO */}
                                                {col.isLinked ? (
                                                    <div className="flex items-center space-x-2">
                                                        {cheque.egreso ? (
                                                            <span className="text-red-600 font-semibold text-xs flex items-center">
                                                                <ArrowDownCircle className="w-4 h-4 mr-1" />
                                                                Vinculado (ID: {cheque.egreso.id})
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-500 text-xs flex items-center">
                                                                <CreditCard className="w-4 h-4 mr-1" />
                                                                Pendiente
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : col.isStatus ? (
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${estadoInfo.color}`}>
                                                        {estadoInfo.label}
                                                    </span>
                                                ) : (
                                                    <div className="text-sm text-gray-900">
                                                        {col.formatter ? col.formatter(cheque[col.accessor]) : (col.accessor === (isRecibido ? 'bancoEmisor' : 'cuentaPropia') ? bancoDisplay : cheque[col.accessor])}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => navigate(`/cheques/${cheque.id}`)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Ver Detalle"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            {/* Aquí se añadirían botones para DEPOSITAR, COBRAR, ANULAR, etc. */}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};