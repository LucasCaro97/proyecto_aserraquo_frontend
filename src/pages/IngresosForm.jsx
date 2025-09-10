import { useState, useEffect } from 'react';
import { DollarSign, FileText, User, Save, ArrowLeft, AlertCircle, CheckCircle, Plus, Eye, EyeOff, ListPlus, TrendingUp } from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario';
import { useRegistrosFinancieros } from '../hooks/useRegistrosFinancieros';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import axios from 'axios';

export const IngresosForm = ({ onBack, onSuccess }) => {
    // Estados del formulario de Tipo de Ingreso
    const [nombreTipoIngreso, setNombreTipoIngreso] = useState('');

    // Estados del formulario de Ingreso
    const [montoIngreso, setMontoIngreso] = useState('');
    const [observacionIngreso, setObservacionIngreso] = useState('');
    const [tipoIngresoSeleccionado, setTipoIngresoSeleccionado] = useState('');
    const [registroFinancieroDiario, setRegistroFinancieroDiario] = useState('');

    // Estados para las tablas de últimos registros
    const [ultimosTiposIngreso, setUltimosTiposIngreso] = useState([]);
    const [ultimosIngresos, setUltimosIngresos] = useState([]);
    const [isLoadingUltimosTiposIngreso, setIsLoadingUltimosTiposIngreso] = useState(false);
    const [isLoadingUltimosIngresos, setIsLoadingUltimosIngresos] = useState(false);
    const [mostrarTablaTipos, setMostrarTablaTipos] = useState(true);
    const [mostrarTablaIngresos, setMostrarTablaIngresos] = useState(true);

    // Estados para tipos de ingreso disponibles
    const [tiposIngresoDisponibles, setTiposIngresoDisponibles] = useState([]);
    const [isLoadingTiposIngreso, setIsLoadingTiposIngreso] = useState(false);

    // Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Estados de UI
    const [isLoadingTipoIngreso, setIsLoadingTipoIngreso] = useState(false);
    const [isLoadingIngreso, setIsLoadingIngreso] = useState(false);
    const [isCreatingRegistro, setIsCreatingRegistro] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('ingreso'); // 'ingreso' o 'tipoIngreso'

    // Hook personalizado para obtener el usuario del token
    const { usuario } = useUsuario();

    // Hook personalizado para registros financieros
    const {
        registrosDisponibles,
        isLoadingRegistros,
        cargarRegistrosFinancieros,
        crearRegistroDelDia,
    } = useRegistrosFinancieros();

    // Función para cargar los últimos 10 tipos de ingreso
    const cargarUltimosTiposIngreso = async () => {
        setIsLoadingUltimosTiposIngreso(true);
        try {
            const response = await axios.get(`${apiUrl}/tipo-ingreso`);
            
            setTimeout(() => {
                setUltimosTiposIngreso(response.data);
                setIsLoadingUltimosTiposIngreso(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos tipos de ingreso:', error);
            setIsLoadingUltimosTiposIngreso(false);
        }
    };

    // Función para cargar los últimos 10 ingresos
    const cargarUltimosIngresos = async () => {
        setIsLoadingUltimosIngresos(true);
        try {
            const response = await axios.get(`${apiUrl}/ingreso/sorted-top10-desc`);
            
            setTimeout(() => {
                setUltimosIngresos(response.data);
                setIsLoadingUltimosIngresos(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos ingresos:', error);
            setIsLoadingUltimosIngresos(false);
        }
    };

    // Función para cargar tipos de ingreso disponibles
    const cargarTiposIngresoDisponibles = async () => {
        setIsLoadingTiposIngreso(true);
        try {
            const response = await axios.get(`${apiUrl}/tipo-ingreso/activos`);
            setTiposIngresoDisponibles(response.data);
        } catch (error) {
            console.error('Error al cargar tipos de ingreso disponibles:', error);
        } finally {
            setIsLoadingTiposIngreso(false);
        }
    };

    // Cargar datos cuando el usuario esté disponible
    useEffect(() => {
        if (usuario?.id) {
            cargarUltimosTiposIngreso();
            cargarUltimosIngresos();
            cargarTiposIngresoDisponibles();
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

    const handleSubmitTipoIngreso = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!nombreTipoIngreso.trim()) {
            setError('El nombre del tipo de ingreso es requerido');
            return;
        }

        setIsLoadingTipoIngreso(true);
        setError('');
        setSuccess('');

        try {
            const nuevoTipoIngreso = {
                nombre: nombreTipoIngreso.trim(),
                estado: true
            };

            const response = await axios.post(`${apiUrl}/tipo-ingreso`, nuevoTipoIngreso);
            
            setTimeout(() => {
                setSuccess('Tipo de ingreso registrado exitosamente');
                // Limpiar formulario
                setNombreTipoIngreso('');
                setIsLoadingTipoIngreso(false);

                // Recargar las tablas y tipos de ingreso disponibles
                cargarUltimosTiposIngreso();
                cargarTiposIngresoDisponibles();

                // Callback de éxito si se proporciona
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al registrar tipo de ingreso:', error);
            setError('Error al registrar el tipo de ingreso. Inténtalo de nuevo.');
            setIsLoadingTipoIngreso(false);
        }
    };

    const handleSubmitIngreso = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!montoIngreso || parseFloat(montoIngreso) <= 0) {
            setError('El monto del ingreso debe ser un número válido mayor a 0');
            return;
        }

        if (!tipoIngresoSeleccionado) {
            setError('Debe seleccionar un tipo de ingreso');
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

        setIsLoadingIngreso(true);
        setError('');
        setSuccess('');

        try {
            const nuevoIngreso = {
                monto: parseFloat(montoIngreso),
                idTipoIngreso: parseInt(tipoIngresoSeleccionado),
                idRegistroDiario: parseInt(registroFinancieroDiario),
                idUsuario: usuario.id,
                observacion: observacionIngreso.trim()
            };

            const response = await axios.post(`${apiUrl}/ingreso`, nuevoIngreso);
            
            setTimeout(() => {
                setSuccess('Ingreso registrado exitosamente');
                // Limpiar formulario
                setMontoIngreso('');
                setObservacionIngreso('');
                setTipoIngresoSeleccionado('');
                setRegistroFinancieroDiario('');
                setIsLoadingIngreso(false);

                // Recargar la tabla de últimos ingresos
                cargarUltimosIngresos();
                
                // Callback de éxito si se proporciona
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al registrar ingreso:', error);
            setError('Error al registrar el ingreso. Inténtalo de nuevo.');
            setIsLoadingIngreso(false);
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
                                <h1 className="text-3xl font-bold text-gray-900">Gestión de Ingresos</h1>
                                <p className="text-gray-600 mt-1">Registra ingresos y sus tipos</p>
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
                                        onClick={() => setActiveTab('ingreso')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'ingreso'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp className="h-4 w-4" />
                                            <span>Nuevo Ingreso</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('tipoIngreso')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'tipoIngreso'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <ListPlus className="h-4 w-4" />
                                            <span>Nuevo Tipo de Ingreso</span>
                                        </div>
                                    </button>
                                </nav>
                            </div>
                        </div>
                        {/* Formulario de Ingreso */}
                        {activeTab === 'ingreso' && (
                            <div className="space-y-6">
                                {/* Campo Monto */}
                                <div>
                                    <label htmlFor="montoIngreso" className="block text-sm font-medium text-gray-700 mb-2">
                                        Monto ($) *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="montoIngreso"
                                            type="text"
                                            value={montoIngreso}
                                            onChange={(e) => handleMoneyChange(e, setMontoIngreso)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ingrese el monto del ingreso"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Campo Tipo de Ingreso */}
                                <div>
                                    <label htmlFor="tipoIngresoSeleccionado" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Ingreso *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ListPlus className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="tipoIngresoSeleccionado"
                                            value={tipoIngresoSeleccionado}
                                            onChange={(e) => setTipoIngresoSeleccionado(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                        >
                                            <option value="" disabled>Seleccione un tipo de ingreso</option>
                                            {isLoadingTiposIngreso ? (
                                                <option disabled>Cargando...</option>
                                            ) : (
                                                tiposIngresoDisponibles.map((tipo) => (
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
                                    <label htmlFor="observacionIngreso" className="block text-sm font-medium text-gray-700 mb-2">
                                        Observación
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="observacionIngreso"
                                            type="text"
                                            value={observacionIngreso}
                                            onChange={(e) => setObservacionIngreso(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ej: Cobro de honorarios"
                                        />
                                    </div>
                                </div>

                                {/* Botón de Guardar */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        onClick={handleSubmitIngreso}
                                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                                            isLoadingIngreso ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }`}
                                        disabled={isLoadingIngreso}
                                    >
                                        {isLoadingIngreso ? (
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
                                                Guardar Ingreso
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Formulario de Tipo de Ingreso */}
                        {activeTab === 'tipoIngreso' && (
                            <div className="space-y-6">
                                {/* Campo Nombre del Tipo de Ingreso */}
                                <div>
                                    <label htmlFor="nombreTipoIngreso" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre del Tipo de Ingreso *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ListPlus className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="nombreTipoIngreso"
                                            type="text"
                                            value={nombreTipoIngreso}
                                            onChange={(e) => setNombreTipoIngreso(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ej: Salario, Venta, Regalo"
                                            required
                                        />
                                    </div>
                                </div>
                                {/* Botón de Guardar */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        onClick={handleSubmitTipoIngreso}
                                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                                            isLoadingTipoIngreso ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }`}
                                        disabled={isLoadingTipoIngreso}
                                    >
                                        {isLoadingTipoIngreso ? (
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
                                                Guardar Tipo de Ingreso
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columna derecha: Tablas de registros */}
                    <div className="space-y-6">
                        {/* Tabla de Últimos Ingresos */}
                        {activeTab === 'ingreso' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Últimos Ingresos</h2>
                                    <button
                                        onClick={() => setMostrarTablaIngresos(!mostrarTablaIngresos)}
                                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        {mostrarTablaIngresos ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {isLoadingUltimosIngresos ? (
                                    <div className="text-center py-10">
                                        <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-500">Cargando ingresos...</p>
                                    </div>
                                ) : (
                                    <>
                                        {mostrarTablaIngresos && ultimosIngresos.length > 0 ? (
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
                                                        {ultimosIngresos.map((ingreso) => (
                                                            <tr key={ingreso.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {formatearMoneda(ingreso.monto)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ingreso.tipoIngreso?.nombre}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ingreso.observacion}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatearFecha(ingreso.registroFinancieroDiario?.fecha)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                    Mostrando los últimos {ultimosIngresos.length} registros
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">No hay ingresos registrados.</p>
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
                        )}
                        
                        {/* Tabla de Últimos Tipos de Ingreso */}
                        {activeTab === 'tipoIngreso' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Últimos Tipos de Ingreso</h2>
                                    <button
                                        onClick={() => setMostrarTablaTipos(!mostrarTablaTipos)}
                                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        {mostrarTablaTipos ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {isLoadingUltimosTiposIngreso ? (
                                    <div className="text-center py-10">
                                        <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-500">Cargando tipos de ingreso...</p>
                                    </div>
                                ) : (
                                    <>
                                        {mostrarTablaTipos && ultimosTiposIngreso.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Nombre
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {ultimosTiposIngreso.map((tipo) => (
                                                            <tr key={tipo.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tipo.nombre}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                    Mostrando los últimos {ultimosTiposIngreso.length} registros
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">No hay tipos de ingreso registrados.</p>
                                        )}

                                        {/* Botón para recargar datos */}
                                        {!isLoadingUltimosTiposIngreso && ultimosTiposIngreso.length > 0 && (
                                            <div className="mt-4 text-center">
                                                <button
                                                    onClick={cargarUltimosTiposIngreso}
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