import React from 'react';
import { Activity, ArrowRight, ChevronDown } from 'lucide-react';

const HeroSection: React.FC = () => {
    return (
        <section className="hero-bg min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative overflow-hidden">
            {/* Subtle top glow line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-orange-500/40 to-transparent" />

            <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-400 text-sm font-medium">
                    <Activity size={14} className="text-orange-500" />
                    Protocolo de Neuroplasticidade &amp; Fé
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight">
                    É preciso mais do que{' '}
                    <span className="text-orange-500">Força de Vontade</span>{' '}
                    para vencer o vício.
                </h1>

                {/* Subheadline */}
                <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl leading-relaxed">
                    Um sistema estruturado com base na neurociência comportamental que capacita você a vencer vícios de forma inteligente e estratégica.
                </p>

                {/* CTA Button */}
                <a
                    href="#pricing"
                    className="group inline-flex items-center gap-3 px-8 py-5 rounded-full bg-orange-500 text-white font-bold text-base sm:text-lg tracking-wide hover:bg-orange-400 transition-all duration-300 glow-orange hover:scale-105"
                    style={{ boxShadow: '0 0 40px -10px rgba(249,115,22,0.5)' }}
                >
                    INICIAR TRANSFORMAÇÃO
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </a>


            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <span className="text-zinc-600 text-xs tracking-widest uppercase">Role para baixo</span>
                <ChevronDown size={20} className="text-orange-500 animate-bounce" />
            </div>
        </section>
    );
};

export default HeroSection;
