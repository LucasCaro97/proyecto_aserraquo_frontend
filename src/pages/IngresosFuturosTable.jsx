import React, { useState, useEffect, useCallback } from 'react';
import {
    Eye,
    DollarSign,
    User,
    FileText,
    Search,
    Filter,
    Download,
    RefreshCw,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    Edit2,
} from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import { useFechaFormateador } from '../hooks/formatearFecha'
import axios from 'axios';
import Swal from 'sweetalert2';

export const IngresosFuturosTable = ({ onEdit, onView }) => {
    // Estados principales
    const [todosLosIngresos, setTodosLosIngresos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Hook de fechas
    const { formatearFecha } = useFechaFormateador();

    // Estados de filtros para el servidor
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina] = useState(10);

    const apiUrl = import.meta.env.VITE_API_URL;

    // Petición al servidor (Adaptada a PathVariable)
    const obtenerIngresos = useCallback(async () => {
        setIsLoading(true);
        try {
            let url = `${apiUrl}/ingreso-futuro`;

            // Si hay rango de fechas, usamos el endpoint específico
            if (fechaInicio && fechaFin) {
                url = `${apiUrl}/ingreso-futuro/fecha-between/${fechaInicio}/${fechaFin}`;
            }

            const response = await axios.get(url);
            setTodosLosIngresos(response.data);
            setPaginaActual(1);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudieron obtener los ingresos del servidor', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, fechaInicio, fechaFin]);

    useEffect(() => {
        obtenerIngresos();
    }, []);

    const limpiarFiltros = () => {
        setFechaInicio('');
        setFechaFin('');
        // Forzamos la carga de todos los datos de nuevo
        setTimeout(() => {
            axios.get(`${apiUrl}/ingreso-futuro`).then(res => setTodosLosIngresos(res.data));
        }, 100);
    };

    const exportarExcel = async () => {
        if (todosLosIngresos.length === 0) {
            Swal.fire('Atención', 'No hay datos para exportar', 'info');
            return;
        }
        try {
            const response = await axios({
                url: `${apiUrl}/ingreso-futuro/exportar-excel`,
                method: 'POST',
                data: todosLosIngresos,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ingresos_futuros_${new Date().toLocaleDateString()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            Swal.fire('Error', 'No se pudo generar el Excel', 'error');
        }
    };

    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
    };

    // Paginación sobre los datos devueltos por el servidor
    const totalPaginas = Math.ceil(todosLosIngresos.length / itemsPorPagina);
    const itemsPaginados = todosLosIngresos.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Listado de Ingresos Futuros</h1>
                <div className="flex gap-2">
                    <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Filter className="h-4 w-4" /> <span>Filtrar por Fecha</span>
                    </button>
                    <button onClick={exportarExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Exportar Excel</span>
                    </button>
                </div>
            </div>

            {/* SECCIÓN DE FILTROS (Estilo IngresosTable) */}
            {mostrarFiltros && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Fecha Inicio</label>
                            <input
                                type="date"
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Fecha Fin</label>
                            <input
                                type="date"
                                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={obtenerIngresos}
                            disabled={isLoading || !fechaInicio || !fechaFin}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all font-bold text-sm disabled:opacity-50"
                        >
                            <Search className="h-4 w-4" /> Buscar
                        </button>
                        <button
                            onClick={limpiarFiltros}
                            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-all text-sm font-medium"
                        >
                            <X className="h-4 w-4" /> Limpiar
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                            <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Fecha</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Paquetes</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Camiones Desp.</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Monto</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Usuario</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm uppercase">Observación</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm uppercase text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">Cargando datos del servidor...</td></tr>
                        ) : itemsPaginados.length > 0 ? (
                            itemsPaginados.map((ingreso) => (
                                <tr key={ingreso.id} className="hover:bg-gray-50 transition-colors">
                                    {/* APLICACIÓN DEL HOOK DE FECHA */}
                                    <td className="p-4 text-sm text-gray-900">
                                        {formatearFecha(ingreso.registroFinancieroDiario?.fecha)}
                                    </td>
                                    <td className="p-4 text-sm text-gray-900">
                                        {ingreso.paquetesDespachados}
                                    </td>
                                    <td className="p-4 text-sm text-gray-900">
                                        {ingreso.camionesDespachados}
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-900">
                                        {formatearMoneda(ingreso.ventasTotales)}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5" /> {ingreso.usuario?.nombre}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-900">
                                        {ingreso.observacion}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="h-4 w-4" /></button>
                                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="p-10 text-center text-gray-400">No hay registros para este periodo.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PIE DE TABLA: PAGINACIÓN Y ESTADÍSTICAS */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t pt-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Total Vendido</p>
                    <p className="text-xl font-black text-blue-900">
                        {formatearMoneda(todosLosIngresos.reduce((sum, i) => sum + i.ventasTotales, 0))}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        disabled={paginaActual === 1}
                        onClick={() => setPaginaActual(p => p - 1)}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-bold text-gray-500 uppercase px-4">
                        Página {paginaActual} de {totalPaginas || 1}
                    </span>
                    <button
                        disabled={paginaActual >= totalPaginas}
                        onClick={() => setPaginaActual(p => p + 1)}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-30 transition-all"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};