import { useState, useEffect } from 'react';
import { DollarSign, FileText, User, Save, ArrowLeft, AlertCircle, CheckCircle, Plus, Eye, EyeOff, ListPlus, TrendingDown, Star } from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario';
import { useRegistrosFinancieros } from '../hooks/useRegistrosFinancieros';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import axios from 'axios';

export const EgresosForm = ({ onBack, onSuccess }) => {
    // Estados del formulario de Tipo de Egreso
    const [nombreTipoEgreso, setNombreTipoEgreso] = useState('');
    const [prioridadSeleccionada, setPrioridadSeleccionada] = useState('');

    // Estados del formulario de Egreso
    const [montoEgreso, setMontoEgreso] = useState('');
    const [observacionEgreso, setObservacionEgreso] = useState('');
    const [tipoEgresoSeleccionado, setTipoEgresoSeleccionado] = useState('');
    const [registroFinancieroDiario, setRegistroFinancieroDiario] = useState('');

    // Estados para las tablas de últimos registros
    const [ultimosTiposEgreso, setUltimosTiposEgreso] = useState([]);
    const [ultimosEgresos, setUltimosEgresos] = useState([]);
    const [isLoadingUltimosTiposEgreso, setIsLoadingUltimosTiposEgreso] = useState(false);
    const [isLoadingUltimosEgresos, setIsLoadingUltimosEgresos] = useState(false);
    const [mostrarTablaTipos, setMostrarTablaTipos] = useState(true);
    const [mostrarTablaEgresos, setMostrarTablaEgresos] = useState(true);

    // Estados para tipos de egreso y prioridades disponibles
    const [tiposEgresoDisponibles, setTiposEgresoDisponibles] = useState([]);
    const [prioridadesDisponibles, setPrioridadesDisponibles] = useState([]);
    const [isLoadingTiposEgreso, setIsLoadingTiposEgreso] = useState(false);
    const [isLoadingPrioridades, setIsLoadingPrioridades] = useState(false);

    // Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Estados de UI
    const [isLoadingTipoEgreso, setIsLoadingTipoEgreso] = useState(false);
    const [isLoadingEgreso, setIsLoadingEgreso] = useState(false);
    const [isCreatingRegistro, setIsCreatingRegistro] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('egreso'); // 'egreso' o 'tipoEgreso'

    // Hook personalizado para obtener el usuario del token
    const { usuario } = useUsuario();

    // Hook personalizado para registros financieros
    const {
        registrosDisponibles,
        isLoadingRegistros,
        cargarRegistrosFinancieros,
        crearRegistroDelDia,
    } = useRegistrosFinancieros();

    // Función para cargar los últimos 10 tipos de egreso
    const cargarUltimosTiposEgreso = async () => {
        setIsLoadingUltimosTiposEgreso(true);
        try {
            const response = await axios.get(`${apiUrl}/tipo-egreso`);
            
            setTimeout(() => {
                setUltimosTiposEgreso(response.data);
                setIsLoadingUltimosTiposEgreso(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos tipos de egreso:', error);
            setIsLoadingUltimosTiposEgreso(false);
        }
    };

    // Función para cargar los últimos 10 egresos
    const cargarUltimosEgresos = async () => {
        setIsLoadingUltimosEgresos(true);
        try {
            const response = await axios.get(`${apiUrl}/egreso/sorted-top10-desc`);
            
            setTimeout(() => {
                setUltimosEgresos(response.data);
                setIsLoadingUltimosEgresos(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos egresos:', error);
            setIsLoadingUltimosEgresos(false);
        }
    };

    // Función para cargar tipos de egreso disponibles
    const cargarTiposEgresoDisponibles = async () => {
        setIsLoadingTiposEgreso(true);
        try {
            const response = await axios.get(`${apiUrl}/tipo-egreso/activos`);
            setTiposEgresoDisponibles(response.data);
        } catch (error) {
            console.error('Error al cargar tipos de egreso disponibles:', error);
        } finally {
            setIsLoadingTiposEgreso(false);
        }
    };

    // Función para cargar prioridades disponibles
    const cargarPrioridadesDisponibles = async () => {
        setIsLoadingPrioridades(true);
        try {
            const response = await axios.get(`${apiUrl}/prioridad`);
            setPrioridadesDisponibles(response.data);
        } catch (error) {
            console.error('Error al cargar prioridades disponibles:', error);
        } finally {
            setIsLoadingPrioridades(false);
        }
    };

    // Cargar datos cuando el usuario esté disponible
    useEffect(() => {
        if (usuario?.id) {
            cargarUltimosTiposEgreso();
            cargarUltimosEgresos();
            cargarTiposEgresoDisponibles();
            cargarPrioridadesDisponibles();
            cargarRegistrosFinancieros();
        }
    }, [usuario]);

    const handleCrearRegistroDelDia = async () => {
        setIsCreatingRegistro(true);
        setError('');

        try {
            const nuevoRegistro = await crearRegistroDelDia();
            
            if (nuevoRegistro && nuevoRegistro.id) {
                setRegistroFinancieroDiario(nuevoRegistro.id.toString());
                setSuccess('Registro del día actual creado exitosamente');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsCreatingRegistro(false);
        }
    };

    const handleSubmitTipoEgreso = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!nombreTipoEgreso.trim()) {
            setError('El nombre del tipo de egreso es requerido');
            return;
        }

        if (!prioridadSeleccionada) {
            setError('Debe seleccionar una prioridad');
            return;
        }

        setIsLoadingTipoEgreso(true);
        setError('');
        setSuccess('');

        try {
            const nuevoTipoEgreso = {
                nombre: nombreTipoEgreso.trim(),
                idPrioridad: parseInt(prioridadSeleccionada),
                estado: true
            };

            const response = await axios.post(`${apiUrl}/tipo-egreso`, nuevoTipoEgreso);
            
            setTimeout(() => {
                setSuccess('Tipo de egreso registrado exitosamente');
                // Limpiar formulario
                setNombreTipoEgreso('');
                setPrioridadSeleccionada('');
                setIsLoadingTipoEgreso(false);

                // Recargar las tablas y tipos de egreso disponibles
                cargarUltimosTiposEgreso();
                cargarTiposEgresoDisponibles();

                // Callback de éxito si se proporciona
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al registrar tipo de egreso:', error);
            setError('Error al registrar el tipo de egreso. Inténtalo de nuevo.');
            setIsLoadingTipoEgreso(false);
        }
    };

    const handleSubmitEgreso = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!montoEgreso || parseFloat(montoEgreso) <= 0) {
            setError('El monto del egreso debe ser un número válido mayor a 0');
            return;
        }

        if (!tipoEgresoSeleccionado) {
            setError('Debe seleccionar un tipo de egreso');
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

        setIsLoadingEgreso(true);
        setError('');
        setSuccess('');

        try {
            const nuevoEgreso = {
                monto: parseFloat(montoEgreso),
                idTipoEgreso: parseInt(tipoEgresoSeleccionado),
                idRegistroDiario: parseInt(registroFinancieroDiario),
                idUsuario: usuario.id,
                observacion: observacionEgreso.trim()
            };

            const response = await axios.post(`${apiUrl}/egreso`, nuevoEgreso);
            
            setTimeout(() => {
                setSuccess('Egreso registrado exitosamente');
                // Limpiar formulario
                setMontoEgreso('');
                setObservacionEgreso('');
                setTipoEgresoSeleccionado('');
                setRegistroFinancieroDiario('');
                setIsLoadingEgreso(false);

                // Recargar la tabla de últimos egresos
                cargarUltimosEgresos();
                
                // Callback de éxito si se proporciona
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al registrar egreso:', error);
            setError('Error al registrar el egreso. Inténtalo de nuevo.');
            setIsLoadingEgreso(false);
        }
    };

    const handleMoneyChange = (e, setter) => {
        const value = e.target.value;
        // Permitir solo números y punto decimal
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setter(value);
        }
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return '';
        const partes = fechaString.split('T')[0].split('-');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    };
    
    const formatearFechaConDia = (fechaString) => {
        if (!fechaString) return '';
        const partes = fechaString.split('-');
        const fecha = `${partes[2]}-${partes[1]}-${partes[0]}`;
        const dia = obtenerDiaDeLaSemana(fechaString);
        return `${dia} ${fecha}`;
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
                                <h1 className="text-3xl font-bold text-gray-900">Gestión de Egresos</h1>
                                <p className="text-gray-600 mt-1">Registra egresos y sus tipos</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna izquierda: Formularios */}
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

                        {/* Tabs */}
                        <div className="mb-6">
                            <div className="border-b border-gray-200">
                                <nav className="flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('egreso')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'egreso'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <TrendingDown className="h-4 w-4" />
                                            <span>Nuevo Egreso</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('tipoEgreso')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'tipoEgreso'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <ListPlus className="h-4 w-4" />
                                            <span>Nuevo Tipo de Egreso</span>
                                        </div>
                                    </button>
                                </nav>
                            </div>
                        </div>
                        {/* Formulario de Egreso */}
                        {activeTab === 'egreso' && (
                            <div className="space-y-6">
                                {/* Campo Monto */}
                                <div>
                                    <label htmlFor="montoEgreso" className="block text-sm font-medium text-gray-700 mb-2">
                                        Monto ($) *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="montoEgreso"
                                            type="text"
                                            value={montoEgreso}
                                            onChange={(e) => handleMoneyChange(e, setMontoEgreso)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ingrese el monto del egreso"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Campo Tipo de Egreso */}
                                <div>
                                    <label htmlFor="tipoEgresoSeleccionado" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Egreso *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ListPlus className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="tipoEgresoSeleccionado"
                                            value={tipoEgresoSeleccionado}
                                            onChange={(e) => setTipoEgresoSeleccionado(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                        >
                                            <option value="" disabled>Seleccione un tipo de egreso</option>
                                            {isLoadingTiposEgreso ? (
                                                <option disabled>Cargando...</option>
                                            ) : (
                                                tiposEgresoDisponibles.map((tipo) => (
                                                    <option key={tipo.id} value={tipo.id}>
                                                        {tipo.nombre}
                                                    </option>
                                                ))
                                            )}
                                        </select>
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
                                                    {formatearFechaConDia(registro.fecha)}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Botón para crear registro del día actual */}
                                        <button
                                            type="button"
                                            onClick={handleCrearRegistroDelDia}
                                            disabled={isCreatingRegistro || isLoadingRegistros}
                                            className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isCreatingRegistro || isLoadingRegistros
                                                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                            title="Crear registro para el día actual"
                                        >
                                            {isCreatingRegistro ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <Plus className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Campo Observación */}
                                <div>
                                    <label htmlFor="observacionEgreso" className="block text-sm font-medium text-gray-700 mb-2">
                                        Observación
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="observacionEgreso"
                                            type="text"
                                            value={observacionEgreso}
                                            onChange={(e) => setObservacionEgreso(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ej: Pago de alquiler, factura de servicio"
                                        />
                                    </div>
                                </div>

                                {/* Botón de Guardar */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        onClick={handleSubmitEgreso}
                                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                                            isLoadingEgreso ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }`}
                                        disabled={isLoadingEgreso}
                                    >
                                        {isLoadingEgreso ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5 mr-2" />
                                                Guardar Egreso
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Formulario de Tipo de Egreso */}
                        {activeTab === 'tipoEgreso' && (
                            <div className="space-y-6">
                                {/* Campo Nombre del Tipo de Egreso */}
                                <div>
                                    <label htmlFor="nombreTipoEgreso" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre del Tipo de Egreso *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ListPlus className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="nombreTipoEgreso"
                                            type="text"
                                            value={nombreTipoEgreso}
                                            onChange={(e) => setNombreTipoEgreso(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ej: Alquiler, Comida, Transporte"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Campo Prioridad */}
                                <div>
                                    <label htmlFor="prioridadSeleccionada" className="block text-sm font-medium text-gray-700 mb-2">
                                        Prioridad *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Star className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="prioridadSeleccionada"
                                            value={prioridadSeleccionada}
                                            onChange={(e) => setPrioridadSeleccionada(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                        >
                                            <option value="" disabled>Seleccione una prioridad</option>
                                            {isLoadingPrioridades ? (
                                                <option disabled>Cargando...</option>
                                            ) : (
                                                prioridadesDisponibles.map((prioridad) => (
                                                    <option key={prioridad.id} value={prioridad.id}>
                                                        {prioridad.nombre}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {/* Botón de Guardar */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        onClick={handleSubmitTipoEgreso}
                                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                                            isLoadingTipoEgreso ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }`}
                                        disabled={isLoadingTipoEgreso}
                                    >
                                        {isLoadingTipoEgreso ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5 mr-2" />
                                                Guardar Tipo de Egreso
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columna derecha: Tablas de registros */}
                    <div className="space-y-6">
                        {/* Tabla de Últimos Egresos */}
                        {activeTab === 'egreso' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Últimos Egresos</h2>
                                    <button
                                        onClick={() => setMostrarTablaEgresos(!mostrarTablaEgresos)}
                                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        {mostrarTablaEgresos ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {isLoadingUltimosEgresos ? (
                                    <div className="text-center py-10">
                                        <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-500">Cargando egresos...</p>
                                    </div>
                                ) : (
                                    <>
                                        {mostrarTablaEgresos && ultimosEgresos.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Monto
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Tipo
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Observación
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Fecha
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {ultimosEgresos.map((egreso) => (
                                                            <tr key={egreso.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {formatearMoneda(egreso.monto)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{egreso.tipoEgreso?.nombre}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{egreso.observacion}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatearFecha(egreso.registroFinancieroDiario?.fecha)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                    Mostrando los últimos {ultimosEgresos.length} registros
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">No hay egresos registrados.</p>
                                        )}

                                        {/* Botón para recargar datos */}
                                        {!isLoadingUltimosEgresos && ultimosEgresos.length > 0 && (
                                            <div className="mt-4 text-center">
                                                <button
                                                    onClick={cargarUltimosEgresos}
                                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                >
                                                    Actualizar lista
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        
                        {/* Tabla de Últimos Tipos de Egreso */}
                        {activeTab === 'tipoEgreso' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Últimos Tipos de Egreso</h2>
                                    <button
                                        onClick={() => setMostrarTablaTipos(!mostrarTablaTipos)}
                                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        {mostrarTablaTipos ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {isLoadingUltimosTiposEgreso ? (
                                    <div className="text-center py-10">
                                        <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-500">Cargando tipos de egreso...</p>
                                    </div>
                                ) : (
                                    <>
                                        {mostrarTablaTipos && ultimosTiposEgreso.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Nombre
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Prioridad
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {ultimosTiposEgreso.map((tipo) => (
                                                            <tr key={tipo.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tipo.nombre}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tipo.prioridad?.nombre}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                    Mostrando los últimos {ultimosTiposEgreso.length} registros
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">No hay tipos de egreso registrados.</p>
                                        )}

                                        {/* Botón para recargar datos */}
                                        {!isLoadingUltimosTiposEgreso && ultimosTiposEgreso.length > 0 && (
                                            <div className="mt-4 text-center">
                                                <button
                                                    onClick={cargarUltimosTiposEgreso}
                                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                >
                                                    Actualizar lista
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};