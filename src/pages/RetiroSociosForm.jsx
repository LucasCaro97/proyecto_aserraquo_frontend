import { useState, useEffect } from 'react';
import { DollarSign, FileText, User, Save, ArrowLeft, AlertCircle, CheckCircle, Plus, Eye, EyeOff, TrendingDown } from 'lucide-react';
import { useUsuario } from '../hooks/useUsuario';
import { useRegistrosFinancieros } from '../hooks/useRegistrosFinancieros';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import axios from 'axios';

export const RetiroSociosForm = ({ onBack, onSuccess }) => {
    // Estados del formulario de Retiro de Socios
    const [montoRetiro, setMontoRetiro] = useState('');
    const [observacionRetiro, setObservacionRetiro] = useState('');
    const [registroFinancieroDiario, setRegistroFinancieroDiario] = useState('');

    // Estados para la tabla de últimos registros
    const [ultimosRetiros, setUltimosRetiros] = useState([]);
    const [isLoadingUltimosRetiros, setIsLoadingUltimosRetiros] = useState(false);
    const [mostrarTablaRetiros, setMostrarTablaRetiros] = useState(true);

    // Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Estados de UI
    const [isLoadingRetiro, setIsLoadingRetiro] = useState(false);
    const [isCreatingRegistro, setIsCreatingRegistro] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Hook personalizado para obtener el usuario del token
    const { usuario } = useUsuario();

    // Hook personalizado para registros financieros
    const {
        registrosDisponibles,
        isLoadingRegistros,
        cargarRegistrosFinancieros,
        crearRegistroDelDia,
    } = useRegistrosFinancieros();

    // Función para cargar los últimos 10 retiros de socios
    const cargarUltimosRetiros = async () => {
        setIsLoadingUltimosRetiros(true);
        try {
            const response = await axios.get(`${apiUrl}/retiro-socios/sorted-top10-desc`);
            
            setTimeout(() => {
                setUltimosRetiros(response.data);
                setIsLoadingUltimosRetiros(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos retiros de socios:', error);
            setIsLoadingUltimosRetiros(false);
        }
    };

    // Cargar datos cuando el usuario esté disponible
    useEffect(() => {
        if (usuario?.id) {
            cargarUltimosRetiros();
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

    const handleSubmitRetiro = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!montoRetiro || parseFloat(montoRetiro) <= 0) {
            setError('El monto del retiro debe ser un número válido mayor a 0');
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

        setIsLoadingRetiro(true);
        setError('');
        setSuccess('');

        try {
            const nuevoRetiro = {
                monto: parseFloat(montoRetiro),
                idRegistroDiario: parseInt(registroFinancieroDiario),
                idUsuario: usuario.id,
                observacion: observacionRetiro.trim()
            };

            const response = await axios.post(`${apiUrl}/retiro-socios`, nuevoRetiro);
            
            setTimeout(() => {
                setSuccess('Retiro de socio registrado exitosamente');
                // Limpiar formulario
                setMontoRetiro('');
                setObservacionRetiro('');
                setRegistroFinancieroDiario('');
                setIsLoadingRetiro(false);

                // Recargar la tabla de últimos retiros
                cargarUltimosRetiros();
                
                // Callback de éxito si se proporciona
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al registrar retiro de socio:', error);
            setError('Error al registrar el retiro de socio. Inténtalo de nuevo.');
            setIsLoadingRetiro(false);
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
                                <h1 className="text-3xl font-bold text-gray-900">Gestión de Retiros de Socios</h1>
                                <p className="text-gray-600 mt-1">Registra los retiros de capital</p>
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

                        {/* Formulario de Retiro de Socios */}
                        <div className="space-y-6">
                            {/* Campo Monto */}
                            <div>
                                <label htmlFor="montoRetiro" className="block text-sm font-medium text-gray-700 mb-2">
                                    Monto ($) *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="montoRetiro"
                                        type="text"
                                        value={montoRetiro}
                                        onChange={(e) => handleMoneyChange(e, setMontoRetiro)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Ingrese el monto del retiro"
                                        required
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
                                <label htmlFor="observacionRetiro" className="block text-sm font-medium text-gray-700 mb-2">
                                    Observación
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="observacionRetiro"
                                        type="text"
                                        value={observacionRetiro}
                                        onChange={(e) => setObservacionRetiro(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Ej: Retiro para gastos personales"
                                    />
                                </div>
                            </div>

                            {/* Botón de Guardar */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    onClick={handleSubmitRetiro}
                                    className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                                        isLoadingRetiro ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    }`}
                                    disabled={isLoadingRetiro}
                                >
                                    {isLoadingRetiro ? (
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
                                            Guardar Retiro
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha: Tabla de registros */}
                    <div className="space-y-6">
                        {/* Tabla de Últimos Retiros */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Últimos Retiros de Socios</h2>
                                <button
                                    onClick={() => setMostrarTablaRetiros(!mostrarTablaRetiros)}
                                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    {mostrarTablaRetiros ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {isLoadingUltimosRetiros ? (
                                <div className="text-center py-10">
                                    <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">Cargando retiros...</p>
                                </div>
                            ) : (
                                <>
                                    {mostrarTablaRetiros && ultimosRetiros.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Monto
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
                                                    {ultimosRetiros.map((retiro) => (
                                                        <tr key={retiro.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {formatearMoneda(retiro.monto)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{retiro.observacion}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatearFecha(retiro.registroFinancieroDiario?.fecha)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                Mostrando los últimos {ultimosRetiros.length} registros
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">No hay retiros de socios registrados.</p>
                                    )}

                                    {/* Botón para recargar datos */}
                                    {!isLoadingUltimosRetiros && ultimosRetiros.length > 0 && (
                                        <div className="mt-4 text-center">
                                            <button
                                                onClick={cargarUltimosRetiros}
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
    );
};