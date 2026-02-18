import React from 'react';
import { Flame, Brain, BarChart3, Users, ArrowRight } from 'lucide-react';

const screens = [
    {
        src: '/screen-comunidade.png',
        label: 'Comunidade',
        desc: 'Caminhada coletiva',
    },
    {
        src: '/screen-diario.png',
        label: 'Meu Diário',
        desc: 'Sua jornada registrada, com interação da IA Terapeuta',
    },
    {
        src: '/screen-evolucao.png',
        label: 'Sua Evolução',
        desc: 'Quanto você economizou e seu progresso real',
    },
];

const features = [
    {
        icon: Flame,
        title: 'Botão de Compromisso',
        desc: 'Check-in diário que reforça seu comprometimento e constrói sequências de vitória.',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
    },
    {
        icon: Brain,
        title: 'IA Terapêutica (ACT)',
        desc: 'Treinada para te ajudar, orientar, dar estratégias e te acolher. Usada no momento do compromisso diário — uma vez ao dia, com propósito.',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
    },
    {
        icon: BarChart3,
        title: 'Menu Evolução',
        desc: 'Quanto você economizou, dados de humor e desejo. Veja seu progresso em tempo real.',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
    },
    {
        icon: Users,
        title: 'Comunidade de Guarda',
        desc: 'Apoio multidisciplinar de pessoas que entendem sua jornada. Você não está sozinho.',
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
    },
];

const SolutionSection: React.FC = () => {
    return (
        <section className="bg-black py-24 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto flex flex-col gap-20">

                {/* Header */}
                <div className="text-center flex flex-col gap-4">
                    <div className="inline-flex items-center gap-2 text-orange-500 text-sm font-semibold tracking-widest uppercase mx-auto">
                        <ArrowRight size={14} />
                        O Produto
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                        Estratégia, Comunidade e{' '}
                        <span className="text-orange-500">Tecnologia</span>
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                        Um ecossistema completo para sua transformação — não apenas um app.
                    </p>
                </div>

                {/* Phone gallery */}
                <div className="relative flex items-end justify-center gap-4 sm:gap-6">
                    {/* Ambient glow behind phones */}
                    <div
                        className="absolute inset-0 -z-10 blur-3xl opacity-20"
                        style={{
                            background:
                                'radial-gradient(ellipse 70% 60% at 50% 80%, rgba(249,115,22,0.4) 0%, transparent 70%)',
                        }}
                    />

                    {screens.map((screen, i) => {
                        const isCenter = i === 1;
                        return (
                            <div
                                key={screen.label}
                                className={`flex flex-col items-center gap-4 transition-all duration-500 ${isCenter
                                    ? 'z-20 scale-110 sm:scale-115'
                                    : 'z-10 opacity-80 hover:opacity-100'
                                    }`}
                                style={{ flex: isCenter ? '0 0 auto' : '0 0 auto' }}
                            >
                                {/* Phone frame */}
                                <div
                                    className={`relative rounded-[2.5rem] overflow-hidden border ${isCenter
                                        ? 'border-orange-500/40 shadow-[0_0_60px_-10px_rgba(249,115,22,0.4)]'
                                        : 'border-zinc-700/50 shadow-2xl'
                                        }`}
                                    style={{
                                        width: isCenter ? 'clamp(220px, 30vw, 340px)' : 'clamp(170px, 22vw, 260px)',
                                    }}
                                >
                                    <img
                                        src={screen.src}
                                        alt={`Tela ${screen.label} do app Kainós`}
                                        className="w-full h-auto block"
                                        loading="lazy"
                                    />
                                    {/* Subtle overlay for side phones */}
                                    {!isCenter && (
                                        <div className="absolute inset-0 bg-black/20" />
                                    )}
                                </div>

                                {/* Label */}
                                <div className="text-center">
                                    <p
                                        className={`font-bold text-sm ${isCenter ? 'text-orange-400' : 'text-zinc-400'
                                            }`}
                                    >
                                        {screen.label}
                                    </p>
                                    <p className="text-zinc-600 text-xs">{screen.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {features.map((f) => {
                        const Icon = f.icon;
                        return (
                            <div
                                key={f.title}
                                className={`glass border ${f.border} rounded-2xl p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-300`}
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center`}
                                >
                                    <Icon size={22} className={f.color} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-base mb-1">{f.title}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default SolutionSection;
