import React from 'react';
import { Moon, HeartCrack, RotateCcw, X } from 'lucide-react';

const costCards = [
    { icon: Moon, label: 'Noites de culpa', desc: 'Madrugadas acordado, prometendo que amanhã seria diferente.' },
    { icon: HeartCrack, label: 'Promessas quebradas', desc: 'Para você mesmo. Para quem você ama. Promessas que viraram mentiras.' },
    { icon: RotateCcw, label: '"Última vez"', desc: 'Quantas vezes você disse isso? E quantas vezes acreditou?' },
];

const consequences = [
    'Casamento e relacionamentos destruídos',
    'Confiança que leva anos para reconstruir',
    'Filhos que percebem mais do que você imagina',
    'Saúde física e mental deteriorando',
    'Propósito de vida sufocado pelo vício',
];

const PriceOfAddictionSection: React.FC = () => {
    return (
        <section className="py-24 px-6" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(127,29,29,0.08) 0%, transparent 70%), #000000' }}>
            <div className="max-w-5xl mx-auto flex flex-col gap-14">

                {/* Header */}
                <div className="text-center flex flex-col gap-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-red-400 leading-tight">
                        Qual o preço do vício?
                    </h2>
                    <p className="text-zinc-500 text-lg max-w-xl mx-auto">
                        Antes de falar em solução, é preciso ser honesto sobre o custo real.
                    </p>
                </div>

                {/* Cost cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {costCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className="glass border border-red-900/30 rounded-2xl p-6 flex flex-col gap-4 hover:border-red-700/40 transition-colors duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-red-900/20 border border-red-800/30 flex items-center justify-center">
                                    <Icon size={22} className="text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-red-300 font-bold text-base mb-2">{card.label}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">{card.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Consequences list */}
                <div className="glass border border-red-900/20 rounded-2xl p-8 flex flex-col gap-4">
                    <h3 className="text-white font-bold text-lg mb-2">O vício está destruindo:</h3>
                    <ul className="flex flex-col gap-3">
                        {consequences.map((item) => (
                            <li key={item} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-red-900/30 border border-red-700/40 flex items-center justify-center flex-shrink-0">
                                    <X size={10} className="text-red-400" />
                                </div>
                                <span className="text-zinc-400 text-base">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default PriceOfAddictionSection;
