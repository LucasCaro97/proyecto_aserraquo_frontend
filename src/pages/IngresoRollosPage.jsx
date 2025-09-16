import { useState, useEffect } from 'react';
import { Scale, Calendar, User, Save, ArrowLeft, AlertCircle, CheckCircle, Plus, Eye, EyeOff, ListPlus, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { obtenerDiaDeLaSemana } from '../hooks/obtenerDiaDeLaSemana';
import { useUsuario } from '../hooks/useUsuario';
import { useRegistrosFinancieros } from '../hooks/useRegistrosFinancieros';

export const IngresoRollosPage = ({ onBack, onSuccess }) => {
    // Estados del formulario de Rollo
    const [peso, setPeso] = useState('');
    const [registroFinancieroDiario, setRegistroFinancieroDiario] = useState('');
    const [tipoProductoSeleccionado, setTipoProductoSeleccionado] = useState('');

    // Estados del formulario de Tipo de Producto
    const [nombreTipoProducto, setNombreTipoProducto] = useState('');

    // Estados para las tablas de últimos registros
    const [ultimosRollos, setUltimosRollos] = useState([]);
    const [ultimosTiposProducto, setUltimosTiposProducto] = useState([]);
    const [isLoadingUltimosRollos, setIsLoadingUltimosRollos] = useState(false);
    const [isLoadingUltimosTiposProducto, setIsLoadingUltimosTiposProducto] = useState(false);
    const [mostrarTablaRollos, setMostrarTablaRollos] = useState(true);
    const [mostrarTablaTipos, setMostrarTablaTipos] = useState(true);

    // Estados para tipos de producto disponibles
    const [tiposProductoDisponibles, setTiposProductoDisponibles] = useState([]);
    const [isLoadingTiposProducto, setIsLoadingTiposProducto] = useState(false);

    //Variables
    const apiUrl = import.meta.env.VITE_API_URL;

    // Estados de UI
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTipoProducto, setIsLoadingTipoProducto] = useState(false);
    const [isCreatingRegistro, setIsCreatingRegistro] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('rollo'); // 'rollo' o 'tipoProducto'

    // hook peronsalizado para obtener el usuario del token
    const { usuario } = useUsuario();

    //hook personalizado para obtener registros financieros
    const {
        registrosDisponibles,
        isLoadingRegistros,
        cargarRegistrosFinancieros,
        crearRegistroDelDia,
    } = useRegistrosFinancieros();

    // Función para cargar los últimos 10 rollos
    const cargarUltimosRollos = async () => {
        if (!usuario?.id) return;
        setIsLoadingUltimosRollos(true);
        try {
            const response = await axios.get(`${apiUrl}/rollos-ingresados/sorted-top10-desc`);
            setUltimosRollos(response.data);
        } catch (error) {
            console.error('Error al cargar últimos rollos:', error);
        } finally {
            setIsLoadingUltimosRollos(false);
        }
    };

    // Función para cargar los últimos 10 tipos de producto
    const cargarUltimosTiposProducto = async () => {
        setIsLoadingUltimosTiposProducto(true);
        try {
            const response = await axios.get(`${apiUrl}/tipo-producto`);

            setTimeout(() => {
                setUltimosTiposProducto(response.data);
                setIsLoadingUltimosTiposProducto(false);
            }, 300);
        } catch (error) {
            console.error('Error al cargar últimos tipos de producto:', error);
            setIsLoadingUltimosTiposProducto(false);
        }
    };

    // Función para cargar tipos de producto disponibles para el select
    const cargarTiposProductoDisponibles = async () => {
        setIsLoadingTiposProducto(true);
        try {
            const response = await axios.get(`${apiUrl}/tipo-producto`);
            setTiposProductoDisponibles(response.data);
        } catch (error) {
            console.error('Error al cargar tipos de producto disponibles:', error);
        } finally {
            setIsLoadingTiposProducto(false);
        }
    };

    // Cargar datos cuando el usuario esté disponible
    useEffect(() => {
        if (usuario?.id) {
            cargarUltimosRollos();
            cargarTiposProductoDisponibles();
            cargarRegistrosFinancieros();
            cargarUltimosTiposProducto();
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

    const handleSubmitRollo = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!peso || parseFloat(peso) <= 0) {
            setError('El peso debe ser mayor a 0');
            return;
        }

        if (!tipoProductoSeleccionado) {
            setError('Debe seleccionar un tipo de producto');
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
                idUsuario: usuario.id,
                idTipoProducto: parseInt(tipoProductoSeleccionado) // Nuevo campo
            };

            const response = await axios.post(`${apiUrl}/rollos-ingresados`, nuevoRollo);
            
            setSuccess('Rollo registrado exitosamente');
            // Limpiar formulario
            setPeso('');
            setRegistroFinancieroDiario('');
            setTipoProductoSeleccionado('');
            setIsLoading(false);
            await cargarUltimosRollos();

            if (onSuccess) {
                setTimeout(() => onSuccess(), 1500);
            }
        } catch (error) {
            console.error('Error al registrar rollo:', error);
            setError('Error al registrar el rollo. Inténtalo de nuevo.');
            setIsLoading(false);
        }
    };

    const handleSubmitTipoProducto = async (e) => {
        e.preventDefault();

        if (!nombreTipoProducto.trim()) {
            setError('El nombre del tipo de producto es requerido');
            return;
        }

        setIsLoadingTipoProducto(true);
        setError('');
        setSuccess('');

        try {
            const nuevoTipoProducto = {
                nombre: nombreTipoProducto.trim(),
                estado: true
            };

            const response = await axios.post(`${apiUrl}/tipo-producto`, nuevoTipoProducto);

            setTimeout(() => {
                setSuccess('Tipo de producto registrado exitosamente');
                setNombreTipoProducto('');
                setIsLoadingTipoProducto(false);
                cargarUltimosTiposProducto();
                cargarTiposProductoDisponibles();

                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            }, 1000);

        } catch (error) {
            console.error('Error al registrar tipo de producto:', error);
            setError('Error al registrar el tipo de producto. Inténtalo de nuevo.');
            setIsLoadingTipoProducto(false);
        }
    };

    const handlePesoChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setPeso(value);
        }
    };

    const formatearFecha = (fechaString) => {
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
                                <h1 className="text-3xl font-bold text-gray-900">Gestión de Ingreso Materiales</h1>
                                <p className="text-gray-600 mt-1">Registra ingreso de materia prima</p>
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
                                        onClick={() => setActiveTab('rollo')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'rollo'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp className="h-4 w-4" />
                                            <span>Nuevo Rollo</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('tipoProducto')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'tipoProducto'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <ListPlus className="h-4 w-4" />
                                            <span>Nuevo Tipo de Producto</span>
                                        </div>
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Formulario de Rollo */}
                        {activeTab === 'rollo' && (
                            <form onSubmit={handleSubmitRollo} className="space-y-6">
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
                                            placeholder="Ingrese el peso del producto"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-sm">tn</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Campo Tipo de Producto */}
                                <div>
                                    <label htmlFor="tipoProductoSeleccionado" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Producto *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ListPlus className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="tipoProductoSeleccionado"
                                            value={tipoProductoSeleccionado}
                                            onChange={(e) => setTipoProductoSeleccionado(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                        >
                                            <option value="" disabled>Seleccione un tipo de producto</option>
                                            {isLoadingTiposProducto ? (
                                                <option disabled>Cargando...</option>
                                            ) : (
                                                tiposProductoDisponibles.map((tipo) => (
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
                                <div className="mt-6 text-center text-gray-500 text-sm">
                                    <p>Los campos marcados con * son obligatorios</p>
                                </div>
                            </form>
                        )}

                        {/* Formulario de Tipo de Producto */}
                        {activeTab === 'tipoProducto' && (
                            <form onSubmit={handleSubmitTipoProducto} className="space-y-6">
                                {/* Campo Nombre del Tipo de Producto */}
                                <div>
                                    <label htmlFor="nombreTipoProducto" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre del Tipo de Producto *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ListPlus className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="nombreTipoProducto"
                                            type="text"
                                            value={nombreTipoProducto}
                                            onChange={(e) => setNombreTipoProducto(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ej: A4"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Botón de Guardar */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoadingTipoProducto}
                                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                                            isLoadingTipoProducto ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }`}
                                    >
                                        {isLoadingTipoProducto ? (
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
                                                Guardar Tipo de Producto
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Columna derecha: Tablas de registros */}
                    <div className="space-y-6">
                        {/* Tabla de Últimos Rollos */}
                        {activeTab === 'rollo' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Últimos Registros</h2>
                                    <button
                                        onClick={() => setMostrarTablaRollos(!mostrarTablaRollos)}
                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        title={mostrarTablaRollos ? "Ocultar tabla" : "Mostrar tabla"}
                                    >
                                        {mostrarTablaRollos ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {mostrarTablaRollos && (
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
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Tipo de Producto
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
                                                                        {formatearFecha(rollo.registroFinancieroDiario?.fecha)}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        {parseFloat(rollo.peso).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                        {rollo.tipoProducto?.nombre}
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
                        )}

                        {/* Tabla de Últimos Tipos de Producto */}
                        {activeTab === 'tipoProducto' && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Últimos Tipos de Producto</h2>
                                    <button
                                        onClick={() => setMostrarTablaTipos(!mostrarTablaTipos)}
                                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        {mostrarTablaTipos ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {isLoadingUltimosTiposProducto ? (
                                    <div className="text-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-2 text-sm text-gray-500">Cargando tipos de producto...</p>
                                    </div>
                                ) : (
                                    <>
                                        {mostrarTablaTipos && ultimosTiposProducto.length > 0 ? (
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
                                                        {ultimosTiposProducto.map((tipo) => (
                                                            <tr key={tipo.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tipo.nombre}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                                    Mostrando los últimos {ultimosTiposProducto.length} registros
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">No hay tipos de producto registrados.</p>
                                        )}
                                        {/* Botón para recargar datos */}
                                        {!isLoadingUltimosTiposProducto && ultimosTiposProducto.length > 0 && (
                                            <div className="mt-4 text-center">
                                                <button
                                                    onClick={cargarUltimosTiposProducto}
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