import { useState, useEffect, use } from 'react';
import { Scale, Calendar, User, Save, ArrowLeft, AlertCircle, CheckCircle, Plus, Eye, EyeOff } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import { useUsuario } from '../hooks/useUsuario';
import { useRegistrosFinancieros } from '../hooks/useRegistrosFinancieros';

export const IngresoRollosPage = ({ onBack, onSuccess }) => {
    // Estados del formulario
    const [peso, setPeso] = useState('');
    const [registroFinancieroDiario, setRegistroFinancieroDiario] = useState('');

    // Estados para la tabla de últimos registros
    const [ultimosRollos, setUltimosRollos] = useState([]);
    const [isLoadingUltimosRollos, setIsLoadingUltimosRollos] = useState(false);
    const [mostrarTabla, setMostrarTabla] = useState(true);

    //Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Estados de UI
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingRegistro, setIsCreatingRegistro] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // hook peronsalizado para obtener el usuario del token
    const {usuario} = useUsuario();
    
    //hook personalizado para obtener registros financieros
    const {
        registrosDisponibles,
        isLoadingRegistros,
        error: errorRegistros,
        cargarRegistrosFinancieros,
        crearRegistroDelDia,
        clearError: clearErrorRegistros
    } = useRegistrosFinancieros();

    // Función para cargar los últimos 10 rollos
    const cargarUltimosRollos = async () => {
        if (!usuario?.id) return;

        setIsLoadingUltimosRollos(true);
        try {
            // Endpoint para obtener los últimos 10 rollos del usuario
            const response = await axios.get(`${apiUrl}/rollos-ingresados/sorted-top10-desc`);
            setUltimosRollos(response.data);
        } catch (error) {
            console.error('Error al cargar últimos rollos:', error);
            // No mostramos error aquí para no interferir con el flujo principal
        } finally {
            setIsLoadingUltimosRollos(false);
        }
    };

    // Cargar últimos rollos cuando el usuario esté disponible
    useEffect(() => {
        if (usuario?.id) {
            cargarUltimosRollos();
        }
    }, [usuario]);

    const handleCrearRegistroDelDia = async () => {
        setIsCreatingRegistro(true);
        setError('');
        clearErrorRegistros();

        try {
            const nuevoRegistro = await crearRegistroDelDia();
            
            // Seleccionar automáticamente el nuevo registro creado
            if (nuevoRegistro && nuevoRegistro.id) {
                setRegistroFinancieroDiario(nuevoRegistro.id.toString());
                setSuccess('Registro del día actual creado exitosamente');
            }
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
        if (!peso || parseFloat(peso) <= 0) {
            setError('El peso debe ser mayor a 0');
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
            const nuevoRollo = {
                cantidadRollos: null,
                peso: parseFloat(peso),
                idRegistroDiario: parseInt(registroFinancieroDiario),
                idUsuario: usuario.id
            };

            const response = await axios.post(`${apiUrl}/rollos-ingresados`, nuevoRollo);

            setSuccess('Rollo registrado exitosamente');
            // Limpiar formulario
            setPeso('');
            setRegistroFinancieroDiario('');
            setIsLoading(false);

            // Recargar la tabla de últimos rollos para mostrar el nuevo registro
            await cargarUltimosRollos();

            // Callback de éxito si se proporciona
            if (onSuccess) {
                setTimeout(() => onSuccess(), 1500);
            }

        } catch (error) {
            console.error('Error al registrar rollo:', error);
            setError('Error al registrar el rollo. Inténtalo de nuevo.');
            setIsLoading(false);
        }
    };

    const handlePesoChange = (e) => {
        const value = e.target.value;
        // Permitir solo números y punto decimal
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setPeso(value);
        }
    };

    const formatearFecha = (fechaString) => {
        // Si la fecha es "2025-09-02", split la convierte en ["2025", "09", "02"]
        const partes = fechaString.split('-');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
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
                                <h1 className="text-3xl font-bold text-gray-900">Alta de Rollos</h1>
                                <p className="text-gray-600 mt-1">Registra el ingreso de nuevos rollos al sistema</p>
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

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Campo Peso */}
                            <div>
                                <label htmlFor="peso" className="block text-sm font-medium text-gray-700 mb-2">
                                    Peso (kg) *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Scale className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="peso"
                                        type="text"
                                        value={peso}
                                        onChange={handlePesoChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Ingrese el peso del rollo"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-sm">tn</span>
                                    </div>
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

                            {/* Botones */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="submit"
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
                        </form>

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
                                {isLoadingUltimosRollos ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-600">Cargando registros...</span>
                                    </div>
                                ) : ultimosRollos.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Scale className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <p>No hay registros de rollos aún</p>
                                        <p className="text-sm">Los rollos que registres aparecerán aquí</p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-lg border border-gray-200">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Fecha
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Peso (tn)
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {ultimosRollos.map((rollo, index) => (
                                                        <tr
                                                            key={rollo.id || index}
                                                            className={`hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-green-50' : ''}`}
                                                        >
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                {formatearFecha(rollo.registroFinancieroDiario.fecha)}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {parseFloat(rollo.peso).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Indicador de registro más reciente */}
                                        {ultimosRollos.length > 0 && (
                                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                Mostrando los últimos {ultimosRollos.length} registros • El más reciente aparece resaltado
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Botón para recargar datos */}
                                {!isLoadingUltimosRollos && ultimosRollos.length > 0 && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={cargarUltimosRollos}
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
    );
};