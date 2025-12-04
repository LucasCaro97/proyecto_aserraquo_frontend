import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  Upload,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import CrearBancoTerceroModal from '../components/CrearBancoTercerosModal';


const TIPO_CHEQUE = {
  EMITIDO: 'EMITIDO',
  RECIBIDO: 'RECIBIDO'
};
// ... (rest of ESTADO_CHEQUE, ESTADOS_EMITIDO, ESTADOS_RECIBIDO, CATEGORIA_CHEQUE, emptyStringToNull)

const ESTADO_CHEQUE = {
  PENDIENTE: 'PENDIENTE',
  ENTREGADO: 'ENTREGADO',
  DEPOSITADO: 'DEPOSITADO',
  COBRADO: 'COBRADO',
  RECHAZADO: 'RECHAZADO',
  ANULADO: 'ANULADO'
};

// Estados para Cheques EMITIDOS (Egreso)
const ESTADOS_EMITIDO = [
  ESTADO_CHEQUE.ENTREGADO, // Estado inicial
  ESTADO_CHEQUE.COBRADO,
  ESTADO_CHEQUE.RECHAZADO,
  ESTADO_CHEQUE.ANULADO
];

// Estados para Cheques RECIBIDOS (Ingreso)
const ESTADOS_RECIBIDO = [
  ESTADO_CHEQUE.PENDIENTE, // Estado inicial
  ESTADO_CHEQUE.DEPOSITADO,
  ESTADO_CHEQUE.RECHAZADO,
  ESTADO_CHEQUE.ANULADO
];

const CATEGORIA_CHEQUE = {
  FISICO: 'FISICO',
  ELECTRONICO: 'ELECTRONICO'
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
  const [isImportVisible, setIsImportVisible] = useState(false);
  const [isEmitidoImportVisible, setIsEmitidoImportVisible] = useState(false);

  // 💡 NUEVO ESTADO: Para manejar el archivo de Excel
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingImport, setLoadingImport] = useState(false); // Indicador de carga para la importación

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBancosTerceros = async () => {
    try {
      const responseBancos = await axios.get(`${apiUrl}/banco-terceros`);
      setBancosTerceros(responseBancos.data);
      return true; // Éxito
    } catch (err) {
      console.error("Error al cargar bancos de terceros:", err);
      return false; // Fallo
    }
  };

  const handleNewBancoSuccess = () => {
    setIsModalOpen(false); // 1. Cerrar el modal
    fetchBancosTerceros(); // 2. Refrescar la lista de bancos
  };

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
    categoriaCheque: CATEGORIA_CHEQUE.FISICO,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { chequeId } = useParams();
  const isViewing = !!chequeId;
  const [loadingCheque, setLoadingCheque] = useState(isViewing); // Solo carga si es modo visualización

  // ... (useEffect para la lógica de estado inicial)

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
        // Realizamos las peticiones en paralelo
        await Promise.all([
          // 1. Fetch Cuentas Bancarias Propias
          axios.get(`${apiUrl}/banco`).then(res => setCuentasPropias(res.data)),
          // 2. Fetch Bancos de Terceros (usando la nueva función)
          fetchBancosTerceros(),
        ]);

        setError(null);
      } catch (err) {
        // ... [manejo de error]
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, [apiUrl]);

  // ... (useEffect para fetchChequeDetails)
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

        // 💡 EXTRACCIÓN DE IDs DE OBJETOS RELACIONADOS
        // Si la API devuelve el objeto cuentaBancaria, extraemos su ID.
        const cuentaBancariaId = chequeData.cuentaBancaria ? chequeData.cuentaBancaria.id : '';
        // Hacemos lo mismo para bancoTerceros
        const bancoTercerosId = chequeData.bancoTerceros ? chequeData.bancoTerceros.id : '';


        // 3. Mapear los datos al estado formData
        setFormData({
          tipoChequeNombre: chequeData.tipoCheque,
          monto: chequeData.monto.toString(), // Convertir a string para input type="number"
          numeroCheque: chequeData.numeroCheque,
          fechaEmision: chequeData.fechaEmision.split('T')[0], // Limpiar timestamp si viene de la API
          fechaCobro: chequeData.fechaCobro.split('T')[0], // Limpiar timestamp si viene de la API
          terceroNombre: chequeData.terceroNombre,
          bancoTercerosId: bancoTercerosId || '',
          cuentaBancariaId: cuentaBancariaId || '',
          estadoChequeNombre: chequeData.estadoCheque,
          categoriaCheque: chequeData.categoriaCheque
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
    const { name, value } = e.target;

    // 💡 MODIFICACION: Permitir cambios SIEMPRE si NO estamos viendo (modo creación)
    // o si estamos viendo PERO el campo es 'estadoChequeNombre' (modo actualización de estado).
    const isStateUpdateInViewMode = isViewing && name === 'estadoChequeNombre';
    const isCreationMode = !isViewing;

    const isEditingAllowed =
      !isViewing ||
      (isViewing && name !== 'tipoChequeNombre'); // Permitido si es cualquier campo menos 'tipoChequeNombre'

    if (isEditingAllowed) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    // 💡 NUEVO HANDLER: Captura el archivo seleccionado
    const file = e.target.files[0];
    setSelectedFile(file);
    // Limpiar mensajes de error/éxito del formulario principal
    setError(null);
    setSuccess(null);
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Debe seleccionar un archivo Excel para importar.");
      return;
    }

    // 💡 IMPORTANTE: Resetear los estados de feedback
    setError(null);
    setSuccess(null);
    setLoadingImport(true);

    const data = new FormData();
    // La clave 'file' debe coincidir con @RequestParam("file") del backend
    data.append('file', selectedFile);

    try {
      const url = `${apiUrl}${importUrl}`;

      // 💡 LLAMADA POST con el objeto FormData. Axios automáticamente configura el 
      // Content-Type a multipart/form-data.
      const response = await axios.post(url, data, {
        headers: {
          // No es necesario definir 'Content-Type', Axios lo hace por el FormData.
        }
      });

      setSuccess(`¡Importación exitosa! Se han creado ${response.data.length} nuevos cheques.`);
      // Opcional: limpiar el input de archivo
      setSelectedFile(null);
      document.getElementById('excelFile').value = '';

    } catch (err) {
      let errorMessage = "Error desconocido al procesar la importación.";

      if (err.response) {
        // Error de negocio o validación del backend
        // 1. Verificar si la API envió un cuerpo de error JSON
        const errorData = err.response.data;

        // 2. Intentar acceder a la propiedad específica "errorMessage"
        if (errorData && errorData.errorMessage)
          errorMessage = `Error de Importación (${errorData.errorCode}): ${errorData.errorMessage}`;

        // 3. Si no hay "errorMessage", usar el mensaje HTTP o uno genérico
      } else if (err.response.status) {
        errorMessage = `Error ${errorData.errorCode}: No se pudo completar la importación. Verifique el formato del archivo.`;
      }

      setError(errorMessage);

    } finally {
      setLoadingImport(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 💡 IMPORTANTE: Si estamos en modo visualización, y solo se cambia el estado, 
    // y no hay otros campos obligatorios que validar, esta validación de campos 
    // requeridos se puede simplificar, pero la dejamos por seguridad.

    setError(null);
    setSuccess(null);


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

    // 1. REGLA DE NEGOCIO: Validar fechas para evitar que la fecha de recepción (emision) sea muy posterior a la fecha de cobro.
    const fechaEmision = new Date(formData.fechaEmision); // Fecha de Carga
    const fechaCobro = new Date(formData.fechaCobro);       // Fecha de Vencimiento

    if (formData.fechaEmision && formData.fechaCobro) {
      const fechaLimitePosterior = new Date(fechaCobro);
      // Sumamos 30 días a la fecha de cobro/vencimiento
      fechaLimitePosterior.setDate(fechaCobro.getDate() + 30);

      // Validación 1: Fecha de cobro no anterior a la fecha de emisión (Carga)
      if (fechaCobro < fechaEmision) {
        setError("La Fecha de Cobro/Vencimiento no puede ser anterior a la Fecha de Recepción (Fecha de Carga).");
        return;
      }

      // Validación 2: Fecha de recepción (Carga) no puede ser más de 30 días posterior a la de cobro.
      if (fechaEmision > fechaLimitePosterior) {
        setError("La Fecha de Recepción (Carga) no puede ser mayor a 30 días posteriores a la Fecha de Cobro/Vencimiento.");
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
      categoriaCheque: formData.categoriaCheque,

      // 💡 APLICACIÓN DE LA LIMPIEZA:
      bancoTercerosId: emptyStringToNull(formData.bancoTercerosId),
      cuentaBancariaId: emptyStringToNull(formData.cuentaBancariaId),
    };

    // 3. LLAMADA POST A LA API USANDO AXIOS
    try {
      let response;
      let url = `${apiUrl}/cheques`;

      if (isViewing) {
        // MODO ACTUALIZACIÓN (PUT): El ID va en la URL.
        url = `${apiUrl}/cheques/${chequeId}`;
        response = await axios.put(url, chequeData);
        setSuccess(`Cheque #${response.data.numeroCheque} (ID: ${response.data.id}) actualizado con éxito.`);
        return;

      } else {
        // MODO CREACIÓN (POST)
        response = await axios.post(url, chequeData);
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
          categoriaCheque: CATEGORIA_CHEQUE.FISICO,
        });
      }

    } catch (err) {
      if (err.response || err.request) {
        // Asumiendo que el backend envía un error en el cuerpo
        const detail = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Error interno del servidor al guardar el cheque.";
        setError(`Error: ${detail}. Por favor, contacte a soporte.`);
      } else {
        // Errores de JavaScript/código local
        setError("Ocurrió un error inesperado en la aplicación.");
      }
    }
    // Se elimina el setSuccess duplicado
  };

  const isRecibido = formData.tipoChequeNombre === TIPO_CHEQUE.RECIBIDO;
  const isFormLoading = loading || loadingCheque; // 💡 Indicador global de carga
  const tituloFormulario = formData.tipoChequeNombre === TIPO_CHEQUE.EMITIDO
    ? 'Importar Cheques Emitidos Propios'
    : 'Importar Cheques Recibidos de Terceros';

  const ENDPOINTS = {
    RECIBIDO: '/cheques/importar-excel', // Mantener el actual (asumido)
    EMITIDO: '/cheques/importar-excel-cheques-propios',    // Nuevo endpoint
  };

  const importUrl = formData.tipoChequeNombre === TIPO_CHEQUE.EMITIDO
    ? ENDPOINTS.EMITIDO
    : ENDPOINTS.RECIBIDO; // O el endpoint original si es el caso


  // Pantalla de Carga
  if (isFormLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg text-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin inline-block mr-2" />
        <p className="text-gray-600">Cargando datos del cheque y dependencias...</p>
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

      {/* 💡 NUEVA SECCIÓN: Importación de Cheques desde Excel (Solo en modo CREACIÓN y CON PLEGADO) */}
      {!isViewing && (
        <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden">

          {/* TÍTULO Y BOTÓN DE TOGGLE */}
          <button
            type="button"
            onClick={() => setIsImportVisible(p => !p)}
            className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center text-lg font-semibold text-gray-800"
            aria-expanded={isImportVisible}
          >
            <span className="flex items-center">
              <Upload className="w-5 h-5 mr-3 text-blue-600" /> {tituloFormulario}
            </span>
            {isImportVisible ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {/* CONTENIDO PLEGABLE */}
          {isImportVisible && (
            <div className="p-4 bg-white">
              <form onSubmit={handleImportExcel} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="file"
                  id="excelFile"
                  name="file"
                  accept=".xls, .xlsx"
                  onChange={handleFileChange}
                  className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 border border-gray-300 rounded-md p-1"
                  disabled={loadingImport}
                />
                <button
                  type="submit"
                  disabled={!selectedFile || loadingImport}
                  className="py-2 px-6 rounded-md shadow-sm text-sm font-medium text-white transition-colors 
                            flex items-center justify-center 
                            bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400"
                >
                  {loadingImport ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    'Procesar Excel'
                  )}
                </button>
              </form>
              <p className="mt-2 text-sm text-gray-600">
                Asegúrese de que el archivo tenga el formato de columnas correcto.
              </p>
            </div>
          )}
        </div>
      )}
      {/* 💡 FIN NUEVA SECCIÓN PLEGABLE */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... (el resto del formulario existente para la carga individual) ... */}
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
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${isViewing ? 'bg-gray-100 text-gray-800' : ''}`}
            />
          </div>

          {/* Fecha de Recepcion */}
          <div>
            <label htmlFor="fechaEmision" className="block text-sm font-medium text-gray-700">{formData.tipoChequeNombre === TIPO_CHEQUE.EMITIDO
              ? 'Fecha de emisión'
              : 'Fecha de recepción'} *</label>
            <input
              type="date"
              name="fechaEmision"
              id="fechaEmision"
              value={formData.fechaEmision}
              onChange={handleChange}
              required={!isViewing}
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

              {/* 💡 MODIFICACION: Contenedor flex para el select y el botón */}
              <div className="mt-1 flex space-x-2">

                {/* 1. SELECT (Ocupa todo el espacio disponible) */}
                <select
                  name="bancoTercerosId"
                  id="bancoTercerosId"
                  value={formData.bancoTercerosId}
                  onChange={handleChange}
                  required={isRecibido && !isViewing}
                  // Nota: Se elimina w-full del select y se deja que flex lo maneje, 
                  // pero se asegura que crezca con 'w-full' o 'flex-grow'
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white ${isViewing ? 'bg-gray-100 text-gray-800 opacity-80' : ''}`}
                >
                  <option value="">-- Seleccione un banco tercero --</option>
                  {bancosTerceros.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.nombre}
                    </option>
                  ))}
                </select>

                {/* 2. NUEVO BOTÓN para abrir el modal */}
                <button
                  type="button"
                  // 💡 LLAMADA AL ESTADO para abrir el modal
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                  title="Crear nuevo Banco de Terceros"
                >
                  {/* Asumiendo que CreditCard ya está importado de 'lucide-react' */}
                  <CreditCard size={18} />
                </button>
              </div>
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
            <label htmlFor="categoriaCheque" className="block text-sm font-medium text-gray-700">Categoría del Cheque *</label>
            <select
              name="categoriaCheque"
              id="categoriaCheque"
              value={formData.categoriaCheque}
              onChange={handleChange}
              required={!isViewing}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white ${isViewing ? 'bg-gray-100 text-gray-800 opacity-80' : ''}`}
            >
              <option value="">Elegir una categoría</option>
              <option value={CATEGORIA_CHEQUE.FISICO}>Físico</option>
              <option value={CATEGORIA_CHEQUE.ELECTRONICO}>Electrónico</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Define si es un cheque tradicional o digital (E-Cheq).
            </p>
          </div>

          <div>
            <label htmlFor="estadoChequeNombre" className="block text-sm font-medium text-gray-700">Estado *</label>

            {/* 💡 LÓGICA DE VISUALIZACIÓN/EDICIÓN DEL SELECT DE ESTADO */}
            {isViewing ? (
              // 1. MODO VISUALIZACIÓN (isViewing=true): Permitir edición del estado
              <select
                name="estadoChequeNombre"
                id="estadoChequeNombre"
                value={formData.estadoChequeNombre}
                onChange={handleChange} // Permite cambiar el estado
                required={true}
                disabled={false} // ¡IMPORTANTE! No deshabilitado en modo visualización
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white`}
              >
                {(isRecibido ? ESTADOS_RECIBIDO : ESTADOS_EMITIDO).map(estado => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            ) : (
              // 2. MODO CREACIÓN (isViewing=false): Mostrar el estado inicial asignado, no editable
              <input
                type="text"
                value={formData.estadoChequeNombre}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100 text-gray-800"
              />
            )}

            {/* 💡 ADICIÓN: Mensaje de advertencia condicional */}
            {isViewing && (
              (formData.estadoChequeNombre === ESTADO_CHEQUE.DEPOSITADO ||
                formData.estadoChequeNombre === ESTADO_CHEQUE.COBRADO)
            ) ? (
              <p className="mt-1 text-sm font-semibold text-red-600">
                Al guardar el registro se **{isRecibido ? 'sumará' : 'restará'}** del flujo de caja diario.
              </p>
            ) : (
              // Mensaje de ayuda por defecto o en modo creación
              <p className="mt-1 text-xs text-gray-500">
                {isViewing ? 'Puede actualizar el estado del cheque aquí.' : isRecibido ? 'Inicia como PENDIENTE.' : 'Inicia como ENTREGADO.'}
              </p>
            )}
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

          {/* 💡 MODIFICACION: Botón único de envío. Muestra Actualizar o Guardar. */}
          <button
            type="submit"
            disabled={loadingImport} // Deshabilitado si la importación está en curso
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {isViewing ? 'Actualizar Cheque' : 'Guardar Cheque'}
          </button>
        </div>
      </form>

      <CrearBancoTerceroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleNewBancoSuccess} // Refresca la lista y cierra el modal
      />

    </div>

  );
};