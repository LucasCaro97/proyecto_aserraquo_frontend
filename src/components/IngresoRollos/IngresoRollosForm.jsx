import React from 'react';
import { Scale, ListPlus, Save, Plus, FileText, Calendar } from 'lucide-react';
import { obtenerDiaDeLaSemana } from '../../hooks/obtenerDiaDeLaSemana';

export const IngresoRollosForm = ({ 
    formData, 
    setFormData, 
    tiposProducto, 
    registrosDiarios, // registrosDisponibles desde useRegistrosFinancieros
    onSubmit, 
    onCancel, 
    isLoading,
    isEdit = false,
    // Nuevas props necesarias para la lógica del botón Plus
    isLoadingRegistros = false,
    setMostrarModalRegistro,
    isCreatingRegistro = false
}) => {

    // Función auxiliar para el formato de fecha en el option
    const formatearFecha = (fechaString) => {
        if (!fechaString) return "";
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Campo Peso */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peso (tn) *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Scale className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.peso}
                            onChange={(e) => setFormData({...formData, peso: e.target.value})}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Campo Tipo de Producto */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Producto *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ListPlus className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            value={formData.idTipoProducto}
                            onChange={(e) => setFormData({...formData, idTipoProducto: e.target.value})}
                            className="block w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            required
                        >
                            <option value="">Seleccione producto</option>
                            {tiposProducto.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                    </div>
                </div>

                {/* Campo Registro Financiero Diario (REEMPLAZADO) */}
                <div className="md:col-span-2">
                    <label htmlFor="registroFinanciero" className="block text-sm font-medium text-gray-700 mb-2">
                        Registro Financiero Diario *
                    </label>
                    <div className="flex space-x-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                id="registroFinanciero"
                                value={formData.idRegistroDiario}
                                onChange={(e) => setFormData({...formData, idRegistroDiario: e.target.value})}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                                required
                                disabled={isLoadingRegistros}
                            >
                                <option value="">
                                    {isLoadingRegistros ? 'Cargando registros...' : `Seleccione un registro financiero`}
                                </option>
                                {registrosDiarios.map((registro) => (
                                    <option key={registro.id} value={registro.id}>
                                        {/* Uso de obtenerDiaDeLaSemana del hook subido */}
                                        {`${obtenerDiaDeLaSemana(registro.fecha)}  ${formatearFecha(registro.fecha)}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Botón Plus para crear registro */}
                        <button
                            type="button"
                            onClick={() => setMostrarModalRegistro(true)}
                            disabled={isLoadingRegistros || isCreatingRegistro}
                            className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                isLoadingRegistros || isCreatingRegistro
                                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            title="Crear nuevo registro financiero"
                        >
                            {isCreatingRegistro ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <Plus className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Campo Observación */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observación</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={formData.observacion}
                            onChange={(e) => setFormData({...formData, observacion: e.target.value})}
                            className="block w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Detalles del rollo..."
                        />
                    </div>
                </div>
            </div>

            <div className="flex space-x-4 pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                    {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Save className="h-5 w-5" /> <span>{isEdit ? 'Actualizar' : 'Guardar'}</span></>}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default IngresoRollosForm;