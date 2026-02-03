import React, { useEffect, useState } from 'react';
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
import { useUsuario } from '../hooks/useUsuario';
import { useMemo } from 'react';
import axios from 'axios';
import { obtenerFechaActual } from '../hooks/obtenerFechaActual';
import { DashboardCard } from '../components/DashboardCard.jsx';


export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;
  const fechaActual = obtenerFechaActual();

  const [totales, setTotales] = useState({
    ingresos: 0,
    egresos: 0,
    totalIngresosMensual: 0,
    totalEgresosMensual: 0,
    // aquí se irán sumando dinámicamente
  });

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
      requiredPermissions: ['ROLE_ADMIN', 'ROLE_ROLLOS'],
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
      requiredPermissions: ['ROLE_ADMIN', 'ROLE_INGRESO_FUTURO'],
    },
    {
      id: 'bancos',
      title: 'Bancos',
      icon: <Building2 className="h-8 w-8" />,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      description: 'Gestión de cuentas bancarias y movimientos',
      urlForm: '/bancos',
      urlTable: '/visualizar-bancos',
      requiredPermissions: ['ROLE_ADMIN', 'ROLE_BANCOS'],
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
      requiredPermissions: ['ROLE_ADMIN', 'ROLE_BANCOS'],
    },
    {
      id: 'historial-bancario-diario',
      title: 'Historial Bancario Diario',
      icon: <History className="h-8 w-8" />,
      color: 'bg-cyan-600',
      hoverColor: 'hover:bg-cyan-700',
      description: 'Visualiza el historial de movimientos de todas las cuentas bancarias.',
      urlForm: '/historial-bancario',
      urlTable: '/visualizar-historial-bancario',
      requiredPermissions: ['ROLE_ADMIN', 'ROLE_BANCOS'],
    },
    {
      id: 'ingresos',
      title: 'Ingresos',
      icon: <ArrowUpCircle className="h-8 w-8" />,
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
      description: 'Registro y control de todos los ingresos',
      urlForm: '/ingresos',
      urlTable: '/visualizar-ingresos',
      requiredPermissions: ['ROLE_ADMIN', 'ROLE_INGRESOS'],
    },
    {
      id: 'egresos',
      title: 'Egresos',
      icon: <ArrowDownCircle className="h-8 w-8" />,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      description: 'Registro y control de todos los gastos',
      urlForm: '/egresos',
      urlTable: '/visualizar-egresos',
      requiredPermissions: ['ROLE_ADMIN', 'ROLE_EGRESOS'],
    },
    {
      id: 'egresos-futuros',
      title: 'Egresos Futuros',
      icon: <TrendingDown className="h-8 w-8" />,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      description: 'Planificación y proyección de gastos',
      urlForm: '/egresos-futuros',
      urlTable: '/visualizar-egresos-futuros',
      requiredPermissions: ['ROLE_ADMIN', 'ROLE_EGRESO_FUTURO'],
    },
    {
      id: 'retiro-socios',
      title: 'Retiro de Socios',
      icon: <Users className="h-8 w-8" />,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      description: 'Gestión de retiros y distribuciones',
      urlForm: '/retiro-socios',
      urlTable: '/visualizar-retiro-socios',
      requiredPermissions: ['ROLE_ADMIN', 'ROLE_RETIRO_SOCIO'],
    }
  ];

  //UseEffect para obtener datos iniciales de totales
  useEffect(() => {
    //Obtengo el monto total de ingresos del día actual
    const fetchTotales = async () => {
      try {
        //Definimos las promesas para los totales
        const [resIngresos, resEgresos, resIngresosMensual, resEgresosMensual] = await Promise.all([
          axios.get(`${apiUrl}/ingreso/obtenerAcumulado/${fechaActual}`),
          axios.get(`${apiUrl}/egreso/obtenerAcumulado/${fechaActual}`),
          axios.get(`${apiUrl}/ingreso/obtenerAcumuladoMensual/${fechaActual}`),
          axios.get(`${apiUrl}/egreso/obtenerAcumuladoMensual/${fechaActual}`),
        ]);

        setTotales(prev => ({
          ...prev,
          ingresos: resIngresos.data,
          egresos: resEgresos.data,
          totalIngresosMensual: resIngresosMensual.data,
          totalEgresosMensual: resEgresosMensual.data,
        }));
      } catch (err) {
        console.error("Error fetching endpoint:", err);
      }
    };

    fetchTotales();
  }, []);

  // Hook personalizado para obtener el usuario
  const { usuario } = useUsuario();

  // 1. Array de Permisos del Usuario
  const userPermissions = useMemo(() => {
    // Retorna un array vacío si usuario o rol no existen
    if (!usuario?.rol) return [];
    const permissionsArray = usuario.rol.split(',').map(p => p.trim().toUpperCase());
    return permissionsArray;
  }, [usuario]);


  const handleAddNew = (itemUrl) => {
    navigate(itemUrl);
  };

  const handleViewRecords = (itemUrl) => {
    navigate(itemUrl);
  };

  // 2. LÓGICA DE FILTRADO
  const filteredSections = dashboardSections.filter(section => {

    // Verifica si la sección tiene el array de permisos definido. Si no, la ocultamos.
    if (!section.requiredPermissions || section.requiredPermissions.length === 0) {
      console.log(`[${section.id}]: ERROR - requiredPermissions no definido. Resultado: ❌ OCULTAR`);
      return false;
    }

    // Usamos .some() para ver si AL MENOS UNO de los permisos requeridos 
    // está incluido en el array de permisos del usuario (userPermissions).
    const hasPermission = section.requiredPermissions.some(requiredPerm =>
      userPermissions.includes(requiredPerm)
    );
    return hasPermission;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header del Dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-500">Dashboard</h1>
            </div>
            <div>
              {/* Verificamos si el usuario tiene el rol de administrador */}
              {userPermissions.includes('ROLE_ADMIN') && (
                <button
                  className="border-2 rounded-md px-4 py-2 text-blue-500 font-bold hover:bg-blue-500 hover:text-gray-100"
                  onClick={() => navigate('/admin-dashboard')}
                >
                  Reportes
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid de Secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredSections.map((section) => (
            <DashboardCard
              key={section.id}
              section={section}
              total={totales[section.id]}
              onAddNew={handleAddNew}
              onViewRecords={handleViewRecords}
            />
          ))}
        </div>

        {/* Sección de resumen rápido */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Resumen Rápido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400 mb-2">$ {totales.totalIngresosMensual !== undefined ? totales.totalIngresosMensual.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : "--"}</div>
              <div className="text-sm text-gray-600">Total Ingresos / Mes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400 mb-2">$ {totales.totalEgresosMensual !== undefined ? totales.totalEgresosMensual.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : "--"}</div>
              <div className="text-sm text-gray-600">Total Egresos / Mes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400 mb-2">$ {totales.totalIngresosMensual !== undefined && totales.totalEgresosMensual !== undefined ? (totales.totalIngresosMensual - totales.totalEgresosMensual).toLocaleString('es-AR', { minimumFractionDigits: 2 }) : "--"}</div>
              <div className="text-sm text-gray-600">Balance / Mes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400 mb-2">--</div>
              <div className="text-sm text-gray-600">Rollos Stock</div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};