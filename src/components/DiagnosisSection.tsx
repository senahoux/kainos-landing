import React from 'react';
import { Brain, AlertTriangle, Zap } from 'lucide-react';

const DiagnosisSection: React.FC = () => {
    return (
        <section className="bg-zinc-950 py-24 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Left: Text */}
                <div className="flex flex-col gap-8">
                    <div className="inline-flex items-center gap-2 text-orange-500 text-sm font-semibold tracking-widest uppercase">
                        <Zap size={14} />
                        A Ciência do Fracasso
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                        Por que você promete parar e falha{' '}
                        <span className="text-orange-500">3 dias depois?</span>
                    </h2>

                    <div className="flex flex-col gap-5 text-zinc-400 text-base leading-relaxed">
                        <p>
                            Seu cérebro possui um circuito chamado <span className="text-zinc-200 font-semibold">Sistema de Recompensa</span>, controlado pela{' '}
                            <span className="text-zinc-200 font-semibold">Área Tegmentar Ventral (VTA)</span>. Quando você pratica o vício, esse circuito libera dopamina em quantidades anormais.
                        </p>
                        <p>
                            Com o tempo, seu cérebro é literalmente <span className="text-zinc-200 font-semibold">reprogramado</span> para buscar essa "Dopamina Barata" — e tudo o mais perde o sabor. Trabalho, família, propósito: tudo fica cinza.
                        </p>
                        <p>
                            Não é fraqueza. É <span className="text-zinc-200 font-semibold">neurobiologia</span>. E neurobiologia se trata com protocolo, não com promessas.
                        </p>
                    </div>

                    {/* Highlight quote */}
                    <blockquote className="border-l-2 border-orange-500 pl-6 py-4 bg-orange-500/5 rounded-r-xl">
                        <p className="text-zinc-200 text-base sm:text-lg italic leading-relaxed">
                            "Tentar parar apenas 'querendo' é como tentar curar um braço quebrado com pensamento positivo."
                        </p>
                    </blockquote>
                </div>

                {/* Right: Visual cards */}
                <div className="relative flex items-center justify-center h-80 lg:h-96">
                    {/* Main brain card */}
                    <div className="glass border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-4 w-64 shadow-2xl">
                        <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <Brain size={40} className="text-orange-500" />
                        </div>
                        <div className="text-center">
                            <p className="text-white font-bold text-lg">Sistema de Recompensa</p>
                            <p className="text-zinc-500 text-sm mt-1">Área Tegmentar Ventral</p>
                        </div>
                        <div className="w-full h-px bg-zinc-800" />
                        <div className="flex items-center gap-3 w-full">
                            <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-orange-600 to-orange-400" />
                            </div>
                            <span className="text-orange-400 text-xs font-bold">85%</span>
                        </div>
                        <p className="text-zinc-500 text-xs">Ativação dopaminérgica</p>
                    </div>

                    {/* Alert notification card */}
                    <div className="absolute -top-4 -right-4 lg:right-0 glass border border-red-500/30 rounded-xl p-4 flex items-center gap-3 w-56 shadow-xl animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={16} className="text-red-400" />
                        </div>
                        <div>
                            <p className="text-red-400 text-xs font-bold">ALERTA NEURAL</p>
                            <p className="text-white text-xs font-semibold">Dopamina: CRÍTICO</p>
                            <p className="text-red-300 text-xs font-black">320% acima do normal</p>
                        </div>
                    </div>

                    {/* Decorative glow */}
                    <div className="absolute inset-0 -z-10 bg-orange-500/3 rounded-3xl blur-3xl" />
                </div>
            </div>
        </section>
    );
};

export default DiagnosisSection;
