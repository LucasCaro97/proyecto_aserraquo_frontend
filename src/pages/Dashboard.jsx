import React, { useState } from 'react';
import { 
  Plus, 
  Eye, 
  TreePine, 
  TrendingUp, 
  Building2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  TrendingDown, 
  Users,
  History,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  // Configuración de las secciones del dashboard
  const dashboardSections = [
    {
      id: 'ingreso-rollos',
      title: 'Ingreso de Rollos',
      icon: <TreePine className="h-8 w-8" />,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      description: 'Gestiona el ingreso de rollos al aserradero',
      urlForm: '/ingreso-rollos',
      urlTable: '/visualizar-ingreso-rollos',
    },
    {
      id: 'ingresos-futuros',
      title: 'Ingresos Futuros',
      icon: <TrendingUp className="h-8 w-8" />,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      description: 'Proyecciones y planificación de ingresos',
      urlForm: '/ingresos-futuros',
      urlTable: '/visualizar-ingresos-futuros',
    },
    {
      id: 'bancos',
      title: 'Bancos',
      icon: <Building2 className="h-8 w-8" />,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      description: 'Gestión de cuentas bancarias y movimientos',
      urlForm: '/bancos',
      urlTable: '/visualizar-bancos'
    },
    {
      id: 'cheques',
      title: 'Cheques',
      icon: <CreditCard className="h-8 w-8" />, // Usamos CreditCard para representar cheques
      color: 'bg-yellow-600',
      hoverColor: 'hover:bg-yellow-700',
      description: 'Gestión y seguimiento de cheques recibidos y emitidos.',
      urlForm: '/cheques', // Ajusta las URL según tu enrutamiento real
      urlTable: '/cheques/visualizar', // Ajusta las URL según tu enrutamiento real
    },
    {
      id: 'historial-bancario-diario',
      title: 'Historial Bancario Diario',
      icon: <History className="h-8 w-8" />,
      color: 'bg-cyan-600',
      hoverColor: 'hover:bg-cyan-700',
      description: 'Visualiza el historial de movimientos de todas las cuentas bancarias.',
      urlForm: '/historial-bancario',
      urlTable: '/visualizar-historial-bancario'
    },
    {
      id: 'ingresos',
      title: 'Ingresos',
      icon: <ArrowUpCircle className="h-8 w-8" />,
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
      description: 'Registro y control de todos los ingresos',
      urlForm: '/ingresos',
      urlTable: '/visualizar-ingresos'
    },
    {
      id: 'egresos',
      title: 'Egresos',
      icon: <ArrowDownCircle className="h-8 w-8" />,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      description: 'Registro y control de todos los gastos',
      urlForm: '/egresos',
      urlTable: '/visualizar-egresos'
    },
    {
      id: 'egresos-futuros',
      title: 'Egresos Futuros',
      icon: <TrendingDown className="h-8 w-8" />,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      description: 'Planificación y proyección de gastos',
      urlForm: '/egresos-futuros',
      urlTable: '/visualizar-egresos-futuros'
    },
    {
      id: 'retiro-socios',
      title: 'Retiro de Socios',
      icon: <Users className="h-8 w-8" />,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      description: 'Gestión de retiros y distribuciones',
      urlForm: '/retiro-socios',
      urlTable: '/visualizar-retiro-socios'
    }
  ];

  const handleAddNew = (itemUrl) => {
    navigate(itemUrl);
  };

  const handleViewRecords = (itemUrl) => {
    navigate(itemUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header del Dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
          </div>
        </div>

        {/* Grid de Secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {dashboardSections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden w-full max-w-sm mx-auto"
            >
              {/* Header de la Card */}
              <div className={`${section.color} text-white p-6`}>
                <div className="flex items-center justify-center mb-4">
                  {section.icon}
                </div>
                <h3 className="text-lg font-semibold text-center">
                  {section.title}
                </h3>
              </div>

              {/* Contenido de la Card */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-6 text-center">
                  {section.description}
                </p>

                {/* Botones de Acción */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleAddNew(section.urlForm)}
                    className={`w-full ${section.color} ${section.hoverColor} text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Dar de Alta</span>
                  </button>

                  <button
                    onClick={() => handleViewRecords(section.urlTable)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Ver Registros</span>
                  </button>
                </div>

                {/* Información adicional (placeholder para futuras totalizaciones) */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-400">--</span>
                    <p className="text-xs text-gray-400 mt-1">
                      Total (próximamente)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de resumen rápido */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Resumen Rápido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400 mb-2">--</div>
              <div className="text-sm text-gray-600">Total Ingresos</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400 mb-2">--</div>
              <div className="text-sm text-gray-600">Total Egresos</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400 mb-2">--</div>
              <div className="text-sm text-gray-600">Balance</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400 mb-2">--</div>
              <div className="text-sm text-gray-600">Rollos Stock</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};