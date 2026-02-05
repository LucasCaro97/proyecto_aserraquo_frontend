import { useState, useEffect } from 'react';
import { 
    Scale, Calendar, Search, RefreshCw, Filter, X, 
    ArrowUpDown, ChevronLeft, ChevronRight, FileText, 
    Trash2, AlertCircle, Edit2, User 
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { IngresoRollosForm } from '../components/IngresoRollos/IngresoRollosForm';

export const TablaRollos = () => {
    // Estados principales
    const [rollos, setRollos] = useState([]);
    const [rollosFiltrados, setRollosFiltrados] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados para Edición y Catálogos
    const [editandoRollo, setEditandoRollo] = useState(null);
    const [tiposProducto, setTiposProducto] = useState([]);
    const [registrosDiarios, setRegistrosDiarios] = useState([]);
    const [formDataEdicion, setFormDataEdicion] = useState({
        peso: '',
        idTipoProducto: '',
        idRegistroDiario: '',
        observacion: ''
    });

    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina] = useState(10);

    const apiUrl = import.meta.env.VITE_API_URL;

    // Función para formatear nros: 162.570,00
    const formatearToneladas = (valor) => {
        return Number(valor).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

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

    const obtenerRollos = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/rollos-ingresados`);
            setRollos(response.data);
            setRollosFiltrados(response.data);
        } catch (err) {
            setError('Error al cargar datos');
        } finally {
            setIsLoading(false);
        }
    };

    const iniciarEdicion = (rollo) => {
        setEditandoRollo(rollo);
        // Mapeo dinámico para encontrar IDs si vienen como objetos
        setFormDataEdicion({
            peso: rollo.peso,
            idTipoProducto: rollo.idTipoProducto || (rollo.tipoProducto?.id || ''),
            idRegistroDiario: rollo.idRegistroDiario || (rollo.registroFinancieroDiario?.id || ''),
            observacion: rollo.observacion || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const dto = {
                cantidadRollos: editandoRollo.cantidadRollos || 1,
                peso: parseFloat(formDataEdicion.peso),
                idTipoProducto: parseInt(formDataEdicion.idTipoProducto),
                idRegistroDiario: parseInt(formDataEdicion.idRegistroDiario),
                idUsuario: editandoRollo.idUsuario || 1,
                observacion: formDataEdicion.observacion
            };
            await axios.put(`${apiUrl}/rollos-ingresados/${editandoRollo.id}`, dto);
            setEditandoRollo(null);
            obtenerRollos();
            Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire('Error', 'No se pudo actualizar', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const eliminarRollo = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar registro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${apiUrl}/rollos-ingresados/${id}`);
                obtenerRollos();
                Swal.fire('Eliminado', 'El registro ha sido borrado.', 'success');
            } catch (err) {
                Swal.fire('Error', 'No se pudo eliminar', 'error');
            }
        }
    };

    const itemsPaginados = rollosFiltrados.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina);

    return (
        <div className="space-y-6">
            {/* FORMULARIO DE EDICIÓN */}
            {editandoRollo && (
                <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden animate-in fade-in slide-in-from-top-4">
                    <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-white font-bold flex items-center gap-2">
                            <Edit2 className="h-5 w-5" /> Editando Registro #{editandoRollo.id}
                        </h2>
                        <button onClick={() => setEditandoRollo(null)} className="text-white hover:bg-blue-700 p-1 rounded-full"><X/></button>
                    </div>
                    <div className="p-6">
                        <IngresoRollosForm 
                            formData={formDataEdicion}
                            setFormData={setFormDataEdicion}
                            tiposProducto={tiposProducto}
                            registrosDiarios={registrosDiarios}
                            onSubmit={handleActualizar}
                            onCancel={() => setEditandoRollo(null)}
                            isLoading={isLoading}
                            isEdit={true}
                        />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Listado de Rollos</h1>
                    <button onClick={obtenerRollos} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase">Peso</th>
                                <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase">Fecha Reg.</th>
                                <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase">Producto</th>
                                <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                                <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase">Observación</th>
                                <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {itemsPaginados.map((rollo) => (
                                <tr key={rollo.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">#{rollo.id}</td>
                                    
                                    {/* Formato: 162.570,00 */}
                                    <td className="px-4 py-4 text-sm font-bold text-blue-700">
                                        {formatearToneladas(rollo.peso)} tn
                                    </td>

                                    {/* registroFinancieroDiario.fecha */}
                                    <td className="px-4 py-4 text-sm text-gray-600">
                                        {rollo.registroFinancieroDiario?.fecha 
                                            ? new Date(rollo.registroFinancieroDiario.fecha).toLocaleDateString() 
                                            : 'N/A'}
                                    </td>

                                    {/* tipoProducto */}
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                        {typeof rollo.tipoProducto === 'object' ? rollo.tipoProducto.nombre : (rollo.tipoProducto || 'N/A')}
                                    </td>

                                    {/* usuario */}
                                    <td className="px-4 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3 text-gray-400" />
                                            {rollo.usuarioNombre || 'Sistema'}
                                        </div>
                                    </td>

                                    {/* observacion */}
                                    <td className="px-4 py-4 text-sm text-gray-500 italic max-w-xs truncate">
                                        {rollo.observacion || '-'}
                                    </td>

                                    <td className="px-4 py-4 text-right space-x-1">
                                        <button 
                                            onClick={() => iniciarEdicion(rollo)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => eliminarRollo(rollo.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINACIÓN */}
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500">Mostrando página {paginaActual}</p>
                    <div className="flex gap-2">
                        <button 
                            disabled={paginaActual === 1}
                            onClick={() => setPaginaActual(p => p - 1)}
                            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button 
                            disabled={paginaActual * itemsPorPagina >= rollosFiltrados.length}
                            onClick={() => setPaginaActual(p => p + 1)}
                            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* ESTADÍSTICAS */}
                {!isLoading && rollosFiltrados.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg"><Scale className="h-6 w-6 text-blue-600" /></div>
                                <div>
                                    <p className="text-sm text-gray-600">Peso Total</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatearToneladas(rollosFiltrados.reduce((sum, r) => sum + parseFloat(r.peso), 0))} tn
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