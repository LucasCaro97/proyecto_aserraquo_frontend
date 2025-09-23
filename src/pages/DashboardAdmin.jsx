import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TreePine, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Package,
  Truck,
  DollarSign
} from 'lucide-react';

// Datos ficticios para simular meses anteriores de Ingreso de Insumos
const DUMMY_INSUMOS_DATA = {
  '2025-09': [
    { date: '2025-09-01', totalRollos: 50.25, totalResina: 20.75, totalHarina: 30.50 },
    { date: '2025-09-02', totalRollos: 75.10, totalResina: 15.30, totalHarina: 25.00 },
    { date: '2025-09-03', totalRollos: 60.00, totalResina: 30.80, totalHarina: 15.90 },
    { date: '2025-09-04', totalRollos: 90.45, totalResina: 25.15, totalHarina: 40.70 },
    { date: '2025-09-05', totalRollos: 45.30, totalResina: 10.95, totalHarina: 20.40 },
  ],
  '2025-08': [
    { date: '2025-08-01', totalRollos: 40.10, totalResina: 18.20, totalHarina: 28.50 },
    { date: '2025-08-02', totalRollos: 68.90, totalResina: 12.50, totalHarina: 22.00 },
    { date: '2025-08-03', totalRollos: 55.70, totalResina: 28.10, totalHarina: 14.60 },
  ],
  '2025-07': [
    { date: '2025-07-01', totalRollos: 35.80, totalResina: 15.00, totalHarina: 25.90 },
    { date: '2025-07-02', totalRollos: 60.20, totalResina: 10.80, totalHarina: 18.30 },
  ],
};

// Nuevos datos ficticios para Ingresos Futuros
const DUMMY_INGRESOS_FUTUROS_DATA = {
    '2025-09': [
        { date: '2025-09-01', paquetes: 100, camiones: 2, ventas: 500000.00 },
        { date: '2025-09-02', paquetes: 120, camiones: 3, ventas: 650000.00 },
        { date: '2025-09-03', paquetes: 80, camiones: 1, ventas: 420000.00 },
        { date: '2025-09-04', paquetes: 150, camiones: 4, ventas: 800000.00 },
    ],
    '2025-08': [
        { date: '2025-08-01', paquetes: 90, camiones: 2, ventas: 480000.00 },
        { date: '2025-08-02', paquetes: 110, camiones: 3, ventas: 600000.00 },
    ],
};

const MONTH_NAMES = {
  '2025-09': 'Septiembre 2025',
  '2025-08': 'Agosto 2025',
  '2025-07': 'Julio 2025',
};

export const AdminDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('2025-09');
  
  // Estados para Ingreso de Insumos
  const [insumosData, setInsumosData] = useState({ totalRollos: 0, totalResina: 0, totalHarina: 0 });
  const [dailyInsumosData, setDailyInsumosData] = useState([]);
  const [showInsumosDetails, setShowInsumosDetails] = useState(false);

  // Nuevos estados para Ingresos Futuros
  const [ingresosFuturosData, setIngresosFuturosData] = useState({ totalPaquetes: 0, totalCamiones: 0, totalVentas: 0 });
  const [dailyIngresosFuturosData, setDailyIngresosFuturosData] = useState([]);
  const [showIngresosFuturosDetails, setShowIngresosFuturosDetails] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchAdminData = async () => {
      try {
        // Lógica para Insumos
        const insumosForMonth = DUMMY_INSUMOS_DATA[selectedMonth] || [];
        const insumosTotals = insumosForMonth.reduce(
          (sum, item) => ({
            totalRollos: sum.totalRollos + item.totalRollos,
            totalResina: sum.totalResina + item.totalResina,
            totalHarina: sum.totalHarina + item.totalHarina,
          }),
          { totalRollos: 0, totalResina: 0, totalHarina: 0 }
        );
        setInsumosData(insumosTotals);
        setDailyInsumosData(insumosForMonth);

        // Lógica para Ingresos Futuros
        const ingresosFuturosForMonth = DUMMY_INGRESOS_FUTUROS_DATA[selectedMonth] || [];
        const ingresosFuturosTotals = ingresosFuturosForMonth.reduce(
          (sum, item) => ({
            totalPaquetes: sum.totalPaquetes + item.paquetes,
            totalCamiones: sum.totalCamiones + item.camiones,
            totalVentas: sum.totalVentas + item.ventas,
          }),
          { totalPaquetes: 0, totalCamiones: 0, totalVentas: 0 }
        );
        setIngresosFuturosData(ingresosFuturosTotals);
        setDailyIngresosFuturosData(ingresosFuturosForMonth);
        
      } catch (error) {
        console.error('Error al cargar los datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [selectedMonth]); 

  const handleToggleInsumosDetails = () => {
    setShowInsumosDetails(!showInsumosDetails);
  };
  
  const handleToggleIngresosFuturosDetails = () => {
    setShowIngresosFuturosDetails(!showIngresosFuturosDetails);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setShowInsumosDetails(false); 
    setShowIngresosFuturosDetails(false);
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard del Administrador
        </h1>
        
        {/* Selector de Mes */}
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
            {Object.keys(DUMMY_INSUMOS_DATA).map((monthKey) => (
              <option key={monthKey} value={monthKey}>
                {MONTH_NAMES[monthKey]}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Cargando datos...</div>
        ) : (
          <>
            {/* Sección de Ingreso de Insumos */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TreePine className="h-6 w-6 mr-2 text-green-600" />
                Ingreso de Insumos (Totales de {MONTH_NAMES[selectedMonth]})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 mb-2">{insumosData.totalRollos.toFixed(2)} Tn</div>
                  <div className="text-sm text-gray-600">Rollos</div>
                </div>
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 mb-2">{insumosData.totalResina.toFixed(2)} Tn</div>
                  <div className="text-sm text-gray-600">Resina</div>
                </div>
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 mb-2">{insumosData.totalHarina.toFixed(2)} Tn</div>
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
                    <span>Ocultar Detalles</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Ver Detalles</span>
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
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rollos (Tn)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resina (Tn)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harina (Tn)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dailyInsumosData.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.totalRollos.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.totalResina.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.totalHarina.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Nueva Sección: Ingresos Futuros */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
                Ingresos Futuros (Totales de {MONTH_NAMES[selectedMonth]})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 mb-2">{ingresosFuturosData.totalPaquetes}</div>
                  <div className="text-sm text-gray-600">Paquetes Despachados</div>
                </div>
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 mb-2">{ingresosFuturosData.totalCamiones}</div>
                  <div className="text-sm text-gray-600">Camiones Despachados</div>
                </div>
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">{formatCurrency(ingresosFuturosData.totalVentas)}</div>
                  <div className="text-sm text-gray-600">Ventas Totales</div>
                </div>
              </div>
              <button
                onClick={handleToggleIngresosFuturosDetails}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {showIngresosFuturosDetails ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>Ocultar Detalles</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Ver Detalles</span>
                  </>
                )}
              </button>
            </div>

            {/* Tabla de Registros Diarios de Ingresos Futuros - Colapsable */}
            <div className={`transition-all duration-300 ease-in-out ${showIngresosFuturosDetails ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
                  Registros Diarios de Ingresos Futuros
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paquetes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Camiones</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dailyIngresosFuturosData.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.paquetes}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.camiones}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(record.ventas)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};