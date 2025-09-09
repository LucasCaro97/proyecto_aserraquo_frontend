import React from 'react'
import { Lightbulb, CheckCircle, Clock } from 'lucide-react';

export const FeatureSection = () => {
  const features = [
      {
        icon: <Lightbulb className="h-12 w-12 text-white" />,
        title: "SIMPLIFICA.",
        description: "Sistema de gestión web y app para aserraderos administrado por un equipo interdisciplinario.",
        bgColor: "bg-blue-500"
      },
      {
        icon: <CheckCircle className="h-12 w-12 text-white" />,
        title: "OPTIMIZA.",
        description: "Sistema de gestión web y app para aserraderos administrado por un equipo interdisciplinario.",
        bgColor: "bg-sky-400"
      },
      {
        icon: <Clock className="h-12 w-12 text-white" />,
        title: "AHORRA.",
        description: "Sistema de gestión web y app para aserraderos administrado por un equipo interdisciplinario.",
        bgColor: "bg-gray-400"
      }
    ];
  
    return (
    <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                {/* Icono circular */}
                <div className={`${feature.bgColor} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6`}>
                  {feature.icon}
                </div>
                
                {/* Título */}
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                
                {/* Descripción */}
                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
  )
}
