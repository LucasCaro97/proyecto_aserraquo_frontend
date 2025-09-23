import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TreePine, 
  Eye, 
  ChevronDown, 
  ChevronUp,
} from 'lucide-react';

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const AdminDashboard = () => {
  // Inicializamos con el mes y año actuales
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  
  const [insumosData, setInsumosData] = useState([]);
  const [dailyInsumosData, setDailyInsumosData] = useState([]); // Estado para los datos diarios
  const [insumosTotals, setInsumosTotals] = useState({ totalRollos: 0, totalResina: 0, totalHarina: 0 });
  
  const [showInsumosDetails, setShowInsumosDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDaily, setLoadingDaily] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/rollos-ingresados/obtener-resumen?mes=${selectedMonth}&anio=${selectedYear}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Calculamos los totales a partir de los datos recibidos del backend
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
        setInsumosData(data); 
        
      } catch (error) {
        console.error('Error al cargar los datos del dashboard:', error);
        setInsumosTotals({ totalRollos: 0, totalResina: 0, totalHarina: 0 });
        setInsumosData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [selectedMonth, selectedYear]); 

  // Nuevo useEffect para cargar los datos diarios cuando se expande la tabla de detalles
  useEffect(() => {
      if (showInsumosDetails) {
          const fetchDailyInsumosData = async () => {
              setLoadingDaily(true);
              try {
                  const response = await fetch(`http://localhost:8080/rollos-ingresados/obtener-resumen-diario?mes=${selectedMonth}&anio=${selectedYear}`);
                  if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  const data = await response.json();
                  
                  // Agrupar los datos por fecha para la tabla
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
                  console.error('Error al cargar los datos diarios de insumos:', error);
                  setDailyInsumosData([]);
              } finally {
                  setLoadingDaily(false);
              }
          };
          fetchDailyInsumosData();
      }
  }, [showInsumosDetails, selectedMonth, selectedYear]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setShowInsumosDetails(false); 
  };
  
  const handleYearChange = (event) => {
      setSelectedYear(event.target.value);
      setShowInsumosDetails(false);
  };
  
  const handleToggleInsumosDetails = () => {
    setShowInsumosDetails(!showInsumosDetails);
  };

  const formatearFecha = (fechaString) => {
    const partes = fechaString.split('-');
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard del Administrador
        </h1>
        
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
                  Registros Totales de Insumos
                </h2>
                {loadingDaily ? (
                    <div className="text-center text-gray-500">Cargando detalles diarios...</div>
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
            
            {/* Se eliminan las secciones de Ingresos Futuros ya que no están conectadas */}
            {/* ... */}
          </>
        )}
      </div>
    </div>
  );
};