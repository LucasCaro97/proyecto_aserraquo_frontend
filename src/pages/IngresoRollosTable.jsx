import { useState, useEffect } from 'react';
import {
    Scale, Search, RefreshCw, X,
    ChevronLeft, ChevronRight, FileText,
    Trash2, Edit2, User, Download, Filter
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { IngresoRollosForm } from '../components/IngresoRollos/IngresoRollosForm';
import { useFechaFormateador } from '../hooks/formatearFecha';

export const TablaRollos = () => {
    // Estados principales
    const [rollos, setRollos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { formatearFecha } = useFechaFormateador();

    // Estados de filtros (Para enviar al servidor)
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    // Estados para Edición y Catálogos
    const [editandoRollo, setEditandoRollo] = useState(null);
    const [tiposProducto, setTiposProducto] = useState([]);
    const [registrosDiarios, setRegistrosDiarios] = useState([]);
    const [formDataEdicion, setFormDataEdicion] = useState({
        peso: '', idTipoProducto: '', idRegistroDiario: '', observacion: ''
    });

    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina] = useState(10);

    const apiUrl = import.meta.env.VITE_API_URL;

    // Carga inicial
    useEffect(() => {
        obtenerRollos();
        cargarCatalogos();
    }, []);

    const cargarCatalogos = async () => {
        try {
            const [resProd, resReg] = await Promise.all([
                axios.get(`${apiUrl}/tipo-producto`),
                axios.get(`${apiUrl}/registro-financiero/sorted-top10-desc`)
            ]);
            setTiposProducto(resProd.data);
            setRegistrosDiarios(resReg.data);
        } catch (err) {
            console.error("Error cargando catálogos:", err);
        }
    };

    // FUNCIÓN DE BÚSQUEDA EN SERVIDOR
    const obtenerRollos = async () => {
        setIsLoading(true);
        try {
            let url = `${apiUrl}/rollos-ingresados`;

            // Si ambas fechas están presentes, usamos el nuevo endpoint de rango
            if (fechaInicio && fechaFin) {
                url = `${apiUrl}/rollos-ingresados/fecha-between/${fechaInicio}/${fechaFin}`;
            }

            const response = await axios.get(url);
            setRollos(response.data);
            setPaginaActual(1); // Resetear a pag 1 al filtrar
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudieron obtener los datos para el rango seleccionado', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const exportarExcel = async () => {
        if (rollos.length === 0) {
            Swal.fire('Atención', 'No hay datos para exportar', 'info');
            return;
        }
        try {
            const response = await axios({
                url: `${apiUrl}/rollos-ingresados/exportar-excel`,
                method: 'POST',
                data: rollos,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rollos_filtrados_${new Date().toLocaleDateString()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            Swal.fire('Error', 'No se pudo generar el Excel', 'error');
        }
    };

    const limpiarFiltros = () => {
        setFechaInicio('');
        setFechaFin('');
        // Llamada inmediata para traer todo de nuevo
        setTimeout(() => obtenerRollos(), 100);
    };

    // Paginación manual sobre la lista que devuelve el servidor
    const itemsPaginados = rollos.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina);
    const totalPaginas = Math.ceil(rollos.length / itemsPorPagina);

    const formatearToneladas = (valor) => {
        return Number(valor).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Listado de Ingreso de Rollos</h1>
                <div className='flex gap-2'>
                    <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Filter className="h-4 w-4" /> <span>Filtrar por Fecha</span>
                    </button>
                    <button
                        onClick={exportarExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        <span>Exportar Excel</span>
                    </button>
                </div>
            </div>

            {/* SECCIÓN DE FILTROS ESTILO INGRESOS CON BOTÓN BUSCAR */}
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

                        {/* BOTÓN BUSCAR - Ejecuta la petición al endpoint por PathVariable */}
                        <button
                            onClick={obtenerRollos}
                            disabled={isLoading || !fechaInicio || !fechaFin}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm disabled:opacity-50"
                        >
                            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Buscar por Rango
                        </button>

                        <button
                            onClick={limpiarFiltros}
                            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium shadow-sm"
                        >
                            <X className="h-4 w-4" />
                            Limpiar
                        </button>
                    </div>
                </div>
            )}

            {/* TABLA DE DATOS */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-200 text-sm">
                            <th className="p-4 font-semibold text-gray-600">ID</th>
                            <th className="p-4 font-semibold text-gray-600">Fecha</th>
                            <th className="p-4 font-semibold text-gray-600">Peso</th>
                            <th className="p-4 font-semibold text-gray-600">Producto</th>
                            <th className="p-4 font-semibold text-gray-600">Operador</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">Consultando al servidor...</td></tr>
                        ) : itemsPaginados.length > 0 ? (
                            itemsPaginados.map((rollo) => (
                                <tr key={rollo.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-xs font-bold text-gray-400">#{rollo.id}</td>
                                    <td className="p-4 text-sm">
                                        {formatearFecha(rollo.registroFinancieroDiario?.fecha)}
                                    </td>
                                    <td className="p-4 font-bold text-gray-800 text-sm">{formatearToneladas(rollo.peso)} tn</td>
                                    <td className="p-4">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded uppercase border border-blue-100">
                                            {rollo.tipoProducto?.nombre}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5 text-gray-400" /> {rollo.usuario?.nombre}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditandoRollo(rollo)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="h-4 w-4" /></button>
                                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="p-10 text-center text-gray-400">No se encontraron resultados para los filtros aplicados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PIE DE TABLA: PAGINACIÓN Y TOTALES */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t pt-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Peso Total en esta búsqueda</p>
                    <p className="text-xl font-black text-blue-900">
                        {formatearToneladas(rollos.reduce((sum, r) => sum + (r.peso || 0), 0))} <span className="text-xs">tn</span>
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