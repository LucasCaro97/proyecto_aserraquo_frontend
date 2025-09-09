import React from 'react'

export const HeroSection = () => {
  return (
    <section className="flex justify-center">
        <div className="w-screen lg:h-[640px] bg-cover bg-center overflow-hidden">
          <img 
            src="src/assets/MainPhoto.png" 
            alt="Gestión optimizada para aserraderos - SistemaQuo"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
  )
}
