import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    CreditCard, Loader2, AlertTriangle, Eye, Eraser, ChevronUp, ChevronDown, Search, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

const TIPO_CHEQUE = { EMITIDO: 'EMITIDO', RECIBIDO: 'RECIBIDO' };

const ESTADO_MAP = {
    PENDIENTE: { label: 'En Cartera', color: 'bg-yellow-500' },
    ENTREGADO: { label: 'Entregado', color: 'bg-red-500' },
    DEPOSITADO: { label: 'Depositado', color: 'bg-blue-500' },
    COBRADO: { label: 'Cobrado', color: 'bg-green-500' },
    RECHAZADO: { label: 'Rechazado', color: 'bg-purple-500' },
    ANULADO: { label: 'Anulado', color: 'bg-gray-500' },
    ENTREGADO_A_PROVEEDORES: { label: 'Entregado a Prov.', color: 'bg-emerald-500' }
};

const ESTADOS_POR_TIPO = {
    [TIPO_CHEQUE.RECIBIDO]: ['PENDIENTE', 'DEPOSITADO', 'RECHAZADO', 'ANULADO', 'ENTREGADO_A_PROVEEDORES'],
    [TIPO_CHEQUE.EMITIDO]: ['ENTREGADO', 'COBRADO', 'RECHAZADO', 'ANULADO']
};

export const ChequesTable = () => {
    const navigate = useNavigate();
    const [cheques, setCheques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtros BACKEND
    const [tipoSeleccionado, setTipoSeleccionado] = useState(TIPO_CHEQUE.RECIBIDO);
    const [filtroEstado, setFiltroEstado] = useState('PENDIENTE');

    // Filtros FRONTEND
    const [busquedaNumero, setBusquedaNumero] = useState('');
    const [busquedaEmisor, setBusquedaEmisor] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const [sortConfig, setSortConfig] = useState({ key: 'fechaCobro', direction: 'asc' });

    useEffect(() => {
        const fetchCheques = async () => {
            setLoading(true);
            setError(null);
            try {
                // Ajustado a tu endpoint de PathVariables
                const response = await axios.get(`${apiUrl}/cheques/tipo/${tipoSeleccionado}/estado/${filtroEstado}`);
                setCheques(response.data);
            } catch (err) {
                setError("Error al conectar con el servidor.");
            } finally {
                setLoading(false);
            }
        };
        fetchCheques();
    }, [tipoSeleccionado, filtroEstado]);

    const chequesFiltrados = useMemo(() => {
        return cheques.filter(cheque => {
            const matchNumero = cheque.numeroCheque?.toString().includes(busquedaNumero);
            const emisor = (cheque.terceroNombre || cheque.bancoTerceros?.nombre || cheque.cuentaBancaria?.nombre || '').toLowerCase();
            const matchEmisor = emisor.includes(busquedaEmisor.toLowerCase());

            const fechaCheque = cheque.fechaCobro ? new Date(cheque.fechaCobro) : null;
            let matchFecha = true;
            if (fechaDesde && fechaCheque) matchFecha = matchFecha && fechaCheque >= new Date(fechaDesde);
            if (fechaHasta && fechaCheque) matchFecha = matchFecha && fechaCheque <= new Date(fechaHasta);

            return matchNumero && matchEmisor && matchFecha;
        });
    }, [cheques, busquedaNumero, busquedaEmisor, fechaDesde, fechaHasta]);

    const sortedCheques = useMemo(() => {
        let sortableItems = [...chequesFiltrados];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                if (sortConfig.key.includes('fecha')) {
                    aVal = aVal ? new Date(aVal) : 0;
                    bVal = bVal ? new Date(bVal) : 0;
                }
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [chequesFiltrados, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const isRecibido = tipoSeleccionado === TIPO_CHEQUE.RECIBIDO;

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-indigo-600" /> Gestión de Cheques
                </h1>
            </div>

            {/* FILTROS */}
            <div className="bg-white p-5 rounded-xl shadow-sm border mb-6 space-y-5">
                <div className="flex flex-wrap gap-4 items-center border-b pb-4">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => { setTipoSeleccionado(TIPO_CHEQUE.RECIBIDO); setFiltroEstado('PENDIENTE'); }}
                            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${isRecibido ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}>
                            Recibidos
                        </button>
                        <button onClick={() => { setTipoSeleccionado(TIPO_CHEQUE.EMITIDO); setFiltroEstado('ENTREGADO'); }}
                            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${!isRecibido ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                            Emitidos
                        </button>
                    </div>
                    <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="border-gray-300 rounded-lg text-sm">
                        {ESTADOS_POR_TIPO[tipoSeleccionado].map(st => (
                            <option key={st} value={st}>{ESTADO_MAP[st]?.label}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><input type="text" placeholder="N° Cheque..." className="pl-9 w-full border-gray-300 rounded-lg text-sm" value={busquedaNumero} onChange={(e) => setBusquedaNumero(e.target.value)} /></div>
                    <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><input type="text" placeholder="Tercero..." className="pl-9 w-full border-gray-300 rounded-lg text-sm" value={busquedaEmisor} onChange={(e) => setBusquedaEmisor(e.target.value)} /></div>
                    <div className="flex items-center gap-2 col-span-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <input type="date" className="border-gray-300 rounded-lg text-sm flex-1" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
                        <input type="date" className="border-gray-300 rounded-lg text-sm flex-1" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
                        <button onClick={() => { setBusquedaNumero(''); setBusquedaEmisor(''); setFechaDesde(''); setFechaHasta(''); }} className="p-2 text-gray-400 hover:text-red-500"><Eraser className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            {/* TABLA */}
            {loading ? (
                <div className="flex flex-col items-center py-20 bg-white rounded-xl border"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" /><p className="text-gray-500">Sincronizando con el servidor...</p></div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['numeroCheque', 'fechaEmision', 'fechaCobro', 'entidad', 'monto', 'estadoCheque'].map((col) => (
                                    <th
                                        key={col}
                                        onClick={() => col !== 'entidad' && handleSort(col)}
                                        className={`px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${col !== 'entidad' ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col === 'numeroCheque' ? 'N°' :
                                                col === 'fechaEmision' ? (isRecibido ? 'Recepción' : 'Emisión') :
                                                    col === 'fechaCobro' ? 'Vencimiento' :
                                                        col === 'entidad' ? (isRecibido ? 'Emisor / Banco' : 'Beneficiario / Cuenta') : // Modificado aquí
                                                            col === 'monto' ? 'Monto' :
                                                                'Estado'}

                                            {sortConfig.key === col && (
                                                sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Ver</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedCheques.map((cheque) => (
                                <tr key={cheque.id} className="hover:bg-gray-50 transition-colors">
                                    {/* N° de Cheque */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {cheque.numeroCheque}
                                    </td>

                                    {/* Fecha de Emisión/Recepción */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {cheque.fechaEmision ? new Date(cheque.fechaEmision).toLocaleDateString('es-AR') : '—'}
                                    </td>

                                    {/* Fecha de Vencimiento */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                        {new Date(cheque.fechaCobro).toLocaleDateString('es-AR')}
                                    </td>

                                    {/* COLUMNA DINÁMICA: Beneficiario o Emisor */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div className="flex flex-col">
                                            {isRecibido ? (
                                                <>
                                                    <span className="font-bold text-gray-800">{cheque.terceroNombre || 'Desconocido'}</span>
                                                    <span className="text-xs text-gray-400">{cheque.bancoTerceros?.nombre || 'S/B'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-blue-700">Para: {cheque.terceroNombre || 'Al portador'}</span>
                                                    <span className="text-xs text-gray-500">Desde: {cheque.cuentaBancaria?.nombre || 'Cuenta Propia'}</span>
                                                </>
                                            )}
                                        </div>
                                    </td>

                                    {/* Monto */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(cheque.monto)}
                                    </td>

                                    {/* Estado */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white ${ESTADO_MAP[cheque.estadoCheque]?.color}`}>
                                            {ESTADO_MAP[cheque.estadoCheque]?.label}
                                        </span>
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button onClick={() => navigate(`/cheques/${cheque.id}`)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};