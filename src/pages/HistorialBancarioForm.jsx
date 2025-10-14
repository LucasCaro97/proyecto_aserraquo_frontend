import { useState, useEffect } from 'react';
import { History, Banknote, Building2, User, Save, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff, CalendarDays, Plus } from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario';
import { useRegistrosFinancieros } from '../hooks/useRegistrosFinancieros';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import axios from 'axios';
import { CrearRegistroModal } from '../components/CrearRegistroModal';

export const HistorialBancarioForm = ({ onBack, onSuccess }) => {
    // Estados del formulario
    const [saldoActual, setSaldoActual] = useState('');
    const [bancoSeleccionado, setBancoSeleccionado] = useState('');
    const [registroDiarioSeleccionado, setRegistroDiarioSeleccionado] = useState('');

    // Estados para la carga de datos y UI
    const [bancosDisponibles, setBancosDisponibles] = useState([]);
    const [isLoadingBancos, setIsLoadingBancos] = useState(false);
    const [isCreatingRegistro, setIsCreatingRegistro] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados para la tabla de últimos registros
    const [ultimosRegistros, setUltimosRegistros] = useState([]);
    const [isLoadingUltimosRegistros, setIsLoadingUltimosRegistros] = useState(false);
    const [mostrarTabla, setMostrarTabla] = useState(true);

    // Variables de entorno
    const apiUrl = import.meta.env.VITE_API_URL;
    const { usuario } = useUsuario();

    // Función para cargar los bancos disponibles
    const cargarBancosDisponibles = async () => {
        setIsLoadingBancos(true);
        try {
            const response = await axios.get(`${apiUrl}/banco/activos`);
            setBancosDisponibles(response.data);
        } catch (error) {
            console.error('Error al cargar bancos disponibles:', error);
            setError('Error al cargar la lista de bancos.');
        } finally {
            setIsLoadingBancos(false);
        }
    };

    // Hook personalizado para registros financieros
    const {
        registrosDisponibles,
        isLoadingRegistros,
        cargarRegistrosFinancieros,
        crearRegistroDelDia,
    } = useRegistrosFinancieros();

    //estado para controlar el modal
    const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);

    // Función para crear un nuevo registro financiero diario para el día actual
    const handleCrearRegistroDelDia = async (fecha) => {
        setIsCreatingRegistro(true);
        setError('');

        try {
            const nuevoRegistro = await crearRegistroDelDia(fecha);

            if (nuevoRegistro && nuevoRegistro.id) {
                setRegistroDiarioSeleccionado(nuevoRegistro.id.toString());
                setSuccess('Registro del día actual creado exitosamente');
            }
            setMostrarModalRegistro(false);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsCreatingRegistro(false);
        }
    };

    // Función para cargar los últimos registros de historial
    const cargarUltimosRegistros = async () => {
        setIsLoadingUltimosRegistros(true);
        try {
            const response = await axios.get(`${apiUrl}/historial-saldo/sorted-top10-desc`);
            setUltimosRegistros(response.data);
        } catch (error) {
            console.error('Error al cargar últimos registros de historial:', error);
        } finally {
            setIsLoadingUltimosRegistros(false);
        }
    };

    // Cargar datos iniciales al montar el componente
    useEffect(() => {
        if (usuario?.id) {
            cargarBancosDisponibles();
            cargarUltimosRegistros();
        }
    }, [usuario]);

    // Función que maneja el cambio de saldo, permitiendo números y punto decimal
    const handleMoneyChange = (e, setter) => {
        const value = e.target.value;
        if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
            setter(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validaciones
        if (!registroDiarioSeleccionado) {
            setError('Por favor, selecciona un registro financiero diario.');
            return;
        }

        if (!bancoSeleccionado) {
            setError('Por favor, selecciona un banco.');
            return;
        }

        if (saldoActual === '' || isNaN(parseFloat(saldoActual))) {
            setError('Por favor, ingresa un saldo válido.');
            return;
        }

        if (!usuario?.id) {
            setError('Error: No se pudo obtener la información del usuario.');
            return;
        }

        setIsLoadingForm(true);

        try {
            const nuevoRegistro = {
                saldo: parseFloat(saldoActual),
                idBanco: parseInt(bancoSeleccionado),
                idRegistroDiario: parseInt(registroDiarioSeleccionado),
                idUsuario: usuario.id
            };

            const response = await axios.post(`${apiUrl}/historial-saldo`, nuevoRegistro);

            setTimeout(() => {
                setSuccess('Registro de historial bancario guardado exitosamente');
                setSaldoActual('');
                setBancoSeleccionado('');
                setIsLoadingForm(false);
                cargarUltimosRegistros(); // Recargar la tabla
                if (onSuccess) {
                    onSuccess();
                }
            }, 1000);
        } catch (error) {
            console.error('Error al registrar historial bancario:', error);
            if (error.response && error.response.data && error.response.data.errorMessage) {
                setError(error.response.data.errorMessage);
            } else {
                setError('Error al registrar el historial bancario. Inténtalo de nuevo.');
            }
            setIsLoadingForm(false);
        }
    };

    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(valor);
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
                                <h1 className="text-3xl font-bold text-gray-900">Historial Bancario Diario</h1>
                                <p className="text-gray-600 mt-1">Registra el saldo final de cada banco al cerrar la jornada</p>
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

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Campo Registro Financiero Diario */}
                            <div>
                                <label htmlFor="registroFinanciero" className="block text-sm font-medium text-gray-700 mb-2">
                                    Registro Financiero Diario *
                                </label>
                                <div className="flex space-x-3">
                                    <select
                                        id="registroFinanciero"
                                        value={registroDiarioSeleccionado}
                                        onChange={(e) => setRegistroDiarioSeleccionado(e.target.value)}
                                        className="block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
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

                            {/* Campo Banco */}
                            <div>
                                <label htmlFor="bancoSeleccionado" className="block text-sm font-medium text-gray-700 mb-2">
                                    Banco *
                                </label>
                                <div className="relative">
                                    <select
                                        id="bancoSeleccionado"
                                        value={bancoSeleccionado}
                                        onChange={(e) => setBancoSeleccionado(e.target.value)}
                                        className="block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                                        required
                                        disabled={isLoadingBancos}
                                    >
                                        <option value="">
                                            {isLoadingBancos ? 'Cargando bancos...' : 'Seleccione un banco'}
                                        </option>
                                        {bancosDisponibles.map((banco) => (
                                            <option key={banco.id} value={banco.id}>
                                                {banco.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <Building2 className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Campo Saldo Actual */}
                            <div>
                                <label htmlFor="saldoActual" className="block text-sm font-medium text-gray-700 mb-2">
                                    Saldo Actual ($) *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Banknote className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="saldoActual"
                                        type="text"
                                        value={saldoActual}
                                        onChange={(e) => handleMoneyChange(e, setSaldoActual)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Ingrese el saldo final del día"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-sm">ARS</span>
                                    </div>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoadingForm || !usuario}
                                    className={`flex-1 font-bold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoadingForm || !usuario
                                            ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                        } flex items-center justify-center space-x-2`}
                                >
                                    {isLoadingForm ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>Registrar Saldo</span>
                                        </>
                                    )}
                                </button>
                                {onBack && (
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                        disabled={isLoadingForm}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Columna derecha: Tabla de últimos registros */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Últimos Registros Diarios</h2>
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
                                    {isLoadingUltimosRegistros ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-3 text-gray-600">Cargando registros...</span>
                                        </div>
                                    ) : ultimosRegistros.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <History className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                            <p>No hay registros de historial bancario aún</p>
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
                                                                Banco
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Saldo
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {ultimosRegistros.map((registro, index) => (
                                                            <tr
                                                                key={registro.id || index}
                                                                className={`hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-green-50' : ''}`}
                                                            >
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                    {formatearFecha(registro.registroFinancieroDiario.fecha)}
                                                                </td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {registro.banco.nombre}
                                                                </td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-green-600">
                                                                    {formatearMoneda(registro.saldo)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Indicador de registro más reciente */}
                                            {ultimosRegistros.length > 0 && (
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                    Mostrando los últimos {ultimosRegistros.length} registros • El más reciente aparece resaltado
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Botón para recargar datos */}
                                    {!isLoadingUltimosRegistros && ultimosRegistros.length > 0 && (
                                        <div className="mt-4 text-center">
                                            <button
                                                onClick={cargarUltimosRegistros}
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