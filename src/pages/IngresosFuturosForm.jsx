import { useState, useEffect } from 'react';
import { Truck, Package, DollarSign, Calendar, User, Save, ArrowLeft, AlertCircle, CheckCircle, Plus, Eye, EyeOff, FileText } from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario';
import { useRegistrosFinancieros } from '../hooks/useRegistrosFinancieros';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import { CrearRegistroModal } from '../components/CrearRegistroModal';
import axios from 'axios';

export const IngresosFuturosForm = ({ onBack, onSuccess }) => {
    // Estados del formulario
    const [paquetesDespachados, setPaquetesDespachados] = useState('');
    const [camionesDespachados, setCamionesDespachados] = useState('');
    const [ventasTotales, setVentasTotales] = useState('');
    const [observacion, setObservacion] = useState('');
    const [registroFinancieroDiario, setRegistroFinancieroDiario] = useState('');

    // Estados para la tabla de últimos registros
    const [ultimosIngresos, setUltimosIngresos] = useState([]);
    const [isLoadingUltimosIngresos, setIsLoadingUltimosIngresos] = useState(false);
    const [mostrarTabla, setMostrarTabla] = useState(true);

    // Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Estados de UI
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingRegistro, setIsCreatingRegistro] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Hook personalizado para registros financieros
    const {
        registrosDisponibles,
        isLoadingRegistros,
        error: errorRegistros,
        cargarRegistrosFinancieros,
        crearRegistroDelDia,
        clearError: clearErrorRegistros
    } = useRegistrosFinancieros();

    //estado para controlar el modal
    const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);

    // Hook personalizado para obtener el usuario del token
    const { usuario } = useUsuario();

    // Función para cargar los últimos 10 ingresos futuros
    const cargarUltimosIngresos = async () => {
        if (!usuario?.id) return;

        setIsLoadingUltimosIngresos(true);
        try {
            const response = await axios.get(`${apiUrl}/ingreso-futuro/sorted-top10-desc`);

            setTimeout(() => {
                setUltimosIngresos(response.data);
                setIsLoadingUltimosIngresos(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos ingresos futuros:', error);
            setIsLoadingUltimosIngresos(false);
        }
    };

    // Cargar últimos INGRESOS cuando el usuario esté disponible
    useEffect(() => {
        if (usuario?.id) {
            cargarUltimosIngresos();
        }
    }, [usuario]);


    const handleCrearRegistroDelDia = async (fecha) => {
        setIsCreatingRegistro(true);
        setError('');

        try {
            const nuevoRegistro = await crearRegistroDelDia(fecha);

            // Seleccionar automáticamente el nuevo registro creado
            if (nuevoRegistro && nuevoRegistro.id) {
                setRegistroFinancieroDiario(nuevoRegistro.id.toString());
                setSuccess('Registro del día actual creado exitosamente');
            }
            // Cerrar el modal después de crear con éxito
            setMostrarModalRegistro(false);
        } catch (error) {
            // El error ya está manejado por el hook
            setError(error.message);
        } finally {
            setIsCreatingRegistro(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!paquetesDespachados || parseInt(paquetesDespachados) < 0) {
            setError('Los paquetes despachados deben ser un número válido');
            return;
        }

        if (!camionesDespachados || parseInt(camionesDespachados) < 0) {
            setError('Los camiones despachados deben ser un número válido');
            return;
        }

        if (!ventasTotales || parseFloat(ventasTotales) < 0) {
            setError('Las ventas totales deben ser un número válido');
            return;
        }

        if (!registroFinancieroDiario) {
            setError('Debe seleccionar un registro financiero diario');
            return;
        }

        if (!usuario?.id) {
            setError('Error: No se pudo obtener la información del usuario');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const nuevoIngresoFuturo = {
                paquetesDespachados: parseInt(paquetesDespachados),
                camionesDespachados: parseInt(camionesDespachados),
                ventasTotales: parseFloat(ventasTotales),
                idRegistroDiario: parseInt(registroFinancieroDiario),
                idUsuario: usuario.id,
                observacion: observacion.trim() || null
            };

            const response = await axios.post(`${apiUrl}/ingreso-futuro`, nuevoIngresoFuturo);

            setTimeout(() => {
                setSuccess('Ingreso futuro registrado exitosamente');
                // Limpiar formulario
                setPaquetesDespachados('');
                setCamionesDespachados('');
                setVentasTotales('');
                setObservacion('');
                setRegistroFinancieroDiario('');
                setIsLoading(false);

                // Recargar la tabla de últimos ingresos para mostrar el nuevo registro
                cargarUltimosIngresos();

                // Callback de éxito si se proporciona
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al registrar ingreso futuro:', error);
            setError('Error al registrar el ingreso futuro. Inténtalo de nuevo.');
            setIsLoading(false);
        }
    };

    const handleNumberChange = (value, setter) => {
        // Permitir solo números enteros para paquetes y camiones
        if (value === '' || /^\d+$/.test(value)) {
            setter(value);
        }
    };

    const handleMoneyChange = (e) => {
        const value = e.target.value;
        // Permitir solo números y punto decimal
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setVentasTotales(value);
        }
    };

    const formatearFecha = (fechaString) => {
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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Registro de Ingreso Futuro</h1>
                                <p className="text-gray-600 mt-1">Registra proyecciones de despachos y ventas futuras</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna izquierda: Formulario */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        {/* Información del usuario */}
                        {usuario && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-3">
                                <User className="h-5 w-5 text-blue-600" />
                                <div>
                                    <span className="text-sm text-blue-800">Usuario actual: </span>
                                    <span className="font-medium text-blue-900">{usuario.nombre}</span>
                                </div>
                            </div>
                        )}

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

                        <div className="space-y-6">
                            {/* Campo Paquetes Despachados */}
                            <div>
                                <label htmlFor="paquetes" className="block text-sm font-medium text-gray-700 mb-2">
                                    Paquetes Despachados *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Package className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="paquetes"
                                        type="text"
                                        value={paquetesDespachados}
                                        onChange={(e) => handleNumberChange(e.target.value, setPaquetesDespachados)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Ingrese cantidad de paquetes"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Campo Camiones Despachados */}
                            <div>
                                <label htmlFor="camiones" className="block text-sm font-medium text-gray-700 mb-2">
                                    Camiones Despachados *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Truck className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="camiones"
                                        type="text"
                                        value={camionesDespachados}
                                        onChange={(e) => handleNumberChange(e.target.value, setCamionesDespachados)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Ingrese cantidad de camiones"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Campo Ventas Totales */}
                            <div>
                                <label htmlFor="ventas" className="block text-sm font-medium text-gray-700 mb-2">
                                    Ventas Totales ($) *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="ventas"
                                        type="text"
                                        value={ventasTotales}
                                        onChange={handleMoneyChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Ingrese el monto total de ventas"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-sm">ARS</span>
                                    </div>
                                </div>
                            </div>

                            {/* Campo Observación */}
                            <div>
                                <label htmlFor="observacion" className="block text-sm font-medium text-gray-700 mb-2">
                                    Observación
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        id="observacion"
                                        value={observacion}
                                        onChange={(e) => setObservacion(e.target.value)}
                                        rows={3}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                        placeholder="Observaciones adicionales (opcional)"
                                    />
                                </div>
                            </div>

                            {/* Campo Registro Financiero Diario */}
                            <div>
                                <label htmlFor="registroFinanciero" className="block text-sm font-medium text-gray-700 mb-2">
                                    Registro Financiero Diario *
                                </label>
                                <div className="flex space-x-3">
                                    <select
                                        id="registroFinanciero"
                                        value={registroFinancieroDiario}
                                        onChange={(e) => setRegistroFinancieroDiario(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                                        required
                                        disabled={isLoadingRegistros}
                                    >
                                        <option value="">
                                            {isLoadingRegistros ? 'Cargando registros...' : `Seleccione un registro financiero`}
                                        </option>
                                        {registrosDisponibles.map((registro) => (
                                            <option key={registro.id} value={registro.id}>
                                                {`${obtenerDiaDeLaSemana(registro.fecha)}  ${formatearFecha(registro.fecha)}`}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Botón para crear registro del día actual */}
                                    <button
                                        type="button"
                                        onClick={() => { setError(''); setMostrarModalRegistro(true); }} // Limpiar error y abrir modal
                                        disabled={isLoadingRegistros}
                                        className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoadingRegistros
                                            ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                        title="Crear registro con fecha específica"
                                    >
                                        {isCreatingRegistro ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <Plus className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isLoading || isLoadingRegistros || !usuario}
                                    className={`flex-1 font-bold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading || isLoadingRegistros || !usuario
                                        ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                        } flex items-center justify-center space-x-2`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>Registrar Ingreso</span>
                                        </>
                                    )}
                                </button>

                                {onBack && (
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                        disabled={isLoading}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className="mt-6 text-center text-gray-500 text-sm">
                            <p>Los campos marcados con * son obligatorios</p>
                        </div>
                    </div>

                    {/* Columna derecha: Tabla de últimos registros */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Últimos Registros</h2>
                            <button
                                onClick={() => setMostrarTabla(!mostrarTabla)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title={mostrarTabla ? "Ocultar tabla" : "Mostrar tabla"}
                            >
                                {mostrarTabla ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {mostrarTabla && (
                            <>
                                {isLoadingUltimosIngresos ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-600">Cargando registros...</span>
                                    </div>
                                ) : ultimosIngresos.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <p>No hay registros de ingresos futuros aún</p>
                                        <p className="text-sm">Los ingresos que registres aparecerán aquí</p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-lg border border-gray-200">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Fecha
                                                        </th>
                                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Paq.
                                                        </th>
                                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Cam.
                                                        </th>
                                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Ventas
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {ultimosIngresos.map((ingreso, index) => (
                                                        <tr
                                                            key={ingreso.id || index}
                                                            className={`hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-green-50' : ''}`}
                                                        >
                                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                {formatearFecha(ingreso.registroFinancieroDiario.fecha)}
                                                            </td>
                                                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {ingreso.paquetesDespachados.toLocaleString('es-AR')}
                                                            </td>
                                                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {ingreso.camionesDespachados.toLocaleString('es-AR')}
                                                            </td>
                                                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                                                                {formatearMoneda(ingreso.ventasTotales)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Indicador de registro más reciente */}
                                        {ultimosIngresos.length > 0 && (
                                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                Mostrando los últimos {ultimosIngresos.length} registros • El más reciente aparece resaltado
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Botón para recargar datos */}
                                {!isLoadingUltimosIngresos && ultimosIngresos.length > 0 && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={cargarUltimosIngresos}
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                        >
                                            Actualizar lista
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <CrearRegistroModal
                isOpen={mostrarModalRegistro}
                onClose={() => { setMostrarModalRegistro(false); setError(''); }} // Limpiar error al cerrar
                onCrearRegistro={handleCrearRegistroDelDia}
                isCreating={isCreatingRegistro}
                error={error}
            />

        </div>
    );
};