import { useState, useEffect } from 'react';
import { DollarSign, FileText, User, Save, ArrowLeft, AlertCircle, CheckCircle, Plus, Eye, EyeOff, ListPlus, TrendingDown, Clock } from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario';
import { useRegistrosFinancieros } from '../hooks/useRegistrosFinancieros';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import axios from 'axios';

export const EgresosFuturosForm = ({ onBack, onSuccess }) => {
    // Estados del formulario de Tipo de Deuda Futura
    const [nombreTipoDeuda, setNombreTipoDeuda] = useState('');

    // Estados del formulario de Deuda Futura
    const [montoDeuda, setMontoDeuda] = useState('');
    const [observacionDeuda, setObservacionDeuda] = useState('');
    const [tipoDeudaSeleccionado, setTipoDeudaSeleccionado] = useState('');
    const [registroFinancieroDiario, setRegistroFinancieroDiario] = useState('');

    // Estados para las tablas de últimos registros
    const [ultimosTiposDeuda, setUltimosTiposDeuda] = useState([]);
    const [ultimosDeudas, setUltimosDeudas] = useState([]);
    const [isLoadingUltimosTiposDeuda, setIsLoadingUltimosTiposDeuda] = useState(false);
    const [isLoadingUltimosDeudas, setIsLoadingUltimosDeudas] = useState(false);
    const [mostrarTablaTipos, setMostrarTablaTipos] = useState(true);
    const [mostrarTablaDeudas, setMostrarTablaDeudas] = useState(true);

    // Estados para tipos de deuda disponibles
    const [tiposDeudaDisponibles, setTiposDeudaDisponibles] = useState([]);
    const [isLoadingTiposDeuda, setIsLoadingTiposDeuda] = useState(false);

    // Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Estados de UI
    const [isLoadingTipoDeuda, setIsLoadingTipoDeuda] = useState(false);
    const [isLoadingDeuda, setIsLoadingDeuda] = useState(false);
    const [isCreatingRegistro, setIsCreatingRegistro] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('deuda'); // 'deuda' o 'tipoDeuda'

    // Hook personalizado para obtener el usuario del token
    const { usuario } = useUsuario();

    // Hook personalizado para registros financieros
    const {
        registrosDisponibles,
        isLoadingRegistros,
        cargarRegistrosFinancieros,
        crearRegistroDelDia,
    } = useRegistrosFinancieros();

    // Función para cargar los últimos 10 tipos de deuda
    const cargarUltimosTiposDeuda = async () => {
        setIsLoadingUltimosTiposDeuda(true);
        try {
            const response = await axios.get(`${apiUrl}/tipo-deuda-futura`);
            
            setTimeout(() => {
                setUltimosTiposDeuda(response.data);
                setIsLoadingUltimosTiposDeuda(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos tipos de deuda:', error);
            setIsLoadingUltimosTiposDeuda(false);
        }
    };

    // Función para cargar los últimos 10 egresos futuros
    const cargarUltimosDeudas = async () => {
        setIsLoadingUltimosDeudas(true);
        try {
            const response = await axios.get(`${apiUrl}/deuda-futura/sorted-top10-desc`);
            
            setTimeout(() => {
                setUltimosDeudas(response.data);
                setIsLoadingUltimosDeudas(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos egresos futuros:', error);
            setIsLoadingUltimosDeudas(false);
        }
    };

    // Función para cargar tipos de deuda disponibles
    const cargarTiposDeudaDisponibles = async () => {
        setIsLoadingTiposDeuda(true);
        try {
            const response = await axios.get(`${apiUrl}/tipo-deuda-futura`);
            setTiposDeudaDisponibles(response.data);
        } catch (error) {
            console.error('Error al cargar tipos de deuda disponibles:', error);
        } finally {
            setIsLoadingTiposDeuda(false);
        }
    };

    // Cargar datos cuando el usuario esté disponible
    useEffect(() => {
        if (usuario?.id) {
            cargarUltimosTiposDeuda();
            cargarUltimosDeudas();
            cargarTiposDeudaDisponibles();
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

    const handleSubmitTipoDeuda = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!nombreTipoDeuda.trim()) {
            setError('El nombre del tipo de deuda es requerido');
            return;
        }

        setIsLoadingTipoDeuda(true);
        setError('');
        setSuccess('');

        try {
            const nuevoTipoDeuda = {
                nombre: nombreTipoDeuda.trim(),
                estado: true
            };

            const response = await axios.post(`${apiUrl}/tipo-deuda-futura`, nuevoTipoDeuda);
            
            setTimeout(() => {
                setSuccess('Tipo de deuda registrado exitosamente');
                // Limpiar formulario
                setNombreTipoDeuda('');
                setIsLoadingTipoDeuda(false);

                // Recargar las tablas y tipos de deuda disponibles
                cargarUltimosTiposDeuda();
                cargarTiposDeudaDisponibles();

                // Callback de éxito si se proporciona
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al registrar tipo de deuda:', error);
            setError('Error al registrar el tipo de deuda. Inténtalo de nuevo.');
            setIsLoadingTipoDeuda(false);
        }
    };

    const handleSubmitDeuda = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!montoDeuda || parseFloat(montoDeuda) <= 0) {
            setError('El monto del egreso futuro debe ser un número válido mayor a 0');
            return;
        }

        if (!tipoDeudaSeleccionado) {
            setError('Debe seleccionar un tipo de deuda futura');
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

        setIsLoadingDeuda(true);
        setError('');
        setSuccess('');

        try {
            const nuevaDeuda = {
                monto: parseFloat(montoDeuda),
                idTipoDeudaFutura: parseInt(tipoDeudaSeleccionado),
                idRegistroFinancieroDiario: parseInt(registroFinancieroDiario),
                idUsuario: usuario.id,
                observacion: observacionDeuda.trim()
            };

            const response = await axios.post(`${apiUrl}/deuda-futura`, nuevaDeuda);
            
            setTimeout(() => {
                setSuccess('Egreso futuro registrado exitosamente');
                // Limpiar formulario
                setMontoDeuda('');
                setObservacionDeuda('');
                setTipoDeudaSeleccionado('');
                setRegistroFinancieroDiario('');
                setIsLoadingDeuda(false);

                // Recargar la tabla de egresos futuros
                cargarUltimosDeudas();
                
                // Callback de éxito si se proporciona
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al registrar egreso futuro:', error);
            setError('Error al registrar el egreso futuro. Inténtalo de nuevo.');
            setIsLoadingDeuda(false);
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
                                <h1 className="text-3xl font-bold text-gray-900">Gestión de Egresos Futuros</h1>
                                <p className="text-gray-600 mt-1">Registra egresos futuros y sus tipos</p>
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
                                        onClick={() => setActiveTab('deuda')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'deuda'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <TrendingDown className="h-4 w-4" />
                                            <span>Nuevo Egreso Futuro</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('tipoDeuda')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'tipoDeuda'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <ListPlus className="h-4 w-4" />
                                            <span>Nuevo Tipo de Egreso Futuro</span>
                                        </div>
                                    </button>
                                </nav>
                            </div>
                        </div>
                        {/* Formulario de Deuda Futura */}
                        {activeTab === 'deuda' && (
                            <div className="space-y-6">
                                {/* Campo Monto */}
                                <div>
                                    <label htmlFor="montoDeuda" className="block text-sm font-medium text-gray-700 mb-2">
                                        Monto ($) *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="montoDeuda"
                                            type="text"
                                            value={montoDeuda}
                                            onChange={(e) => handleMoneyChange(e, setMontoDeuda)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ingrese el monto del egreso futuro"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Campo Tipo de Deuda Futura */}
                                <div>
                                    <label htmlFor="tipoDeudaSeleccionado" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Deuda *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="tipoDeudaSeleccionado"
                                            value={tipoDeudaSeleccionado}
                                            onChange={(e) => setTipoDeudaSeleccionado(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                        >
                                            <option value="" disabled>Seleccione un tipo de deuda</option>
                                            {isLoadingTiposDeuda ? (
                                                <option disabled>Cargando...</option>
                                            ) : (
                                                tiposDeudaDisponibles.map((tipo) => (
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
                                    <label htmlFor="observacionDeuda" className="block text-sm font-medium text-gray-700 mb-2">
                                        Observación
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="observacionDeuda"
                                            type="text"
                                            value={observacionDeuda}
                                            onChange={(e) => setObservacionDeuda(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ej: Cuota de préstamo, servicio por vencer"
                                        />
                                    </div>
                                </div>

                                {/* Botón de Guardar */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        onClick={handleSubmitDeuda}
                                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                                            isLoadingDeuda ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }`}
                                        disabled={isLoadingDeuda}
                                    >
                                        {isLoadingDeuda ? (
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
                                                Guardar Egreso Futuro
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Formulario de Tipo de Deuda Futura */}
                        {activeTab === 'tipoDeuda' && (
                            <div className="space-y-6">
                                {/* Campo Nombre del Tipo de Deuda Futura */}
                                <div>
                                    <label htmlFor="nombreTipoDeuda" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre del Tipo de Deuda Futura *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ListPlus className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="nombreTipoDeuda"
                                            type="text"
                                            value={nombreTipoDeuda}
                                            onChange={(e) => setNombreTipoDeuda(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ej: Préstamo bancario, Pago de alquiler"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Botón de Guardar */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        onClick={handleSubmitTipoDeuda}
                                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                                            isLoadingTipoDeuda ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }`}
                                        disabled={isLoadingTipoDeuda}
                                    >
                                        {isLoadingTipoDeuda ? (
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
                                                Guardar Tipo de Deuda
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columna derecha: Tablas de registros */}
                    <div className="space-y-6">
                        {/* Tabla de Últimos Egresos Futuros */}
                        {activeTab === 'deuda' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Últimos Egresos Futuros</h2>
                                    <button
                                        onClick={() => setMostrarTablaDeudas(!mostrarTablaDeudas)}
                                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        {mostrarTablaDeudas ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {isLoadingUltimosDeudas ? (
                                    <div className="text-center py-10">
                                        <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-500">Cargando egresos futuros...</p>
                                    </div>
                                ) : (
                                    <>
                                        {mostrarTablaDeudas && ultimosDeudas.length > 0 ? (
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
                                                        {ultimosDeudas.map((deuda) => (
                                                            <tr key={deuda.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {formatearMoneda(deuda.monto)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deuda.tipoDeudaFutura?.nombre}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deuda.observacion}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatearFecha(deuda.registroFinancieroDiario?.fecha)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                    Mostrando los últimos {ultimosDeudas.length} registros
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">No hay egresos futuros registrados.</p>
                                        )}

                                        {/* Botón para recargar datos */}
                                        {!isLoadingUltimosDeudas && ultimosDeudas.length > 0 && (
                                            <div className="mt-4 text-center">
                                                <button
                                                    onClick={cargarUltimosDeudas}
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
                        
                        {/* Tabla de Últimos Tipos de Deuda */}
                        {activeTab === 'tipoDeuda' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Últimos Tipos de Deuda</h2>
                                    <button
                                        onClick={() => setMostrarTablaTipos(!mostrarTablaTipos)}
                                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        {mostrarTablaTipos ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {isLoadingUltimosTiposDeuda ? (
                                    <div className="text-center py-10">
                                        <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-500">Cargando tipos de deuda...</p>
                                    </div>
                                ) : (
                                    <>
                                        {mostrarTablaTipos && ultimosTiposDeuda.length > 0 ? (
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
                                                        {ultimosTiposDeuda.map((tipo) => (
                                                            <tr key={tipo.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tipo.nombre}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                    Mostrando los últimos {ultimosTiposDeuda.length} registros
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">No hay tipos de deuda registrados.</p>
                                        )}

                                        {/* Botón para recargar datos */}
                                        {!isLoadingUltimosTiposDeuda && ultimosTiposDeuda.length > 0 && (
                                            <div className="mt-4 text-center">
                                                <button
                                                    onClick={cargarUltimosTiposDeuda}
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