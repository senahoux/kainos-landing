import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import DiagnosisSection from './components/DiagnosisSection'
import BridgeSection from './components/BridgeSection'
import SolutionSection from './components/SolutionSection'
import FounderSection from './components/FounderSection'
import PriceOfAddictionSection from './components/PriceOfAddictionSection'
import PricingSection from './components/PricingSection'
import SocialProofSection from './components/SocialProofSection'
import FAQSection from './components/FAQSection'
import Footer from './components/Footer'
import SuccessPage from './pages/SuccessPage'
import CancelPage from './pages/CancelPage'
import TopVideoSection from './components/TopVideoSection'

// Landing page – all sections visible immediately, no video gating
function LandingLayout() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>
        <TopVideoSection />
        <HeroSection />
        <DiagnosisSection />
        <BridgeSection />
        <SolutionSection />
        <PriceOfAddictionSection />
        <PricingSection />
        <SocialProofSection />
        <FounderSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingLayout />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
