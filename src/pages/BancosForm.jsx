import { useState, useEffect } from 'react';
import { Building2, DollarSign, Calendar, User, Save, ArrowLeft, AlertCircle, CheckCircle, Plus, Eye, EyeOff, FileText, Banknote, CalendarDays } from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario';
import axios from 'axios';

export const BancosForm = ({ onBack, onSuccess }) => {
    // Estados del formulario de Banco
    const [nombreBanco, setNombreBanco] = useState('');
    const [saldoBanco, setSaldoBanco] = useState('');
    
    // Estados del formulario de Acuerdo Bancario
    const [montoacuerdo, setMontoAcuerdo] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [bancoSeleccionado, setBancoSeleccionado] = useState('');

    // Estados para las tablas de últimos registros
    const [ultimosBancos, setUltimosBancos] = useState([]);
    const [ultimosAcuerdos, setUltimosAcuerdos] = useState([]);
    const [isLoadingUltimosBancos, setIsLoadingUltimosBancos] = useState(false);
    const [isLoadingUltimosAcuerdos, setIsLoadingUltimosAcuerdos] = useState(false);
    const [mostrarTablaBancos, setMostrarTablaBancos] = useState(true);
    const [mostrarTablaAcuerdos, setMostrarTablaAcuerdos] = useState(true);

    // Estados para bancos disponibles
    const [bancosDisponibles, setBancosDisponibles] = useState([]);
    const [isLoadingBancos, setIsLoadingBancos] = useState(false);

    // Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Estados de UI
    const [isLoadingBanco, setIsLoadingBanco] = useState(false);
    const [isLoadingAcuerdo, setIsLoadingAcuerdo] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('banco'); // 'banco' o 'acuerdo'

    // Hook personalizado para obtener el usuario del token
    const { usuario } = useUsuario();

    // Función para cargar los últimos 10 bancos
    const cargarUltimosBancos = async () => {
        setIsLoadingUltimosBancos(true);
        try {
            const response = await axios.get(`${apiUrl}/banco`);
            
            setTimeout(() => {
                setUltimosBancos(response.data);
                setIsLoadingUltimosBancos(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos bancos:', error);
            setIsLoadingUltimosBancos(false);
        }
    };

    // Función para cargar los últimos 10 acuerdos bancarios
    const cargarUltimosAcuerdos = async () => {
        setIsLoadingUltimosAcuerdos(true);
        try {
            const response = await axios.get(`${apiUrl}/acuerdo-bancario`);
            
            setTimeout(() => {
                setUltimosAcuerdos(response.data);
                setIsLoadingUltimosAcuerdos(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos acuerdos bancarios:', error);
            setIsLoadingUltimosAcuerdos(false);
        }
    };

    // Función para cargar bancos disponibles
    const cargarBancosDisponibles = async () => {
        setIsLoadingBancos(true);
        try {
            const response = await axios.get(`${apiUrl}/banco/activos`);
            setBancosDisponibles(response.data);
        } catch (error) {
            console.error('Error al cargar bancos disponibles:', error);
        } finally {
            setIsLoadingBancos(false);
        }
    };

    // Cargar datos cuando el usuario esté disponible
    useEffect(() => {
        if (usuario?.id) {
            cargarUltimosBancos();
            cargarUltimosAcuerdos();
            cargarBancosDisponibles();
        }
    }, [usuario]);

    const handleSubmitBanco = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!nombreBanco.trim()) {
            setError('El nombre del banco es requerido');
            return;
        }

        if (!usuario?.id) {
            setError('Error: No se pudo obtener la información del usuario');
            return;
        }

        setIsLoadingBanco(true);
        setError('');
        setSuccess('');

        try {
            const nuevoBanco = {
                nombre: nombreBanco.trim(),
                saldo: parseFloat(saldoBanco),
                estado: true
            };

            const response = await axios.post(`${apiUrl}/banco`, nuevoBanco);
            
            setTimeout(() => {
                setSuccess('Banco registrado exitosamente');
                // Limpiar formulario
                setNombreBanco('');
                setSaldoBanco('');
                setIsLoadingBanco(false);

                // Recargar las tablas y bancos disponibles
                cargarUltimosBancos();
                cargarBancosDisponibles();

                // Callback de éxito si se proporciona
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al registrar banco:', error);
            setError(error.response.data.errorMessage);
            setIsLoadingBanco(false);
        }
    };

    const handleSubmitAcuerdo = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!montoacuerdo || parseFloat(montoacuerdo) <= 0) {
            setError('El monto del acuerdo debe ser un número válido mayor a 0');
            return;
        }

        if (!fechaInicio) {
            setError('La fecha de inicio es requerida');
            return;
        }

        if (!fechaFin) {
            setError('La fecha de fin es requerida');
            return;
        }

        if (new Date(fechaInicio) >= new Date(fechaFin)) {
            setError('La fecha de fin debe ser posterior a la fecha de inicio');
            return;
        }

        if (!bancoSeleccionado) {
            setError('Debe seleccionar un banco');
            return;
        }

        if (!usuario?.id) {
            setError('Error: No se pudo obtener la información del usuario');
            return;
        }

        setIsLoadingAcuerdo(true);
        setError('');
        setSuccess('');

        try {
            const nuevoAcuerdo = {
                monto: parseFloat(montoacuerdo),
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                idBanco: parseInt(bancoSeleccionado),
                estado: true
            };

            const response = await axios.post(`${apiUrl}/acuerdo-bancario`, nuevoAcuerdo);
            
            setTimeout(() => {
                setSuccess('Acuerdo bancario registrado exitosamente');
                // Limpiar formulario
                setMontoAcuerdo('');
                setFechaInicio('');
                setFechaFin('');
                setBancoSeleccionado('');
                setIsLoadingAcuerdo(false);

                // Recargar la tabla de últimos acuerdos
                cargarUltimosAcuerdos();

                // Callback de éxito si se proporciona
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al registrar acuerdo bancario:', error);
            setError('Error al registrar el acuerdo bancario. Inténtalo de nuevo.');
            setIsLoadingAcuerdo(false);
        }
    };

    const handleMoneyChange = (e, setter) => {
        const value = e.target.value;
        // Permitir solo números y punto decimal
        if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
            setter(value);
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
                                <h1 className="text-3xl font-bold text-gray-900">Gestión de Bancos y Acuerdos</h1>
                                <p className="text-gray-600 mt-1">Registra bancos y sus acuerdos bancarios</p>
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
                                        onClick={() => setActiveTab('banco')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'banco'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Building2 className="h-4 w-4" />
                                            <span>Nuevo Banco</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('acuerdo')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'acuerdo'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4" />
                                            <span>Nuevo Acuerdo</span>
                                        </div>
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Formulario de Banco */}
                        {activeTab === 'banco' && (
                            <div className="space-y-6">
                                {/* Campo Nombre del Banco */}
                                <div>
                                    <label htmlFor="nombreBanco" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre del Banco *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building2 className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="nombreBanco"
                                            type="text"
                                            value={nombreBanco}
                                            onChange={(e) => setNombreBanco(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ingrese el nombre del banco"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Campo Saldo */}
                                <div>
                                    <label htmlFor="saldoBanco" className="block text-sm font-medium text-gray-700 mb-2">
                                        Saldo Inicial ($) *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="saldoBanco"
                                            type="text"
                                            value={saldoBanco}
                                            onChange={(e) => handleMoneyChange(e, setSaldoBanco)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ingrese el saldo inicial"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-sm">ARS</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones Banco */}
                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleSubmitBanco}
                                        disabled={isLoadingBanco || !usuario}
                                        className={`flex-1 font-bold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                            isLoadingBanco || !usuario
                                                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                        } flex items-center justify-center space-x-2`}
                                    >
                                        {isLoadingBanco ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Guardando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                <span>Registrar Banco</span>
                                            </>
                                        )}
                                    </button>

                                    {onBack && (
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                            disabled={isLoadingBanco}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Formulario de Acuerdo Bancario */}
                        {activeTab === 'acuerdo' && (
                            <div className="space-y-6">
                                {/* Campo Banco */}
                                <div>
                                    <label htmlFor="bancoSeleccionado" className="block text-sm font-medium text-gray-700 mb-2">
                                        Banco *
                                    </label>
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
                                                {banco.nombre} - {formatearMoneda(banco.saldo)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Campo Monto */}
                                <div>
                                    <label htmlFor="montoacuerdo" className="block text-sm font-medium text-gray-700 mb-2">
                                        Monto del Acuerdo ($) *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Banknote className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="montoacuerdo"
                                            type="text"
                                            value={montoacuerdo}
                                            onChange={(e) => handleMoneyChange(e, setMontoAcuerdo)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ingrese el monto del acuerdo"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-sm">ARS</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Campo Fecha Inicio */}
                                <div>
                                    <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Inicio *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="fechaInicio"
                                            type="date"
                                            value={fechaInicio}
                                            onChange={(e) => setFechaInicio(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Campo Fecha Fin */}
                                <div>
                                    <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Fin *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CalendarDays className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="fechaFin"
                                            type="date"
                                            value={fechaFin}
                                            onChange={(e) => setFechaFin(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Botones Acuerdo */}
                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleSubmitAcuerdo}
                                        disabled={isLoadingAcuerdo || !usuario || isLoadingBancos}
                                        className={`flex-1 font-bold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                            isLoadingAcuerdo || !usuario || isLoadingBancos
                                                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                        } flex items-center justify-center space-x-2`}
                                    >
                                        {isLoadingAcuerdo ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Guardando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                <span>Registrar Acuerdo</span>
                                            </>
                                        )}
                                    </button>

                                    {onBack && (
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                            disabled={isLoadingAcuerdo}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Información adicional */}
                        <div className="mt-6 text-center text-gray-500 text-sm">
                            <p>Los campos marcados con * son obligatorios</p>
                        </div>
                    </div>

                    {/* Columna derecha: Tablas de últimos registros */}
                    <div className="space-y-6">
                        {/* Tabla de Últimos Bancos */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Últimos Bancos</h2>
                                <button
                                    onClick={() => setMostrarTablaBancos(!mostrarTablaBancos)}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title={mostrarTablaBancos ? "Ocultar tabla" : "Mostrar tabla"}
                                >
                                    {mostrarTablaBancos ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {mostrarTablaBancos && (
                                <>
                                    {isLoadingUltimosBancos ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-3 text-gray-600">Cargando bancos...</span>
                                        </div>
                                    ) : ultimosBancos.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                            <p>No hay bancos registrados aún</p>
                                            <p className="text-sm">Los bancos que registres aparecerán aquí</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-hidden rounded-lg border border-gray-200">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Nombre
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Saldo
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Estado
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {ultimosBancos.map((banco, index) => (
                                                            <tr
                                                                key={banco.id || index}
                                                                className={`hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-green-50' : ''}`}
                                                            >
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {banco.nombre}
                                                                </td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                                                                    {formatearMoneda(banco.saldo)}
                                                                </td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm">
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                        banco.estado 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {banco.estado ? 'Activo' : 'Inactivo'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Indicador de registro más reciente */}
                                            {ultimosBancos.length > 0 && (
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                    Mostrando los últimos {ultimosBancos.length} registros • El más reciente aparece resaltado
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Botón para recargar datos */}
                                    {!isLoadingUltimosBancos && ultimosBancos.length > 0 && (
                                        <div className="mt-4 text-center">
                                            <button
                                                onClick={cargarUltimosBancos}
                                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                            >
                                                Actualizar lista
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Tabla de Últimos Acuerdos Bancarios */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Últimos Acuerdos</h2>
                                <button
                                    onClick={() => setMostrarTablaAcuerdos(!mostrarTablaAcuerdos)}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title={mostrarTablaAcuerdos ? "Ocultar tabla" : "Mostrar tabla"}
                                >
                                    {mostrarTablaAcuerdos ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {mostrarTablaAcuerdos && (
                                <>
                                    {isLoadingUltimosAcuerdos ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-3 text-gray-600">Cargando acuerdos...</span>
                                        </div>
                                    ) : ultimosAcuerdos.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                            <p>No hay acuerdos bancarios registrados aún</p>
                                            <p className="text-sm">Los acuerdos que registres aparecerán aquí</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-hidden rounded-lg border border-gray-200">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Banco
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Monto
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Inicio
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Fin
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Estado
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {ultimosAcuerdos.map((acuerdo, index) => (
                                                            <tr
                                                                key={acuerdo.id || index}
                                                                className={`hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-green-50' : ''}`}
                                                            >
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {acuerdo.banco.nombre}
                                                                </td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                                                                    {formatearMoneda(acuerdo.monto)}
                                                                </td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                    {formatearFecha(acuerdo.fechaInicio)}
                                                                </td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                    {formatearFecha(acuerdo.fechaFin)}
                                                                </td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm">
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                        acuerdo.estado 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {acuerdo.estado ? 'Activo' : 'Inactivo'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Indicador de registro más reciente */}
                                            {ultimosAcuerdos.length > 0 && (
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                    Mostrando los últimos {ultimosAcuerdos.length} registros • El más reciente aparece resaltado
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Botón para recargar datos */}
                                    {!isLoadingUltimosAcuerdos && ultimosAcuerdos.length > 0 && (
                                        <div className="mt-4 text-center">
                                            <button
                                                onClick={cargarUltimosAcuerdos}
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
        </div>
    );}