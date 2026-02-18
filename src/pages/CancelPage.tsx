import React from 'react';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CancelPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="max-w-md w-full flex flex-col items-center gap-8 text-center">

                {/* Icon */}
                <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <XCircle size={40} className="text-zinc-500" />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-3">
                    <h1 className="text-white text-3xl font-black">Pagamento cancelado</h1>
                    <p className="text-zinc-400 text-base leading-relaxed">
                        Nenhuma cobrança foi realizada. Você pode voltar e escolher seu plano quando estiver pronto.
                    </p>
                </div>

                {/* CTA */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-zinc-700 text-zinc-300 font-semibold hover:border-orange-500/50 hover:text-orange-400 transition-all duration-300"
                >
                    <ArrowLeft size={18} />
                    Voltar para a landing
                </Link>
            </div>
        </div>
    );
};

export default CancelPage;
