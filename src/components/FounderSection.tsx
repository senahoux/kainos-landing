import React from 'react';
import { Stethoscope, Quote } from 'lucide-react';

const FounderSection: React.FC = () => {
    return (
        <section className="bg-zinc-950 py-24 px-6">
            <div className="max-w-3xl mx-auto flex flex-col items-center gap-12 text-center">

                {/* Label */}
                <div className="inline-flex items-center gap-2 text-orange-500 text-sm font-semibold tracking-widest uppercase">
                    <Stethoscope size={14} />
                    O Fundador
                </div>

                {/* Profile */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-orange-500/50 shadow-[0_0_30px_-5px_rgba(249,115,22,0.35)] flex-shrink-0">
                        <img
                            src="/founder.jpg"
                            alt="Dr. Lucas Sena — Médico e Fundador do Protocolo Kainós"
                            className="w-full h-full object-cover object-top"
                        />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-2xl">Dr. Lucas Sena</h3>
                        <p className="text-orange-400 text-sm font-semibold mt-1">Médico &amp; Fundador do Protocolo Kainós</p>
                    </div>
                </div>

                {/* Main headline quote */}
                <div className="relative max-w-2xl">
                    <Quote size={40} className="text-orange-500/20 absolute -top-4 -left-4" />
                    <blockquote className="text-white text-xl sm:text-2xl font-bold italic leading-relaxed px-6">
                        "Supere sua área de fraqueza, porque é exatamente nela que Deus vai te usar para libertar outros."
                    </blockquote>
                </div>

                {/* Divider */}
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

                {/* Narrative body */}
                <div className="flex flex-col gap-5 text-zinc-400 text-base leading-relaxed text-left">
                    <p>
                        Talvez você ainda não entenda, mas em tudo existe um propósito. Eu já estive preso em áreas que hoje ajudo pessoas a vencer. O que um dia foi batalha, se tornou chamado. O que foi dor, se transformou em direção.
                    </p>
                    <p>
                        Sou médico. E na minha experiência clínica eu tenho comprovado algo muito claro:{' '}
                        <span className="text-zinc-200 font-semibold">quando a ciência caminha alinhada com a fé, o resultado é mais profundo, mais consistente e mais transformador.</span>
                    </p>
                    <p>
                        Não se trata apenas de parar um comportamento.<br />
                        Trata-se de <span className="text-zinc-200 font-semibold">restaurar o ser humano por completo.</span>
                    </p>
                    <p>
                        O Protocolo Kainós arquitetado nesse aplicativo reúne estratégias clínicas validadas, compreensão da neurobiologia do vício e a verdade espiritual pra te tornar uma{' '}
                        <span className="text-orange-400 font-bold">Nova Pessoa</span>.
                    </p>
                    <p>
                        É um sistema estruturado para reorganizar a mente, regular a biologia e devolver ao ser humano a capacidade de sentir prazer nas coisas simples criadas por Deus.
                    </p>
                </div>

                {/* Closing statement */}
                <div className="border-l-2 border-orange-500 pl-6 py-2 text-left w-full">
                    <p className="text-zinc-500 text-base">Isso não é autoajuda emocional.</p>
                    <p className="text-zinc-500 text-base">Não é motivação passageira.</p>
                    <p className="text-white font-bold text-lg mt-2">É ciência aplicada com propósito.</p>
                </div>

            </div>
        </section>
    );
};

export default FounderSection;
