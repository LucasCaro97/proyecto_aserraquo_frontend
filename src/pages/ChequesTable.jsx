import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    CreditCard, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    Loader2, 
    AlertTriangle,
    Eye,
    ListChecks
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


export const ChequesTable = () => {
    // 1. ESTADOS
    const [cheques, setCheques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(TIPO_CHEQUE.RECIBIDO); // Inicia en Cartera
    const navigate = useNavigate();


    // 2. FETCH DE DATOS (useEffect con Axios)
    useEffect(() => {
        const fetchCheques = async () => {
            setLoading(true);
            setError(null);
            try {
                // Endpoint único para obtener todos los cheques
                const response = await axios.get(`${apiUrl}/cheques`); 
                setCheques(response.data);
                console.log(response.data)
                
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
        return cheques.filter(cheque => cheque.tipoCheque === activeTab);
    }, [cheques, activeTab]);
    
    // Obtiene las columnas y título según la pestaña activa
    const isRecibido = activeTab === TIPO_CHEQUE.RECIBIDO;
    const tableTitle = isRecibido ? 'Cheques Recibidos (En Cartera)' : 'Cheques Emitidos (Propios)';
    
    // Define las columnas de la tabla
    const columns = [
        { header: '# Cheque', accessor: 'numeroCheque' },
        { header: 'Monto', accessor: 'monto', formatter: (m) => `$ ${m.toFixed(2)}` },
        { header: 'Vencimiento', accessor: 'fechaCobro' },
        { 
            header: isRecibido ? 'Emisor' : 'Beneficiario', 
            accessor: 'terceroNombre' 
        },
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
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        isRecibido 
                            ? 'text-emerald-600 border-emerald-600' 
                            : 'text-gray-500 border-transparent hover:border-gray-300'
                    }`}
                >
                    <ArrowUpCircle className="w-4 h-4 inline mr-1" /> En Cartera ({cheques.filter(c => c.tipoChequeNombre === TIPO_CHEQUE.RECIBIDO).length})
                </button>
                <button
                    onClick={() => setActiveTab(TIPO_CHEQUE.EMITIDO)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        !isRecibido 
                            ? 'text-red-600 border-red-600' 
                            : 'text-gray-500 border-transparent hover:border-gray-300'
                    }`}
                >
                    <ArrowDownCircle className="w-4 h-4 inline mr-1" /> Emitidos ({cheques.filter(c => c.tipoChequeNombre === TIPO_CHEQUE.EMITIDO).length})
                </button>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">{tableTitle}</h2>

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
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {col.header}
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
                                                {col.isStatus ? (
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