import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2 // 💡 MODIFICACION: Se añade para mostrar el estado de carga
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const TIPO_CHEQUE = {
  EMITIDO: 'EMITIDO',
  RECIBIDO: 'RECIBIDO'
};

const ESTADO_CHEQUE = {
  PENDIENTE: 'PENDIENTE',
  ENTREGADO: 'ENTREGADO',
  DEPOSITADO: 'DEPOSITADO',
  COBRADO: 'COBRADO',
  RECHAZADO: 'RECHAZADO',
  ANULADO: 'ANULADO'
};

// Función utilitaria para convertir cadenas vacías a null
const emptyStringToNull = (value) => {
    return value === '' ? null : value;
};

export const ChequesForm = () => {
  const navigate = useNavigate();
  const [cuentasPropias, setCuentasPropias] = useState([]);
  const [bancosTerceros, setBancosTerceros] = useState([]);
  const [loading, setLoading] = useState(true); // Indicador de carga de dependencias
   
  
  const apiUrl = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    tipoChequeNombre: TIPO_CHEQUE.RECIBIDO, // Valor inicial
    monto: '',
    numeroCheque: '',
    fechaEmision: '',
    fechaCobro: '',
    terceroNombre: '',
    bancoTercerosId: '',
    cuentaBancariaId: '',
    estadoChequeNombre: ESTADO_CHEQUE.PENDIENTE,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { chequeId } = useParams();
  const isViewing = !!chequeId;
  const [loadingCheque, setLoadingCheque] = useState(isViewing); // Solo carga si es modo visualización

  // 💡 REGLA DE NEGOCIO: Establecer el estado inicial según el TipoCheque
  useEffect(() => {
    // 💡 MODIFICACION: Si estamos en modo visualización, no ejecutar la lógica de cambio de estado inicial
    if (isViewing) return; 

    if (formData.tipoChequeNombre === TIPO_CHEQUE.RECIBIDO) {
      // Cheque recibido: inicia como PENDIENTE
      setFormData(prev => ({
        ...prev,
        estadoChequeNombre: ESTADO_CHEQUE.PENDIENTE
      }));
    } else if (formData.tipoChequeNombre === TIPO_CHEQUE.EMITIDO) {
      // Cheque emitido: inicia como ENTREGADO
      setFormData(prev => ({
        ...prev,
        estadoChequeNombre: ESTADO_CHEQUE.ENTREGADO
      }));
    }
    // Limpiar IDs de bancos/cuentas al cambiar el tipo para evitar errores
    setFormData(prev => ({
      ...prev,
      bancoTercerosId: '',
      cuentaBancariaId: ''
    }));
  }, [formData.tipoChequeNombre, isViewing]); // 💡 Dependencia 'isViewing' añadida


  // 💡 NUEVO useEffect para la carga de datos (GET API con Axios)
  useEffect(() => {
    const fetchDependencies = async () => {
      setLoading(true);
      try {
        // Realizamos las peticiones en paralelo para optimizar la carga
        const [responseCuentas, responseBancos] = await Promise.all([
          // 1. Fetch Cuentas Bancarias Propias
          axios.get(`${apiUrl}/banco`),
          // 2. Fetch Bancos de Terceros
          axios.get(`${apiUrl}/banco-terceros`),
        ]);

        // Axios devuelve los datos directamente en la propiedad 'data'
        setCuentasPropias(responseCuentas.data);
        setBancosTerceros(responseBancos.data);

        setError(null); // Limpiamos cualquier error previo
      } catch (err) {
        console.error("Error al cargar dependencias:", err);
        // Usamos el mensaje de error de Axios o un mensaje genérico
        const errorMessage = err.response
          ? `Error ${err.response.status}: ${err.response.data.message || 'Fallo de la API.'}`
          : 'Error de red o conexión al cargar datos.';

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, [apiUrl]);

  useEffect(() => {
    // 1. Verificación del modo: Solo se ejecuta si tenemos un ID
    if (!chequeId) {
        setLoadingCheque(false); // No hay nada que cargar
        return;
    }

    const fetchChequeDetails = async () => {
        setLoadingCheque(true);
        setError(null);
        try {
            // 2. Llamada GET a la API con el ID
            const response = await axios.get(`${apiUrl}/cheques/${chequeId}`); 
            const chequeData = response.data;
            
            // 3. Mapear los datos al estado formData
            setFormData({
                tipoChequeNombre: chequeData.tipoCheque,
                monto: chequeData.monto.toString(), // Convertir a string para input type="number"
                numeroCheque: chequeData.numeroCheque,
                fechaEmision: chequeData.fechaEmision.split('T')[0], // Limpiar timestamp si viene de la API
                fechaCobro: chequeData.fechaCobro.split('T')[0], // Limpiar timestamp si viene de la API
                terceroNombre: chequeData.terceroNombre,
                bancoTercerosId: chequeData.bancoTercerosId || '', 
                cuentaBancariaId: chequeData.cuentaBancariaId || '', 
                estadoChequeNombre: chequeData.estadoCheque,
            });

        } catch (err) {
            console.error(`Error al cargar cheque con ID ${chequeId}:`, err);
            const errorMessage = err.response
                ? `Error ${err.response.status}: No se pudo cargar el cheque. Puede que no exista.`
                : 'Error de red o conexión al servidor.';
            setError(errorMessage);
        } finally {
            setLoadingCheque(false);
        }
    };

    fetchChequeDetails();

  }, [chequeId, apiUrl, setError, setFormData]); // 💡 Dependencias añadidas


  const handleChange = (e) => {
    // 💡 MODIFICACION: Ignorar cambios si estamos en modo visualización
    if (isViewing) return; 

    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 💡 MODIFICACION: Bloquear el envío si estamos en modo visualización
    if (isViewing) return; 

    setError(null);
    setSuccess(null);

    // 💡 REGLA DE NEGOCIO: VALIDACIÓN DE CAMPOS CLAVE
    if (formData.tipoChequeNombre === TIPO_CHEQUE.RECIBIDO) {
      if (!formData.bancoTercerosId) {
        setError("Debe seleccionar el Banco de Terceros (Emisor) para un cheque RECIBIDO.");
        return;
      }
    } else if (formData.tipoChequeNombre === TIPO_CHEQUE.EMITIDO) {
      if (!formData.cuentaBancariaId) {
        setError("Debe seleccionar la Cuenta Bancaria Propia (Emisora) para un cheque EMITIDO.");
        return;
      }
    }

    // 2. CREACIÓN DEL DTO SIMPLIFICADA
        const chequeData = {
            monto: parseFloat(formData.monto), 
            numeroCheque: formData.numeroCheque,
            fechaEmision: formData.fechaEmision,
            fechaCobro: formData.fechaCobro,
            terceroNombre: formData.terceroNombre,
            tipoChequeNombre: formData.tipoChequeNombre,
            estadoChequeNombre: formData.estadoChequeNombre,
            
            // 💡 APLICACIÓN DE LA LIMPIEZA:
            bancoTercerosId: emptyStringToNull(formData.bancoTercerosId),
            cuentaBancariaId: emptyStringToNull(formData.cuentaBancariaId),
        };

        // 3. LLAMADA POST A LA API USANDO AXIOS
        try {
            const response = await axios.post(`${apiUrl}/cheques`, chequeData);
            
            // Éxito:
            setSuccess(`Cheque #${response.data.numeroCheque} registrado con éxito. ID: ${response.data.id}`);
            
            // Opcional: Limpiar el formulario o redirigir
            setFormData({
                // Resetear el formulario a sus valores por defecto
                tipoChequeNombre: TIPO_CHEQUE.RECIBIDO,
                monto: '',
                numeroCheque: '',
                fechaEmision: '',
                fechaCobro: '',
                terceroNombre: '',
                bancoTercerosId: '', 
                cuentaBancariaId: '',
                estadoChequeNombre: ESTADO_CHEQUE.PENDIENTE,
            });

        } catch (err) {
            console.error("Error al guardar cheque:", err);
            
            if (err.response || err.request) {
                setError("Error interno del servidor al guardar el cheque. Por favor, contacte a soporte.");
            } else {
                // Errores de JavaScript/código local
                setError("Ocurrió un error inesperado en la aplicación.");
            }
        }
    // Se elimina el setSuccess duplicado
  };

  const isRecibido = formData.tipoChequeNombre === TIPO_CHEQUE.RECIBIDO;
  const isFormLoading = loading || loadingCheque; // 💡 Indicador global de carga


  // Pantalla de Carga
  if (isFormLoading) {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin inline-block mr-2" />
            <p className="text-gray-600">Cargando datos del cheque y dependencias...</p>
        </div>
    );
  }

  // Pantalla de Error en Visualización
  if (isViewing && error) {
      return (
          <div className="max-w-4xl mx-auto p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <X className="w-5 h-5 mr-2" />
              Error al cargar el detalle del cheque: {error}
          </div>
      );
  }


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center space-x-4 mb-8 border-b pb-4">
        <CreditCard className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          {/* 💡 MODIFICACION: Título condicional */}
          {isViewing ? 'Detalle de Cheque' : 'Dar de Alta Cheque'} 
          {!isViewing && ` ${isRecibido ? '(RECIBIDO)' : '(EMITIDO)'}`}
        </h1>
      </div>

      {/* Mensajes de feedback */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center"><X className="w-5 h-5 mr-2" />{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      {/* 💡 MODIFICACION: El formulario solo se envía en modo CREACIÓN */}
      <form onSubmit={!isViewing ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">

        {/* Selector de Tipo de Cheque */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">Tipo de Cheque *</label>
            <div className="mt-1 flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, tipoChequeNombre: TIPO_CHEQUE.RECIBIDO }))}
                disabled={isViewing} // 💡 APLICACION: Botón deshabilitado
                className={`flex-1 flex justify-center items-center py-2 px-4 border rounded-lg text-sm font-medium transition-colors ${isRecibido ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } ${isViewing ? 'opacity-60 cursor-not-allowed' : ''}`} // 💡 Estilo visual para deshabilitado
              >
                <ArrowUpCircle className="w-5 h-5 mr-2" /> Recibido (Ingreso)
              </button>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, tipoChequeNombre: TIPO_CHEQUE.EMITIDO }))}
                disabled={isViewing} // 💡 APLICACION: Botón deshabilitado
                className={`flex-1 flex justify-center items-center py-2 px-4 border rounded-lg text-sm font-medium transition-colors ${!isRecibido ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } ${isViewing ? 'opacity-60 cursor-not-allowed' : ''}`} // 💡 Estilo visual para deshabilitado
              >
                <ArrowDownCircle className="w-5 h-5 mr-2" /> Emitido (Egreso)
              </button>
            </div>
          </div>

          {/* Monto */}
          <div>
            <label htmlFor="monto" className="block text-sm font-medium text-gray-700">Monto *</label>
            <input
              type="number"
              name="monto"
              id="monto"
              value={formData.monto}
              onChange={handleChange}
              required={!isViewing} // 💡 Solo requerido en modo creación
              min="0.01"
              step="0.01"
              placeholder="Ej: 150000.50"
              readOnly={isViewing} // 💡 APLICACION: Campo de solo lectura
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${isViewing ? 'bg-gray-100 text-gray-800' : ''}`} // 💡 Estilo visual para solo lectura
            />
          </div>
        </div>

        {/* Número y Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Número de Cheque */}
          <div>
            <label htmlFor="numeroCheque" className="block text-sm font-medium text-gray-700">Número de Cheque *</label>
            <input
              type="text"
              name="numeroCheque"
              id="numeroCheque"
              value={formData.numeroCheque}
              onChange={handleChange}
              required={!isViewing}
              placeholder="Ej: 123456"
              readOnly={isViewing} // 💡 APLICACION: Campo de solo lectura
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${isViewing ? 'bg-gray-100 text-gray-800' : ''}`}
            />
          </div>

          {/* Fecha de Emisión */}
          <div>
            <label htmlFor="fechaEmision" className="block text-sm font-medium text-gray-700">Fecha de Emisión *</label>
            <input
              type="date"
              name="fechaEmision"
              id="fechaEmision"
              value={formData.fechaEmision}
              onChange={handleChange}
              required={!isViewing}
              readOnly={isViewing} // 💡 APLICACION: Campo de solo lectura
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${isViewing ? 'bg-gray-100 text-gray-800' : ''}`}
            />
          </div>

          {/* Fecha de Cobro/Vencimiento */}
          <div>
            <label htmlFor="fechaCobro" className="block text-sm font-medium text-gray-700">Fecha de Cobro/Vencimiento *</label>
            <input
              type="date"
              name="fechaCobro"
              id="fechaCobro"
              value={formData.fechaCobro}
              onChange={handleChange}
              required={!isViewing}
              readOnly={isViewing} // 💡 APLICACION: Campo de solo lectura
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${isViewing ? 'bg-gray-100 text-gray-800' : ''}`}
            />
          </div>
        </div>

        {/* Terceros y Cuentas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Campo Condicional 1: Banco de Terceros (SOLO para RECIBIDOS) */}
          {isRecibido && (
            <div>
              <label htmlFor="bancoTercerosId" className="block text-sm font-medium text-gray-700">Banco de Terceros (Emisor) *</label>
              <select
                name="bancoTercerosId"
                id="bancoTercerosId"
                value={formData.bancoTercerosId}
                onChange={handleChange}
                required={isRecibido && !isViewing} // 💡 Solo requerido en modo creación
                disabled={isViewing} // 💡 APLICACION: Select deshabilitado
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white ${isViewing ? 'bg-gray-100 text-gray-800 opacity-80' : ''}`}
              >
                <option value="">-- Seleccione un banco tercero --</option>
                {bancosTerceros.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.nombre} 
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Banco que emite el cheque.
              </p>
            </div>
          )}

          {/* Campo Condicional 2: Cuenta Bancaria Propia (SOLO para EMITIDOS) */}
          {!isRecibido && (
            <div>
              <label htmlFor="cuentaBancariaId" className="block text-sm font-medium text-gray-700">Cuenta Bancaria Propia (Origen) *</label>
              <select
                name="cuentaBancariaId"
                id="cuentaBancariaId"
                value={formData.cuentaBancariaId}
                onChange={handleChange}
                required={!isRecibido && !isViewing} // 💡 Solo requerido en modo creación
                disabled={isViewing} // 💡 APLICACION: Select deshabilitado
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white ${isViewing ? 'bg-gray-100 text-gray-800 opacity-80' : ''}`}
              >
                <option value="">-- Seleccione tu cuenta --</option>
                {cuentasPropias.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Tu cuenta bancaria de donde saldrá el dinero.
              </p>
            </div>
          )}

          {/* Nombre del Tercero */}
          <div>
            <label htmlFor="terceroNombre" className="block text-sm font-medium text-gray-700">
              {isRecibido ? 'Nombre del Dador' : 'Nombre del Beneficiario'} *
            </label>
            <input
              type="text"
              name="terceroNombre"
              id="terceroNombre"
              value={formData.terceroNombre}
              onChange={handleChange}
              required={!isViewing}
              placeholder={isRecibido ? 'Empresa/Persona que entrega el cheque' : 'Empresa/Persona que recibe el cheque'}
              readOnly={isViewing} // 💡 APLICACION: Campo de solo lectura
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${isViewing ? 'bg-gray-100 text-gray-800' : ''}`}
            />
          </div>
        </div>

        {/* Campo de Estado (Informativo, se establece automáticamente) y ID del Cheque */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <input
              type="text"
              value={formData.estadoChequeNombre}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100 text-gray-800"
            />
            <p className="mt-1 text-xs text-gray-500">
              {isRecibido ? 'Inicia como PENDIENTE (Recibido y por cobrar).' : 'Inicia como ENTREGADO (Emitido y entregado al beneficiario).'}
            </p>
          </div>
          {/* ID del Cheque (Solo visible en modo visualización) */}
          {isViewing && (
              <div className='hidden'>
                <label className="block text-sm font-medium text-gray-700">ID del Cheque</label>
                <input
                    type="text"
                    value={chequeId}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100 text-gray-800"
                />
              </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/cheques/visualizar')}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            {isViewing ? 'Cerrar' : 'Cancelar'} {/* 💡 Texto condicional */}
          </button>
          
          {/* 💡 MODIFICACION: Solo mostrar el botón "Guardar" en modo CREACIÓN */}
          {!isViewing && (
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Guardar Cheque
            </button>
          )}
        </div>
      </form>
    </div>
  );
};