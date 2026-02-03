import React from 'react';
import { Plus, Eye } from 'lucide-react';

export const DashboardCard = ({ section, total, onAddNew, onViewRecords }) => {
  return (
    <div
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
            onClick={() => onAddNew(section.urlForm)}
            className={`w-full ${section.color} ${section.hoverColor} text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2`}
          >
            <Plus className="h-4 w-4" />
            <span>Dar de Alta</span>
          </button>

          <button
            onClick={() => onViewRecords(section.urlTable)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Ver Registros</span>
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-800">
              {total !== undefined
                ? `$ ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                : "--"}
            </span>
            <p className="text-xs text-gray-400 mt-1">
              Total Acumulado Hoy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

