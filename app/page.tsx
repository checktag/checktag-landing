import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Partners from './components/Partners'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import Roadmap from './components/Roadmap'
import Testimonials from './components/Testimonials'
import Pricing from './components/Pricing'
import DownloadApp from './components/DownloadApp'
import Faq from './components/Faq'
import Footer from './components/Footer'

const page = () => {
  return (
    <div className='w-full min-h-screen overflow-x-hidden bg-[#020817] noise-bg'>
      <Navbar />
      <Hero />
      <Partners />
      <HowItWorks />
      <Features />
      <Roadmap />
      <Testimonials />
      <Pricing />
      <DownloadApp />
      <Faq />
      <Footer />
    </div>
  )
}

export default page