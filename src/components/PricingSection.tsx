import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Star, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PRICE_ID_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY || 'price_1T31owLdVnAwm3JUlovYdaik';
const PRICE_ID_YEARLY = import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY || 'price_1T31pcLdVnAwm3JUOBahIxyv';

const monthlyFeatures = [
    'Acesso completo ao app',
    'IA Terapêutica (ACT)',
    'Comunidade de Guarda',
    'Diário e check-in diário',
    'Menu Evolução',
];

const annualFeatures = [
    ...monthlyFeatures,
    'Suporte prioritário',
    'Conteúdo exclusivo mensal',
    'Economia de R$ 132/ano',
];

const PLAN_VALUES: Record<string, number> = {
    [PRICE_ID_MONTHLY]: 35,
    [PRICE_ID_YEARLY]: 288,
};

async function startCheckout(priceId: string, setLoading: (v: string | null) => void) {
    setLoading(priceId);

    // Fire Meta Pixel InitiateCheckout before redirecting
    if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        (window as any).fbq('track', 'InitiateCheckout', {
            content_name: 'Kainos Pro',
            content_type: 'subscription',
            value: PLAN_VALUES[priceId] ?? 0,
            currency: 'BRL',
        });
    }

    try {
        // Get the current logged-in user if any (optional — landing users may not be logged in yet)
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id ?? null;

        const body: Record<string, string> = { priceId };
        if (userId) body.userId = userId;

        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao criar sessão');
        window.location.href = data.url;
    } catch (err: any) {
        alert('Erro ao iniciar pagamento: ' + err.message);
        setLoading(null);
    }
}

const PricingSection: React.FC = () => {
    const [loading, setLoading] = useState<string | null>(null);

    useEffect(() => {
        const el = document.getElementById('pricing');
        if (!el || typeof window === 'undefined') return;
        let fired = false;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !fired) {
                    fired = true;
                    if (typeof (window as any).fbq === 'function') {
                        (window as any).fbq('trackCustom', 'ViewPlans');
                    }
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section id="pricing" className="bg-black py-24 px-6 relative">
            {/* Top gradient divider */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

            <div className="max-w-4xl mx-auto flex flex-col gap-12">

                {/* Header */}
                <div className="text-center flex flex-col gap-4">
                    <p className="text-zinc-500 text-lg">Você não precisa continuar pagando esse preço.</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                        Escolha o seu plano de{' '}
                        <span className="text-orange-500">liberdade</span>
                    </h2>
                </div>

                {/* Pricing cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                    {/* Monthly */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-6">
                        <div>
                            <h3 className="text-white font-bold text-xl mb-1">Mensal</h3>
                            <p className="text-zinc-500 text-sm">Flexibilidade total, sem compromisso.</p>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-zinc-500 text-base font-medium">R$</span>
                            <span className="text-white font-black text-5xl leading-none">35</span>
                            <span className="text-zinc-500 text-base mb-1">/mês</span>
                        </div>
                        <ul className="flex flex-col gap-3">
                            {monthlyFeatures.map((f) => (
                                <li key={f} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-zinc-700/50 flex items-center justify-center flex-shrink-0">
                                        <Check size={10} className="text-zinc-400" />
                                    </div>
                                    <span className="text-zinc-400 text-sm">{f}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => startCheckout(PRICE_ID_MONTHLY, setLoading)}
                            disabled={loading !== null}
                            className="w-full py-4 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-center transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading === PRICE_ID_MONTHLY ? (
                                <><Loader2 size={16} className="animate-spin" /> Aguarde...</>
                            ) : 'Assinar Mensalmente'}
                        </button>
                    </div>

                    {/* Annual (highlighted) */}
                    <div
                        className="relative border border-orange-500/50 rounded-2xl p-8 flex flex-col gap-6"
                        style={{ background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(249,115,22,0.06) 0%, transparent 70%), rgba(24,24,27,0.8)', boxShadow: '0 0 60px -20px rgba(249,115,22,0.2)' }}
                    >
                        {/* Badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1 rounded-full bg-orange-500 text-white text-xs font-black tracking-wider">
                            <Star size={10} fill="white" />
                            MAIS ECONÔMICO
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-xl mb-1">Anual</h3>
                            <p className="text-zinc-500 text-sm">O compromisso que gera transformação real.</p>
                        </div>

                        <div>
                            <div className="flex items-end gap-1">
                                <span className="text-orange-400 text-base font-medium">R$</span>
                                <span className="text-white font-black text-5xl leading-none">24</span>
                                <span className="text-zinc-400 text-base mb-1">/mês</span>
                            </div>
                            <p className="text-zinc-500 text-sm mt-1">Cobrado R$ 288/ano · Economize R$ 132</p>
                        </div>

                        <ul className="flex flex-col gap-3">
                            {annualFeatures.map((f) => (
                                <li key={f} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                                        <Check size={10} className="text-orange-400" />
                                    </div>
                                    <span className="text-zinc-300 text-sm">{f}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => startCheckout(PRICE_ID_YEARLY, setLoading)}
                            disabled={loading !== null}
                            className="group w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ boxShadow: '0 0 30px -8px rgba(249,115,22,0.5)' }}
                        >
                            {loading === PRICE_ID_YEARLY ? (
                                <><Loader2 size={16} className="animate-spin" /> Aguarde...</>
                            ) : (
                                <>
                                    Assinar Anualmente
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <p className="text-center text-zinc-600 text-sm">
                    Garantia de 7 dias · Cancele quando quiser · Sem burocracia
                </p>
            </div>
        </section>
    );
};

export default PricingSection;
