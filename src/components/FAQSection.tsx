import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
    {
        q: 'Por que funcionaria se já falhei antes?',
        a: 'Porque antes você tentou com força de vontade. O Protocolo Kainós ataca a raiz neurobiológica do vício — o circuito de dopamina que foi reprogramado pelo comportamento compulsivo. Com ferramentas baseadas em neuroplasticidade, você reconstrói novos caminhos neurais, não apenas suprime o desejo.',
    },
    {
        q: 'Preciso ser religioso para usar o app?',
        a: 'Não. A fé é o combustível, mas o motor é científico. O protocolo funciona para qualquer pessoa que queira se libertar. A dimensão espiritual é uma ferramenta opcional e poderosa — não um pré-requisito.',
    },
    {
        q: 'Como funciona a IA Terapêutica?',
        a: 'Nossa IA foi treinada com princípios da Terapia de Aceitação e Compromisso (ACT). Ela é treinada para te ajudar, te orientar, te dar estratégias e te acolher — sem julgamento. Geralmente é usada uma vez ao dia, no momento do compromisso diário: é ali que você reflete, registra e recebe orientação personalizada para continuar avançando.',
    },
    {
        q: 'E se eu recair?',
        a: 'Recaída é um dado, não o fim. O protocolo foi desenhado para isso. No app, uma recaída reinicia o contador mas não apaga seu progresso real. Você aprende com ela, ajusta a estratégia e continua. A comunidade está lá para te apoiar, não te julgar.',
    },
    {
        q: 'Como funciona o cancelamento?',
        a: 'Sem burocracia. Você cancela diretamente pelo app ou pelo suporte, e o acesso continua até o fim do período pago. Nenhuma pergunta, nenhuma multa, nenhuma complicação.',
    },
];

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors duration-300">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left"
                aria-expanded={open}
            >
                <span className="text-white font-semibold text-base">{q}</span>
                <ChevronDown
                    size={18}
                    className={`text-orange-500 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                <div className="px-6 pb-6">
                    <div className="h-px bg-zinc-800 mb-4" />
                    <p className="text-zinc-400 text-sm leading-relaxed">{a}</p>
                </div>
            )}
        </div>
    );
};

const FAQSection: React.FC = () => {
    return (
        <section className="bg-zinc-950 py-24 px-6">
            <div className="max-w-3xl mx-auto flex flex-col gap-10">

                {/* Header */}
                <div className="text-center flex flex-col gap-4">
                    <div className="inline-flex items-center gap-2 text-orange-500 text-sm font-semibold tracking-widest uppercase mx-auto">
                        <HelpCircle size={14} />
                        Perguntas Frequentes
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white">
                        Suas dúvidas, respondidas.
                    </h2>
                </div>

                {/* Accordion */}
                <div className="flex flex-col gap-3">
                    {faqs.map((faq) => (
                        <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
