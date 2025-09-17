import React from 'react'
import heroImg from '../../assets/MainPhoto.png';

export const HeroSection = () => {
  return (
    <section className="flex justify-center">
        <div className="w-3/4 lg:h-[640px] bg-cover bg-center overflow-hidden">
          <img 
            src={heroImg}
            alt="Gestión optimizada para aserraderos - SistemaQuo"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
  )
}
