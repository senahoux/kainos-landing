import { ChevronDown } from 'lucide-react';

const HeroSection: React.FC = () => {
    return (
        <section className="hero-bg min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative overflow-hidden">
            {/* Subtle top glow line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-orange-500/40 to-transparent" />

            <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
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
