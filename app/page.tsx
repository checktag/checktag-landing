import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Partners from './components/Partners'
import HowItWorks from './components/HowItWorks'
import Testimonials from './components/Testimonials'
import Pricing from './components/Pricing'
import Faq from './components/Faq'
import Footer from './components/Footer'

const page = () => {
  return (
    <div className='w-screen h-screen overflow-x-hidden bg-white'>
      <Navbar />
      <Hero />
      <Partners />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Faq />
      <Footer />
    </div>
  )
}

export default page