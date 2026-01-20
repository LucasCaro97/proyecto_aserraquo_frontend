import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TreePine,
    Eye,
    ChevronDown,
    ChevronUp,
    Package,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const AdminDashboard = () => {
    // Estados de control de fecha
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const navigate = useNavigate();

    // Estados de Ingreso de Insumos
    const [insumosTotals, setInsumosTotals] = useState({ totalRollos: 0, totalResina: 0, totalHarina: 0 });
    const [dailyInsumosData, setDailyInsumosData] = useState([]);
    const [showInsumosDetails, setShowInsumosDetails] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingDaily, setLoadingDaily] = useState(false);

    // Estados de Acumulados Recibidos
    const [acumuladosTotals, setAcumuladosTotals] = useState({
        totalCamiones: 0,
        totalPaquetes: 0,
        totalVentas: 0
    });
    const [dailyAcumuladosData, setDailyAcumuladosData] = useState([]);
    const [showAcumuladosDetails, setShowAcumuladosDetails] = useState(false);
    const [loadingAcumulados, setLoadingAcumulados] = useState(false);
    const [loadingDailyAcumulados, setLoadingDailyAcumulados] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;


    // Efecto para cargar TOTALES de INSUMOS
    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${apiUrl}/rollos-ingresados/obtener-resumen?mes=${selectedMonth}&anio=${selectedYear}`);
                const data = await response.json();

                const totals = data.reduce(
                    (acc, current) => {
                        if (current.tipoProducto === 'Rollos') {
                            acc.totalRollos = current.pesoTotal;
                        } else if (current.tipoProducto === 'Resina') {
                            acc.totalResina = current.pesoTotal;
                        } else if (current.tipoProducto === 'Harina') {
                            acc.totalHarina = current.pesoTotal;
                        }
                        return acc;
                    },
                    { totalRollos: 0, totalResina: 0, totalHarina: 0 }
                );

                setInsumosTotals(totals);
            } catch (error) {
                setInsumosTotals({ totalRollos: 0, totalResina: 0, totalHarina: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, [selectedMonth, selectedYear]);

    // Efecto para cargar DETALLES DIARIOS de INSUMOS
    useEffect(() => {
        if (!showInsumosDetails) return;

        const fetchDailyInsumosData = async () => {
            setLoadingDaily(true);
            try {
                const response = await fetch(`${apiUrl}/rollos-ingresados/obtener-resumen-diario?mes=${selectedMonth}&anio=${selectedYear}`);
                const data = await response.json();

                const groupedByDate = data.reduce((acc, current) => {
                    const { fecha, tipoProducto, pesoTotal } = current;

                    if (!acc[fecha]) {
                        acc[fecha] = {
                            fecha,
                            tipos: [],
                            totalDiario: 0,
                        };
                    }

                    acc[fecha].tipos.push({
                        tipoProducto,
                        pesoTotal
                    });
                    acc[fecha].totalDiario += pesoTotal;

                    return acc;
                }, {});
                setDailyInsumosData(Object.values(groupedByDate));
            } catch (error) {
                setDailyInsumosData([]);
            } finally {
                setLoadingDaily(false);
            }
        };
        fetchDailyInsumosData();
    }, [showInsumosDetails, selectedMonth, selectedYear]);

    // Efecto para cargar TOTALES de ACUMULADOS (CORREGIDO)
    useEffect(() => {
        const fetchAcumuladosData = async () => {
            setLoadingAcumulados(true);
            try {
                const response = await fetch(`${apiUrl}/ingreso-futuro/obtener-resumen?mes=${selectedMonth}&anio=${selectedYear}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                if (data) {
                    // Acceso DIRECTO a las propiedades del objeto 'data'
                    setAcumuladosTotals({
                        totalCamiones: data.camionesDespachados || 0,
                        totalPaquetes: data.paquetesDespachados || 0,
                        totalVentas: data.ventasTotales || 0,
                    });
                } else {
                    setAcumuladosTotals({ totalCamiones: 0, totalPaquetes: 0, totalVentas: 0 });
                }

            } catch (error) {
                setAcumuladosTotals({ totalCamiones: 0, totalPaquetes: 0, totalVentas: 0 });
            } finally {
                setLoadingAcumulados(false);
            }
        };
        fetchAcumuladosData();
    }, [selectedMonth, selectedYear]);

    // Efecto para cargar DETALLES DIARIOS de ACUMULADOS
    useEffect(() => {
        if (!showAcumuladosDetails) return;

        const fetchDailyAcumuladosData = async () => {
            setLoadingDailyAcumulados(true);
            try {
                const response = await fetch(`${apiUrl}/ingreso-futuro/obtener-resumen-diario?mes=${selectedMonth}&anio=${selectedYear}`);
                const data = await response.json();

                const groupedByDate = data.reduce((acc, current) => {
                    const { fecha, camionesDespachados, paquetesDespachados, ventasTotales } = current;

                    if (!acc[fecha]) {
                        acc[fecha] = {
                            fecha,
                            camiones: 0,
                            paquetes: 0,
                            ventas: 0,
                        };
                    }

                    acc[fecha].camiones += camionesDespachados;
                    acc[fecha].paquetes += paquetesDespachados;
                    acc[fecha].ventas += ventasTotales;

                    return acc;
                }, {});
                setDailyAcumuladosData(Object.values(groupedByDate));
            } catch (error) {
                setDailyAcumuladosData([]);
            } finally {
                setLoadingDailyAcumulados(false);
            }
        };
        fetchDailyAcumuladosData();
    }, [showAcumuladosDetails, selectedMonth, selectedYear]);

    // Manejadores
    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
        setShowInsumosDetails(false);
        setShowAcumuladosDetails(false);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
        setShowInsumosDetails(false);
        setShowAcumuladosDetails(false);
    };

    const handleToggleInsumosDetails = () => {
        setShowInsumosDetails(!showInsumosDetails);
    };

    const handleToggleAcumuladosDetails = () => {
        setShowAcumuladosDetails(!showAcumuladosDetails);
    };

    const formatearFecha = (fechaString) => {
        const partes = fechaString.split('-');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    };

    const formatVentas = (valor) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        }).format(valor);
    };

    return (
        <div className="w-full bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header del Dashboard */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-500">Panel de Reportes</h1>
                        </div>
                        <div>
                            <button
                                className="border-2 rounded-md px-4 py-2 text-blue-500 font-bold hover:bg-blue-500 hover:text-gray-100"
                                onClick={() => navigate('/dashboard')}>
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
                {/* Selectores de Mes y Año */}
                <div className="mb-6 flex items-center space-x-4">
                    <label htmlFor="month-select" className="text-gray-700 font-semibold">
                        Selecciona el mes:
                    </label>
                    <select
                        id="month-select"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {MONTH_NAMES.map((name, index) => (
                            <option key={index} value={index + 1}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <label htmlFor="year-select" className="text-gray-700 font-semibold">
                        Selecciona el año:
                    </label>
                    <select
                        id="year-select"
                        value={selectedYear}
                        onChange={handleYearChange}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>

                {/* Sección de Ingreso de Insumos */}
                {loading ? (
                    <div className="text-center text-gray-500">Cargando datos de Insumos...</div>
                ) : (
                    <>
                        {/* Tarjeta de Totales de Insumos */}
                        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <TreePine className="h-6 w-6 mr-2 text-green-600" />
                                Ingreso de Insumos (Totales de {MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div className="text-center p-4 bg-gray-100 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-800 mb-2">{insumosTotals.totalRollos.toFixed(2)} Tn</div>
                                    <div className="text-sm text-gray-600">Rollos</div>
                                </div>
                                <div className="text-center p-4 bg-gray-100 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-800 mb-2">{insumosTotals.totalResina.toFixed(2)} Tn</div>
                                    <div className="text-sm text-gray-600">Resina</div>
                                </div>
                                <div className="text-center p-4 bg-gray-100 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-800 mb-2">{insumosTotals.totalHarina.toFixed(2)} Tn</div>
                                    <div className="text-sm text-gray-600">Harina</div>
                                </div>
                            </div>
                            <button
                                onClick={handleToggleInsumosDetails}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                {showInsumosDetails ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        <span>Ocultar Detalles de Insumos</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-4 w-4" />
                                        <span>Ver Detalles de Insumos</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Tabla de Registros Diarios de Insumos - Colapsable */}
                        <div className={`transition-all duration-300 ease-in-out ${showInsumosDetails ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
                                    Registros Diarios de Insumos
                                </h2>
                                {loadingDaily ? (
                                    <div className="text-center text-gray-500">Cargando detalles diarios de insumos...</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle por Producto</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso Total Diario</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {dailyInsumosData.map((day, index) => (
                                                    <tr key={day.fecha} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatearFecha(day.fecha)}</td>
                                                        <td className="px-6 py-4">
                                                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                                                {day.tipos.map((tipo, subIndex) => (
                                                                    <li key={subIndex}>
                                                                        <span className="font-semibold">{tipo.tipoProducto}:</span> {tipo.pesoTotal.toFixed(2)} tn
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{day.totalDiario.toFixed(2)} tn</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Sección de Acumulados Recibidos */}
                {loadingAcumulados ? (
                    <div className="text-center text-gray-500">Cargando datos de Acumulados...</div>
                ) : (
                    <>
                        {/* Tarjeta de Totales de Acumulados */}
                        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Package className="h-6 w-6 mr-2 text-blue-600" />
                                Ingresos Futuros (Totales de {MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div className="text-center p-4 bg-gray-100 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-800 mb-2">{acumuladosTotals.totalPaquetes || 0} Uds.</div>
                                    <div className="text-sm text-gray-600">Paquetes Despachados</div>
                                </div>
                                <div className="text-center p-4 bg-gray-100 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-800 mb-2">{acumuladosTotals.totalCamiones || 0} Uds.</div>
                                    <div className="text-sm text-gray-600">Camiones Despachados</div>
                                </div>
                                <div className="text-center p-4 bg-gray-100 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-800 mb-2">{formatVentas(acumuladosTotals.totalVentas || 0)}</div>
                                    <div className="text-sm text-gray-600">Ventas Totales</div>
                                </div>
                            </div>
                            <button
                                onClick={handleToggleAcumuladosDetails}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                {showAcumuladosDetails ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        <span>Ocultar Detalles de Acumulados</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-4 w-4" />
                                        <span>Ver Detalles de Acumulados</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Tabla de Registros Diarios de Acumulados - Colapsable */}
                        <div className={`transition-all duration-300 ease-in-out ${showAcumuladosDetails ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
                                    Registros Diarios de Acumulados
                                </h2>
                                {loadingDailyAcumulados ? (
                                    <div className="text-center text-gray-500">Cargando detalles diarios de acumulados...</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paquetes Desp.</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Camiones Desp.</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas Diarias</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {dailyAcumuladosData.map((day, index) => (
                                                    <tr key={day.fecha} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatearFecha(day.fecha)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{day.paquetes} Uds.</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{day.camiones} Uds.</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatVentas(day.ventas)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};