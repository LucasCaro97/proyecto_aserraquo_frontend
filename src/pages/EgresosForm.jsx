import { useState, useEffect, useCallback, useMemo } from 'react'; // Agregué useCallback
import {
    DollarSign, FileText, User, Save, ArrowLeft, AlertCircle, CheckCircle,
    Plus, Eye, EyeOff, ListPlus, TrendingDown, Star, CreditCard, Banknote, ClipboardCheck, Pencil, Trash2
} from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario';
import { useRegistrosFinancieros } from '../hooks/useRegistrosFinancieros';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import axios from 'axios';
import { CrearRegistroModal } from '../components/CrearRegistroModal';

// Definimos un valor Epsilon (tolerancia) para comparaciones de punto flotante.
const EPSILON = 0.000001;

export const EgresosForm = ({ onBack, onSuccess }) => {
    const TIPO_MAP = {
        EMITIDO: { label: 'Propio', color: 'text-blue-600 bg-blue-50' },
        RECIBIDO: { label: 'Tercero', color: 'text-purple-600 bg-purple-50' }
    };

    const CAT_MAP = {
        FISICO: { label: 'Físico', icon: '📄' },
        ELECTRONICO: { label: 'E-Cheq', icon: '💻' }
    };

    // Estados del formulario de Tipo de Egreso
    const [nombreTipoEgreso, setNombreTipoEgreso] = useState('');
    const [prioridadSeleccionada, setPrioridadSeleccionada] = useState('');

    // Estados del formulario de Egreso
    const [montoEgreso, setMontoEgreso] = useState('');
    const [observacionEgreso, setObservacionEgreso] = useState('');
    const [tipoEgresoSeleccionado, setTipoEgresoSeleccionado] = useState('');
    const [registroFinancieroDiario, setRegistroFinancieroDiario] = useState('');
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('');
    const [busquedaCheque, setBusquedaCheque] = useState('');

    // Estados del formulario de Método de Pago
    const [nombreMetodoPago, setNombreMetodoPago] = useState('');

    // --- ESTADOS PARA GESTIÓN DE CHEQUES ---
    const [chequesDisponibles, setChequesDisponibles] = useState([]);
    const [isLoadingCheques, setIsLoadingCheques] = useState(false);
    const [chequesSeleccionados, setChequesSeleccionados] = useState([]); // Array de IDs de cheques
    // ELIMINADO: const [chequeMetodoId, setChequeMetodoId] = useState(null); // YA NO ES NECESARIO
    // ---------------------------------------------

    // Estados para las tablas de últimos registros
    const [ultimosTiposEgreso, setUltimosTiposEgreso] = useState([]);
    const [ultimosEgresos, setUltimosEgresos] = useState([]);
    const [ultimosMetodosPago, setUltimosMetodosPago] = useState([]);

    const [isLoadingUltimosTiposEgreso, setIsLoadingUltimosTiposEgreso] = useState(false);
    const [isLoadingUltimosEgresos, setIsLoadingUltimosEgresos] = useState(false);
    const [isLoadingUltimosMetodosPago, setIsLoadingUltimosMetodosPago] = useState(false);

    const [mostrarTablaTipos, setMostrarTablaTipos] = useState(true);
    const [mostrarTablaEgresos, setMostrarTablaEgresos] = useState(true);
    const [mostrarTablaMetodosPago, setMostrarTablaMetodosPago] = useState(true);

    // Estados para tipos de egreso y prioridades disponibles
    const [tiposEgresoDisponibles, setTiposEgresoDisponibles] = useState([]);
    const [prioridadesDisponibles, setPrioridadesDisponibles] = useState([]);
    const [metodosPagoDisponibles, setMetodosPagoDisponibles] = useState([]);
    const [isLoadingTiposEgreso, setIsLoadingTiposEgreso] = useState(false);
    const [isLoadingPrioridades, setIsLoadingPrioridades] = useState(false);
    const [isLoadingMetodosPago, setIsLoadingMetodosPago] = useState(false);

    // Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Almacena el objeto completo a editar
    const [tipoEgresoAEditar, setTipoEgresoAEditar] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Estados de UI
    const [isLoadingTipoEgreso, setIsLoadingTipoEgreso] = useState(false);
    const [isLoadingEgreso, setIsLoadingEgreso] = useState(false);
    const [isLoadingMetodoPago, setIsLoadingMetodoPago] = useState(false);

    const [isCreatingRegistro, setIsCreatingRegistro] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('egreso');

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

    // NUEVA FUNCIÓN DINÁMICA: Determina si el método es de tipo Cheque
    const esMetodoCheque = useCallback((metodoId) => {
        if (!metodoId) return false;
        // Buscamos el objeto del método de pago por su ID
        const metodo = metodosPagoDisponibles.find(m => m.id.toString() === metodoId);

        // Verificamos si el método existe y si su nombre contiene "cheque" (insensible a mayúsculas)
        return metodo && metodo.nombre.toLowerCase().includes('cheque');
    }, [metodosPagoDisponibles]);

    // --- FUNCIONES DE CARGA DE DATOS ---

    const cargarUltimosTiposEgreso = async () => {
        setIsLoadingUltimosTiposEgreso(true);
        try {
            const response = await axios.get(`${apiUrl}/tipo-egreso/activos`);

            setTimeout(() => {
                setUltimosTiposEgreso(response.data);
                setIsLoadingUltimosTiposEgreso(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos tipos de egreso:', error);
            setIsLoadingUltimosTiposEgreso(false);
        }
    };

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

    const cargarUltimosMetodosPago = async () => {
        setIsLoadingUltimosMetodosPago(true);
        try {
            const response = await axios.get(`${apiUrl}/medio-de-pago`);

            setTimeout(() => {
                setUltimosMetodosPago(response.data);
                setIsLoadingUltimosMetodosPago(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos métodos de pago:', error);
            setIsLoadingUltimosMetodosPago(false);
        }
    };

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


    const cargarTiposEgresoDisponibles = async () => {
        setIsLoadingTiposEgreso(true);
        try {
            const response = await axios.get(`${apiUrl}/tipo-egreso/activos`);
            const dataOrdenada = response.data.sort((a, b) =>
                a.nombre.localeCompare(b.nombre)
            );
            setTiposEgresoDisponibles(dataOrdenada);
        } catch (error) {
            console.error('Error al cargar tipos de egreso disponibles:', error);
        } finally {
            setIsLoadingTiposEgreso(false);
        }
    };

    const cargarPrioridadesDisponibles = async () => {
        setIsLoadingPrioridades(true);
        try {
            const response = await axios.get(`${apiUrl}/prioridad/activos`);
            setPrioridadesDisponibles(response.data);
        } catch (error) {
            console.error('Error al cargar prioridades disponibles:', error);
        } finally {
            setIsLoadingPrioridades(false);
        }
    };

    // --- FUNCIÓN PARA CARGAR CHEQUES PENDIENTES ---
    const cargarChequesDisponibles = async () => {
        setIsLoadingCheques(true);
        setError('');
        setChequesDisponibles([]);

        try {
            // Asumiendo un endpoint para cheques pendientes de un egreso
            const response = await axios.get(`${apiUrl}/cheques/disponibles/EGRESO`);

            setTimeout(() => {
                setChequesDisponibles(response.data);
                setIsLoadingCheques(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar cheques disponibles:', error);
            setError('Error al cargar los cheques. Asegúrate que el endpoint /cheque/pendientes esté disponible.');
            setIsLoadingCheques(false);
        }
    };
    // ---------------------------------------------------

    // Filtramos la lista original basándonos en el número de cheque
    const chequesFiltrados = useMemo(() => {
        return chequesDisponibles.filter(cheque =>
            cheque.numeroCheque?.toString().toLowerCase().includes(busquedaCheque.toLowerCase())
        );
    }, [chequesDisponibles, busquedaCheque]);

    // Cargar datos al iniciar
    useEffect(() => {
        if (usuario?.id) {
            cargarUltimosTiposEgreso();
            cargarUltimosEgresos();
            cargarUltimosMetodosPago();
            cargarTiposEgresoDisponibles();
            cargarPrioridadesDisponibles();
            cargarMetodosPagoDisponibles();
            cargarRegistrosFinancieros();
        }
    }, [usuario]);

    // --- EFECTO PARA CARGAR CHEQUES PENDIENTES BASADO EN EL NOMBRE ---
    useEffect(() => {
        const isChequeSelected = esMetodoCheque(metodoPagoSeleccionado);

        // 1. Cargar cheques si un método que incluye "cheque" está seleccionado
        if (activeTab === 'egreso' && isChequeSelected) {
            cargarChequesDisponibles();
        } else if (!isChequeSelected) {
            // 2. Limpiar si se selecciona otro método
            setChequesDisponibles([]);
            setChequesSeleccionados([]);
        }
    }, [metodoPagoSeleccionado, activeTab, esMetodoCheque]); // esMetodoCheque se agregó a las dependencias porque usa metodosPagoDisponibles

    // --- HANDLER DE SELECCIÓN DE CHEQUES ---
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

    // --- HANDLERS DE FORMULARIO ---

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

    const handleSubmitTipoEgreso = async (e) => {
        e.preventDefault();

        if (isEditing) {
            await handleUpdateTipoEgreso(); // Llamar a la función de actualización
            return;
        }

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

        // 1. Validaciones básicas
        if (!montoEgreso || parseFloat(montoEgreso) <= 0) {
            setError('El monto del egreso debe ser un número válido mayor a 0');
            return;
        }

        if (!tipoEgresoSeleccionado) {
            setError('Debe seleccionar un tipo de egreso');
            return;
        }

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

        const montoEgresoFloat = parseFloat(montoEgreso);
        const isChequeMethod = esMetodoCheque(metodoPagoSeleccionado); // <-- USO DINÁMICO

        // 2. Validación de cheques (solo si es un método de cheque)
        if (isChequeMethod) {
            if (chequesSeleccionados.length === 0) {
                setError('Debe seleccionar al menos un cheque para vincular a este egreso.');
                return;
            }

            // Cálculo del total de cheques seleccionados
            const totalCheques = chequesSeleccionados.reduce((sum, id) => {
                const cheque = chequesDisponibles.find(c => c.id.toString() === id);
                return sum + (cheque ? cheque.monto : 0);
            }, 0);

            // 3. Validación de monto vs cheques seleccionados usando EPSILON
            if (Math.abs(totalCheques - montoEgresoFloat) > EPSILON) {
                setError(`El monto del egreso (${formatearMoneda(montoEgresoFloat)}) no coincide con el total de los cheques seleccionados (${formatearMoneda(totalCheques)}). Por favor, ajuste el monto o la selección de cheques.`);
                return;
            }
        }


        setIsLoadingEgreso(true);
        setError('');
        setSuccess('');

        try {
            const nuevoEgreso = {
                monto: montoEgresoFloat,
                idTipoEgreso: parseInt(tipoEgresoSeleccionado),
                idRegistroDiario: parseInt(registroFinancieroDiario),
                idUsuario: usuario.id,
                observacion: observacionEgreso.trim(),
                idMedioDePago: parseInt(metodoPagoSeleccionado),
                // CAMPO CONDICIONAL: Enviar IDs de cheques si se detecta dinámicamente el método
                idChequesVinculados: isChequeMethod ? chequesSeleccionados.map(id => parseInt(id)) : [],
            };

            const response = await axios.post(`${apiUrl}/egreso`, nuevoEgreso);

            setTimeout(() => {
                setSuccess('Egreso registrado exitosamente');
                // Limpiar formulario y estados de cheque
                setMontoEgreso('');
                setObservacionEgreso('');
                setTipoEgresoSeleccionado('');
                setRegistroFinancieroDiario('');
                setMetodoPagoSeleccionado('');
                setChequesSeleccionados([]); // Limpiar cheques seleccionados
                setChequesDisponibles([]); // Limpiar cheques disponibles

                setIsLoadingEgreso(false);

                // Recargar la tabla de últimos egresos
                cargarUltimosEgresos();

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

    const handleSubmitMetodoPago = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!nombreMetodoPago.trim()) {
            setError('El nombre del método de pago es requerido');
            return;
        }

        setIsLoadingMetodoPago(true);
        setError('');
        setSuccess('');

        try {
            const nuevoMetodoPago = {
                nombre: nombreMetodoPago.trim(),
                estado: true
            };

            const response = await axios.post(`${apiUrl}/medio-de-pago`, nuevoMetodoPago);

            setTimeout(() => {
                setSuccess('Método de pago registrado exitosamente');
                // Limpiar formulario
                setNombreMetodoPago('');
                setIsLoadingMetodoPago(false);

                // Recargar las listas de métodos de pago
                cargarUltimosMetodosPago();
                cargarMetodosPagoDisponibles();

                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al registrar método de pago:', error);
            setError(error.response?.data?.errorMessage || 'Error al registrar el método de pago. Inténtalo de nuevo.');
            setIsLoadingMetodoPago(false);
        }
    };

    // --- FUNCIONES DE UTILIDAD ---

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

    const handleSafeDeleteTipoEgreso = async (idTipoEgreso) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar el Tipo de Egreso con ID: ${idTipoEgreso}? Esta acción puede ser reversible en el backend, pero el tipo no estará disponible para nuevos egresos.`)) {
            return;
        }

        setError('');
        setSuccess('');

        try {
            // Petición DELETE al endpoint específico
            const response = await axios.delete(`${apiUrl}/tipo-egreso/safeDelete/${idTipoEgreso}`);

            // Verificar si el 'safe delete' fue exitoso.
            if (response.status === 200 || response.status === 204) {
                setSuccess(`Tipo de Egreso ID ${idTipoEgreso} eliminado (lógica) exitosamente.`);

                // Recargar las tablas y listas después de la eliminación
                cargarUltimosTiposEgreso();
                cargarTiposEgresoDisponibles();
            } else {
                setError('Error al eliminar (lógica) el tipo de egreso. Inténtalo de nuevo.');
            }


        } catch (error) {
            console.error('Error al realizar el safe delete del tipo de egreso:', error);
            // Capturar mensaje de error específico del backend si está disponible
            setError(error.response?.data?.message || 'Error al eliminar (lógica) el tipo de egreso. Inténtalo de nuevo.');
        }
    };

    // --- FUNCIÓN PARA INICIAR EL MODO EDICIÓN ---
    const handleEditTipoEgreso = (tipoEgreso) => {
        // 1. Cambiar a la pestaña de 'tipoEgreso'
        setActiveTab('tipoEgreso');

        // 2. Establecer el estado de edición
        setTipoEgresoAEditar(tipoEgreso);
        setIsEditing(true);

        // 3. Llenar los campos del formulario con los datos del objeto
        setNombreTipoEgreso(tipoEgreso.nombre);
        // Asegúrate de que idPrioridad está disponible en el objeto tipoEgreso
        setPrioridadSeleccionada(tipoEgreso.prioridad.id);
        // 4. Limpiar mensajes de estado previos
        setError('');
        setSuccess('');

        // Opcional: Desplazarse al formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- FUNCIÓN PARA CANCELAR EL MODO EDICIÓN ---
    const handleCancelEdit = () => {
        setTipoEgresoAEditar(null);
        setIsEditing(false);
        setNombreTipoEgreso('');
        setPrioridadSeleccionada('');
        setError('');
    };

    const handleUpdateTipoEgreso = async () => {
        // Validaciones (iguales a las de crear)
        if (!nombreTipoEgreso.trim()) {
            setError('El nombre del tipo de egreso es requerido');
            return;
        }

        if (!prioridadSeleccionada) {
            setError('Debe seleccionar una prioridad');
            return;
        }

        if (!tipoEgresoAEditar?.id) {
            setError('Error: ID del tipo de egreso a editar no encontrado.');
            return;
        }

        setIsLoadingTipoEgreso(true);
        setError('');
        setSuccess('');

        try {
            const tipoEgresoActualizado = {
                // Aquí usamos los IDs y estados del objeto original (tipoEgresoAEditar) 
                // para la consistencia, pero actualizamos los campos modificados.
                id: tipoEgresoAEditar.id,
                nombre: nombreTipoEgreso.trim(),
                idPrioridad: parseInt(prioridadSeleccionada),
                estado: tipoEgresoAEditar.estado // Mantenemos el estado actual
            };

            // Petición PUT (o PATCH si tu API lo requiere)
            const response = await axios.put(`${apiUrl}/tipo-egreso/${tipoEgresoAEditar.id}`, tipoEgresoActualizado);

            setTimeout(() => {
                setSuccess(`Tipo de egreso "${tipoEgresoActualizado.nombre}" actualizado exitosamente`);

                // Finalizar modo edición
                handleCancelEdit(); // Limpia estados y desactiva isEditing
                setIsLoadingTipoEgreso(false);

                // Recargar las tablas y tipos de egreso disponibles
                cargarUltimosTiposEgreso();
                cargarTiposEgresoDisponibles();

                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al actualizar tipo de egreso:', error);
            setError('Error al actualizar el tipo de egreso. Inténtalo de nuevo.');
            setIsLoadingTipoEgreso(false);
        }
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
                                    {/* Tab: Nuevo Egreso */}
                                    <button
                                        onClick={() => setActiveTab('egreso')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'egreso'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <TrendingDown className="h-4 w-4" />
                                            <span>Nuevo Egreso</span>
                                        </div>
                                    </button>
                                    {/* Tab: Nuevo Tipo de Egreso */}
                                    <button
                                        onClick={() => setActiveTab('tipoEgreso')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'tipoEgreso'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <ListPlus className="h-4 w-4" />
                                            <span>Nuevo Tipo de Egreso</span>
                                        </div>
                                    </button>
                                    {/* Tab: Nuevo Método de Pago */}
                                    <button
                                        onClick={() => setActiveTab('metodoPago')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'metodoPago'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <CreditCard className="h-4 w-4" />
                                            <span>Nuevo Método de Pago</span>
                                        </div>
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* 1. Formulario de Egreso */}
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

                                {/* Campo Método de Pago */}
                                <div>
                                    <label htmlFor="metodoPagoSeleccionado" className="block text-sm font-medium text-gray-700 mb-2">
                                        Método de Pago *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CreditCard className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="metodoPagoSeleccionado"
                                            value={metodoPagoSeleccionado}
                                            onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                        >
                                            <option value="" disabled>Seleccione un método de pago</option>
                                            {isLoadingMetodosPago ? (
                                                <option disabled>Cargando...</option>
                                            ) : (
                                                metodosPagoDisponibles.map((metodo) => (
                                                    <option key={metodo.id} value={metodo.id}>
                                                        {metodo.nombre}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {/* --- SECCIÓN CONDICIONAL PARA CHEQUES --- */}
                                {esMetodoCheque(metodoPagoSeleccionado) && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-inner">
                                        <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                                            <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600" />
                                            Vincular Cheques
                                        </h3>

                                        {/* --- NUEVO BUSCADOR --- */}
                                        {!isLoadingCheques && chequesDisponibles.length > 0 && (
                                            <div className="mb-4 relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <ListPlus className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Buscar por número de cheque..."
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                    value={busquedaCheque}
                                                    onChange={(e) => setBusquedaCheque(e.target.value)}
                                                />
                                            </div>
                                        )}

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
                                                {/* IMPORTANTE: Ahora mapeamos sobre 'chequesFiltrados' */}
                                                {chequesFiltrados.length > 0 ? (
                                                    chequesFiltrados.map((cheque) => (
                                                        <div
                                                            key={cheque.id}
                                                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${chequesSeleccionados.includes(cheque.id.toString())
                                                                ? 'bg-blue-100 border-l-4 border-blue-500'
                                                                : 'bg-white hover:bg-gray-100 border border-gray-200'
                                                                }`}
                                                            onClick={() => handleChequeSelection(cheque.id)}
                                                        >
                                                            <div className="flex items-center space-x-3 flex-1">
                                                                <input
                                                                    id={`cheque-${cheque.id}`}
                                                                    type="checkbox"
                                                                    checked={chequesSeleccionados.includes(cheque.id.toString())}
                                                                    readOnly // Se maneja con el onClick del contenedor
                                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <label htmlFor={`cheque-${cheque.id}`} className="text-sm font-bold text-gray-900 cursor-pointer">
                                                                            N° {cheque.numeroCheque || 'N/A'}
                                                                        </label>
                                                                        {/* Badges de Información Nueva */}
                                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${cheque.tipoCheque === 'EMITIDO' ? 'bg-blue-200 text-blue-700' : 'bg-purple-200 text-purple-700'
                                                                            }`}>
                                                                            {cheque.tipoCheque === 'EMITIDO' ? 'Propio' : 'Tercero'}
                                                                        </span>
                                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-bold uppercase">
                                                                            {cheque.categoriaCheque === 'ELECTRONICO' ? '💻 E-Cheq' : '📄 Físico'}
                                                                        </span>
                                                                    </div>
                                                                    <span className="block text-xs text-gray-500 mt-0.5">
                                                                        Vence: {formatearFecha(cheque.fechaCobro || '')}
                                                                        {cheque.bancoEmisor && ` • ${cheque.bancoEmisor}`}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right ml-2">
                                                                <span className="text-sm font-bold text-green-700 block">
                                                                    {formatearMoneda(cheque.monto)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-center text-xs text-gray-400 py-2">No se encontraron cheques con ese número.</p>
                                                )}
                                            </div>
                                        )}

                                        {chequesDisponibles.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                                                <span className="text-sm font-semibold text-gray-700">Total Seleccionado:</span>
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
                                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${isLoadingEgreso ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
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
                        {/* ... (el resto del código de formularios y tablas es el mismo) ... */}

                        {/* 2. Formulario de Tipo de Egreso */}
                        {activeTab === 'tipoEgreso' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {isEditing ? `Modificar Tipo: ${tipoEgresoAEditar?.nombre}` : 'Nuevo Tipo de Egreso'}
                                </h2>

                                {/* Botón Cancelar Edición Condicional */}
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="flex items-center text-sm text-red-600 hover:text-red-800 transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1" />
                                        Cancelar Edición
                                    </button>
                                )}
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
                                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${isLoadingTipoEgreso ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
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
                                                {isEditing ? 'Guardar Cambios' : 'Guardar Tipo de Egreso'}
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
                                            placeholder="Ej: Efectivo, Tarjeta de Crédito, Transferencia"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Botón de Guardar */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        onClick={handleSubmitMetodoPago}
                                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${isLoadingMetodoPago ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
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
                                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Acciones
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {ultimosTiposEgreso.map((tipo) => (
                                                            <tr key={tipo.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tipo.nombre}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tipo.prioridad?.nombre}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                                                    <div className="flex items-center justify-center space-x-2">
                                                                        {/* Botón Modificar/Editar */}
                                                                        <button
                                                                            onClick={() => handleEditTipoEgreso(tipo)}
                                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-100 transition-colors"
                                                                            title="Modificar Tipo de Egreso"
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                        </button>
                                                                        {/* Botón Eliminar */}
                                                                        <button
                                                                            onClick={() => handleSafeDeleteTipoEgreso(tipo.id)}
                                                                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-100 transition-colors"
                                                                            title="Eliminar Tipo de Egreso"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
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
                onClose={() => { setMostrarModalRegistro(false); setError(''); }} // Limpiar error al cerrar
                onCrearRegistro={handleCrearRegistroDelDia}
                isCreating={isCreatingRegistro}
                error={error}
            />

        </div>
    );
};