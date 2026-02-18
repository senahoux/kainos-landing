import React from 'react';
import { ArrowRight } from 'lucide-react';

const BridgeSection: React.FC = () => {
    return (
        <section className="bg-zinc-950 py-24 px-6 border-t border-zinc-800/50">
            <div className="max-w-3xl mx-auto flex flex-col items-center gap-10 text-center">

                {/* Hook */}
                <p className="text-orange-400 font-bold text-lg sm:text-xl flex items-center gap-2">
                    <ArrowRight size={18} className="flex-shrink-0" />
                    É exatamente por isso que desenvolvemos o Kainós.
                </p>

                {/* Main statement */}
                <p className="text-white text-2xl sm:text-3xl font-bold leading-snug">
                    Uma plataforma arquitetada em cada detalhe para conduzir você a uma mudança{' '}
                    <span className="text-orange-400">real, consistente e sustentável.</span>
                </p>

                {/* Contrast list */}
                <div className="flex flex-col gap-3 text-zinc-500 text-base sm:text-lg">
                    <p>Não baseada em motivação passageira.</p>
                    <p>Não dependente de picos rápidos de prazer.</p>
                    <p className="text-zinc-300 font-semibold mt-2">
                        Mas fundamentada na reestruturação da sua rotina, dos seus hábitos e da forma como o seu cérebro responde aos estímulos.
                    </p>
                </div>

                {/* Divider */}
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

                {/* Features summary */}
                <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                    O Kainós combina{' '}
                    <span className="text-white font-semibold">estratégias práticas</span>,{' '}
                    <span className="text-white font-semibold">direcionamento diário</span>,{' '}
                    <span className="text-white font-semibold">fortalecimento espiritual</span>,{' '}
                    <span className="text-white font-semibold">gamificação inteligente</span>{' '}
                    e acompanhamento da sua evolução de forma visível e progressiva.
                </p>

                {/* Community */}
                <div className="flex flex-col gap-1 text-zinc-400 text-base">
                    <p>Você não caminha sozinho.</p>
                    <p className="text-zinc-200 font-medium">Existe comunidade, existe método, existe acompanhamento.</p>
                </div>

                {/* Closing */}
                <div className="border-l-2 border-orange-500 pl-6 py-2 text-left">
                    <p className="text-zinc-500 text-base">Aqui, a transformação não acontece por impulso.</p>
                    <p className="text-white font-bold text-lg mt-1">Ela é construída dia após dia.</p>
                </div>

            </div>
        </section>
    );
};

export default BridgeSection;
