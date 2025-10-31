import { useState, useEffect, useCallback } from 'react'; // Agregamos useMemo
import { 
    DollarSign, FileText, User, Save, ArrowLeft, AlertCircle, CheckCircle, 
    Plus, Eye, EyeOff, ListPlus, TrendingUp, Star, CreditCard, Banknote, ClipboardCheck // Agregamos ClipboardCheck
} from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario';
import { useRegistrosFinancieros } from '../hooks/useRegistrosFinancieros';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import axios from 'axios';
import { CrearRegistroModal } from '../components/CrearRegistroModal';

// Definimos un valor Epsilon (tolerancia) para comparaciones de punto flotante.
const EPSILON = 0.000001; 

export const IngresosForm = ({ onBack, onSuccess }) => {
    // Estados del formulario de Tipo de Ingreso
    const [nombreTipoIngreso, setNombreTipoIngreso] = useState('');

    // Estados del formulario de Ingreso
    const [montoIngreso, setMontoIngreso] = useState('');
    const [observacionIngreso, setObservacionIngreso] = useState('');
    const [tipoIngresoSeleccionado, setTipoIngresoSeleccionado] = useState('');
    const [registroFinancieroDiario, setRegistroFinancieroDiario] = useState('');

    // --- NUEVOS ESTADOS DE MEDIO DE PAGO ---
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(''); 
    const [metodosPagoDisponibles, setMetodosPagoDisponibles] = useState([]); 
    const [isLoadingMetodosPago, setIsLoadingMetodosPago] = useState(false); 

    // --- ESTADOS PARA GESTIÓN DE CHEQUES ---
    const [chequesDisponibles, setChequesDisponibles] = useState([]);
    const [isLoadingCheques, setIsLoadingCheques] = useState(false);
    const [chequesSeleccionados, setChequesSeleccionados] = useState([]); // Array de IDs de cheques
    // ---------------------------------------------

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

    //estado para controlar el modal
    const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
    
    // NUEVA FUNCIÓN DINÁMICA: Determina si el método es de tipo Cheque (Copiado de EgresosForm.jsx)
    const esMetodoCheque = useCallback((metodoId) => {
        if (!metodoId) return false;
        // Buscamos el objeto del método de pago por su ID
        const metodo = metodosPagoDisponibles.find(m => m.id.toString() === metodoId);
        
        // Verificamos si el método existe y si su nombre contiene "cheque" (insensible a mayúsculas)
        return metodo && metodo.nombre.toLowerCase().includes('cheque');
    }, [metodosPagoDisponibles]); // Se agregó metodosPagoDisponibles a las dependencias

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
    
    // Función para cargar métodos de pago disponibles (Copiado de EgresosForm.jsx)
    const cargarMetodosPagoDisponibles = async () => {
        setIsLoadingMetodosPago(true);
        try {
            const response = await axios.get(`${apiUrl}/medio-de-pago`); 
            setMetodosPagoDisponibles(response.data);
        } catch (error) {
            console.error('Error al cargar métodos de pago disponibles:', error);
        } finally {
            setIsLoadingMetodosPago(false);
        }
    };
    
    // --- FUNCIÓN PARA CARGAR CHEQUES PENDIENTES (PARA INGRESO) ---
    const cargarChequesDisponibles = async () => {
        setIsLoadingCheques(true);
        setError('');
        setChequesDisponibles([]); 

        try {
            // Asumiendo un endpoint para cheques emitidos a favor y pendientes de cobro (Ingreso)
            const response = await axios.get(`${apiUrl}/cheques/disponibles/INGRESO`); 
            
            setTimeout(() => {
                setChequesDisponibles(response.data);
                setIsLoadingCheques(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar cheques disponibles para ingreso:', error);
            setError('Es posible que no haya cheques pendientes disponibles para vincular.');
            setIsLoadingCheques(false);
        }
    };
    // ---------------------------------------------------

    // --- HANDLER DE SELECCIÓN DE CHEQUES (Copiado de EgresosForm.jsx) ---
    const handleChequeSelection = (chequeId) => {
        // Asegurarse de que el ID sea string para la comparación consistente
        const idString = chequeId.toString(); 

        setChequesSeleccionados(prev => 
            prev.includes(idString)
                ? prev.filter(id => id !== idString) // Deseleccionar
                : [...prev, idString] // Seleccionar
        );
    };
    // ----------------------------------------

    // Cargar datos cuando el usuario esté disponible
    useEffect(() => {
        if (usuario?.id) {
            cargarUltimosTiposIngreso();
            cargarUltimosIngresos();
            cargarTiposIngresoDisponibles();
            cargarMetodosPagoDisponibles(); // Se agregó la carga de métodos de pago
            cargarRegistrosFinancieros();
        }
    }, [usuario]);
    
    // --- EFECTO PARA CARGAR CHEQUES PENDIENTES BASADO EN EL MÉTODO DE PAGO ---
    useEffect(() => {
        const isChequeSelected = esMetodoCheque(metodoPagoSeleccionado);
        
        if (activeTab === 'ingreso' && isChequeSelected) {
            cargarChequesDisponibles();
        } else if (!isChequeSelected) {
            // Limpiar si se selecciona otro método
            setChequesDisponibles([]);
            setChequesSeleccionados([]);
        }
    }, [metodoPagoSeleccionado, activeTab, esMetodoCheque]); 
    // ------------------------------------------------------------------------

    const handleCrearRegistroDelDia = async (fecha) => {
        setIsCreatingRegistro(true);
        setError('');

        try {
            const nuevoRegistro = await crearRegistroDelDia(fecha);

            if (nuevoRegistro && nuevoRegistro.id) {
                setRegistroFinancieroDiario(nuevoRegistro.id.toString());
                setSuccess('Registro del día actual creado exitosamente');
            }
            setMostrarModalRegistro(false);
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

        // 1. Validaciones básicas
        if (!montoIngreso || parseFloat(montoIngreso) <= 0) {
            setError('El monto del ingreso debe ser un número válido mayor a 0');
            return;
        }

        if (!tipoIngresoSeleccionado) {
            setError('Debe seleccionar un tipo de ingreso');
            return;
        }
        
        // **NUEVA VALIDACIÓN**
        if (!metodoPagoSeleccionado) {
            setError('Debe seleccionar un método de pago');
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

        const montoIngresoFloat = parseFloat(montoIngreso);
        const isChequeMethod = esMetodoCheque(metodoPagoSeleccionado);

        // 2. Validación de cheques (solo si es un método de cheque)
        if (isChequeMethod) {
            if (chequesSeleccionados.length === 0) {
                setError('Debe seleccionar al menos un cheque para vincular a este ingreso.');
                return;
            }

            // Cálculo del total de cheques seleccionados
            const totalCheques = chequesSeleccionados.reduce((sum, id) => {
                const cheque = chequesDisponibles.find(c => c.id.toString() === id);
                return sum + (cheque ? cheque.monto : 0);
            }, 0);
            
            // 3. Validación de monto vs cheques seleccionados usando EPSILON
            if (Math.abs(totalCheques - montoIngresoFloat) > EPSILON) {
                 setError(`El monto del ingreso (${formatearMoneda(montoIngresoFloat)}) no coincide con el total de los cheques seleccionados (${formatearMoneda(totalCheques)}). Por favor, ajuste el monto o la selección de cheques.`);
                 return;
            }
        }
        
        setIsLoadingIngreso(true);
        setError('');
        setSuccess('');

        try {
            const nuevoIngreso = {
                monto: montoIngresoFloat,
                idTipoIngreso: parseInt(tipoIngresoSeleccionado),
                idRegistroDiario: parseInt(registroFinancieroDiario),
                idUsuario: usuario.id,
                observacion: observacionIngreso.trim(),
                idMedioDePago: parseInt(metodoPagoSeleccionado), // Se agregó medio de pago
                idChequesVinculados: isChequeMethod ? chequesSeleccionados.map(id => parseInt(id)) : [], // Se agregaron cheques vinculados
            };

            const response = await axios.post(`${apiUrl}/ingreso`, nuevoIngreso);

            setTimeout(() => {
                setSuccess('Ingreso registrado exitosamente');
                // Limpiar formulario y estados de cheque
                setMontoIngreso('');
                setObservacionIngreso('');
                setTipoIngresoSeleccionado('');
                setRegistroFinancieroDiario('');
                setMetodoPagoSeleccionado(''); // Se limpió el método de pago
                setChequesSeleccionados([]); // Se limpiaron los cheques seleccionados
                setChequesDisponibles([]); // Se limpiaron los cheques disponibles
                
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
                            <form onSubmit={handleSubmitIngreso} className="space-y-6">
                                
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
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="tipoIngresoSeleccionado"
                                            value={tipoIngresoSeleccionado}
                                            onChange={(e) => setTipoIngresoSeleccionado(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none"
                                            required
                                        >
                                            <option value="">Seleccione un tipo de ingreso</option>
                                            {tiposIngresoDisponibles.map((tipo) => (
                                                <option key={tipo.id} value={tipo.id.toString()}>
                                                    {tipo.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        {isLoadingTiposIngreso && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Campo Medio de Pago (NUEVO) */}
                                <div>
                                    <label htmlFor="metodoPagoSeleccionado" className="block text-sm font-medium text-gray-700 mb-2">
                                        Medio de Pago *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CreditCard className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="metodoPagoSeleccionado"
                                            value={metodoPagoSeleccionado}
                                            onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none"
                                            required
                                        >
                                            <option value="">Seleccione un método de pago</option>
                                            {metodosPagoDisponibles.map((metodo) => (
                                                <option key={metodo.id} value={metodo.id.toString()}>
                                                    {metodo.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        {isLoadingMetodosPago && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bloque de Selección de Cheques (Replicado de EgresosForm.jsx) */}
                                {esMetodoCheque(metodoPagoSeleccionado) && ( // <-- VALIDACIÓN CLAVE AQUÍ
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-inner">
                                        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                                            <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600" />
                                            Vincular Cheques de Terceros
                                        </h3>
                                        
                                        {isLoadingCheques ? (
                                            <div className="text-center py-4">
                                                <svg className="animate-spin h-6 w-6 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-500">Cargando cheques disponibles...</p>
                                            </div>
                                        ) : chequesDisponibles.length === 0 ? (
                                            <p className="text-center text-sm text-gray-500 py-4">No hay cheques pendientes disponibles para vincular.</p>
                                        ) : (
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                                {chequesDisponibles.map((cheque) => (
                                                    <div 
                                                        key={cheque.id} 
                                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                                            chequesSeleccionados.includes(cheque.id.toString())
                                                                ? 'bg-blue-100 border-l-4 border-blue-500'
                                                                : 'bg-white hover:bg-gray-100 border border-gray-200'
                                                        }`}
                                                        onClick={() => handleChequeSelection(cheque.id)}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <input
                                                                id={`cheque-${cheque.id}`}
                                                                type="checkbox"
                                                                checked={chequesSeleccionados.includes(cheque.id.toString())}
                                                                onChange={() => handleChequeSelection(cheque.id)}
                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <label htmlFor={`cheque-${cheque.id}`} className="text-sm font-medium text-gray-900 flex-1">
                                                                Cheque N° **{cheque.numeroCheque || 'N/A'}**
                                                                <span className="block text-xs text-gray-500">
                                                                    Vence: {formatearFecha(cheque.fechaCobro || '')}
                                                                </span>
                                                            </label>
                                                        </div>
                                                        <span className="text-sm font-bold text-green-700 flex-shrink-0">
                                                            {formatearMoneda(cheque.monto)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {chequesDisponibles.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                                                <span className="text-sm font-semibold text-gray-700">Total Cheques Seleccionados:</span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    {formatearMoneda(
                                                        chequesSeleccionados.reduce((sum, id) => {
                                                            const cheque = chequesDisponibles.find(c => c.id.toString() === id);
                                                            return sum + (cheque ? cheque.monto : 0);
                                                        }, 0)
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

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


                                {/* Campo Observación */}
                                <div>
                                    <label htmlFor="observacionIngreso" className="block text-sm font-medium text-gray-700 mb-2">
                                        Observación (Opcional)
                                    </label>
                                    <textarea
                                        id="observacionIngreso"
                                        rows="3"
                                        value={observacionIngreso}
                                        onChange={(e) => setObservacionIngreso(e.target.value)}
                                        className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Detalles adicionales del ingreso"
                                    ></textarea>
                                </div>

                                {/* Botón de Submit */}
                                <button
                                    type="submit"
                                    className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white shadow-sm transition-colors ${
                                        isLoadingIngreso 
                                            ? 'bg-blue-400 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    }`}
                                    disabled={isLoadingIngreso}
                                >
                                    {isLoadingIngreso ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Registrando Ingreso...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5 mr-2" />
                                            Registrar Ingreso
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                        
                        {/* 2. Formulario de Tipo de Ingreso */}
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
                                            placeholder="Ej: Venta de Servicios, Inversión, Préstamo"
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
                        
                        {/* 3. Formulario de Método de Pago */}
                        {activeTab === 'metodoPago' && (
                            <div className="space-y-6">
                                {/* Campo Nombre del Método de Pago */}
                                <div>
                                    <label htmlFor="nombreMetodoPago" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre del Método de Pago *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CreditCard className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="nombreMetodoPago"
                                            type="text"
                                            value={nombreMetodoPago}
                                            onChange={(e) => setNombreMetodoPago(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ej: Efectivo, Tarjeta de Crédito, Cheque Banco Nación"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Botón de Guardar */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        onClick={handleSubmitMetodoPago}
                                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                                            isLoadingMetodoPago ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }`}
                                        disabled={isLoadingMetodoPago}
                                    >
                                        {isLoadingMetodoPago ? (
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
                                                Guardar Método de Pago
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
                        
                        {/* Tabla de Últimos Métodos de Pago */}
                        {activeTab === 'metodoPago' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Últimos Métodos de Pago</h2>
                                    <button
                                        onClick={() => setMostrarTablaMetodosPago(!mostrarTablaMetodosPago)}
                                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        {mostrarTablaMetodosPago ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {isLoadingUltimosMetodosPago ? (
                                    <div className="text-center py-10">
                                        <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-500">Cargando métodos de pago...</p>
                                    </div>
                                ) : (
                                    <>
                                        {mostrarTablaMetodosPago && ultimosMetodosPago.length > 0 ? (
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
                                                        {ultimosMetodosPago.map((metodo) => (
                                                            <tr key={metodo.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metodo.nombre}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                    Mostrando los últimos {ultimosMetodosPago.length} registros
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">No hay métodos de pago registrados.</p>
                                        )}

                                        {/* Botón para recargar datos */}
                                        {!isLoadingUltimosMetodosPago && ultimosMetodosPago.length > 0 && (
                                            <div className="mt-4 text-center">
                                                <button
                                                    onClick={cargarUltimosMetodosPago}
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
        <CrearRegistroModal 
                isOpen={mostrarModalRegistro}
                onClose={() => { setMostrarModalRegistro(false); setError(''); }}
                onCrearRegistro={handleCrearRegistroDelDia}
                isCreating={isCreatingRegistro}
                error={error}
            />
        
        </div>
    );
};