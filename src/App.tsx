import { useState, useEffect, useRef } from 'react'
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
import FAQSection from './components/FAQSection'
import Footer from './components/Footer'
import SuccessPage from './pages/SuccessPage'
import CancelPage from './pages/CancelPage'
import TopVideoSection from './components/TopVideoSection'
import { ArrowRight } from 'lucide-react'

function LandingLayout() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const lockedContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUnlocked) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isUnlocked]);

  const handleUnlock = () => {
    if (isUnlocked) return;
    setIsUnlocked(true);
    // Smooth scroll to CTA when it appears
    setTimeout(() => {
      document.getElementById('ctaAfterVideo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCTAClick = () => {
    // Scroll to the first section (Hero) or pricing if preferred
    lockedContentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>
        <TopVideoSection onUnlock={handleUnlock} />

        {isUnlocked && (
          <div
            id="ctaAfterVideo"
            className="flex flex-col items-center py-12 px-6 animate-fade-in"
          >
            <button
              onClick={handleCTAClick}
              className="group inline-flex items-center gap-3 px-10 py-6 rounded-full bg-orange-500 text-white font-black text-lg sm:text-xl tracking-wide hover:bg-orange-400 transition-all duration-300 glow-orange hover:scale-105 shadow-[0_0_50px_-10px_rgba(249,115,22,0.6)] cursor-pointer"
            >
              INICIAR TRANSFORMAÇÃO
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>
        )}

        <div
          id="lockedContent"
          className={`${isUnlocked ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pointer-events-none'} transition-all-slow duration-1000`}
        >
          <div ref={lockedContentRef}>
            <HeroSection />
          </div>
          <DiagnosisSection />
          <BridgeSection />
          <SolutionSection />
          <PriceOfAddictionSection />
          <PricingSection />
          <FounderSection />
          <FAQSection />
        </div>
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

