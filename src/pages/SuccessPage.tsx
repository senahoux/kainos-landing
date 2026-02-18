import React, { useState } from 'react';
import { CheckCircle, LogIn, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const APP_URL = import.meta.env.VITE_APP_URL || 'https://kainos-app-main.vercel.app';

const SuccessPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    // After Google auth, redirect straight to the app.
                    // The trigger in Supabase will link the subscription by email automatically.
                    redirectTo: APP_URL,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError('Erro ao iniciar login. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="max-w-md w-full flex flex-col items-center gap-8 text-center">

                {/* Icon */}
                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle size={40} className="text-green-400" />
                </div>

                {/* Headline */}
                <div className="flex flex-col gap-3">
                    <h1 className="text-white text-3xl font-black">Pagamento confirmado!</h1>
                    <p className="text-zinc-400 text-base leading-relaxed">
                        Sua assinatura do Protocolo Kainós está ativa. Agora é só criar seu acesso com o Google para entrar no app.
                    </p>
                </div>

                {/* CTA */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-full bg-orange-500 text-white font-bold text-base hover:bg-orange-400 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ boxShadow: '0 0 30px -8px rgba(249,115,22,0.5)' }}
                >
                    {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <LogIn size={20} />
                    )}
                    {loading ? 'Redirecionando...' : 'Finalizar acesso com Google'}
                </button>

                {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                )}

                <p className="text-zinc-600 text-xs">
                    Ao continuar, você concorda com os termos do Protocolo Kainós.
                </p>
            </div>
        </div>
    );
};

export default SuccessPage;
