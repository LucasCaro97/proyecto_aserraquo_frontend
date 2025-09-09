import React from 'react'
import { HeroSection } from '../components/HomePage/HeroSection'
import { FeatureSection } from '../components/HomePage/FeatureSection'

export const HomePage = () => {
  return (
    <main className="bg-white">
      <HeroSection/>
      <FeatureSection/>
    </main>
  )
}
