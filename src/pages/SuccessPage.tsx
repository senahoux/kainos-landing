import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, LogIn, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const APP_URL = import.meta.env.VITE_APP_URL || 'https://kainos-app-main.vercel.app';

declare global {
    interface Window {
        fbq: any;
    }
}

const SuccessPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const trackPurchase = async () => {
            if (!sessionId) return;
            console.log('[Meta Pixel] Starting purchase track check for session:', sessionId);

            // Check if purchase was already tracked for this session
            const trackerKey = `purchase_sent_${sessionId}`;
            if (localStorage.getItem(trackerKey)) {
                console.log('[Meta Pixel] Purchase already tracked in this browser for this session.');
                return;
            }

            try {
                console.log('[Meta Pixel] Validating session via API...');
                // Validate session with our backend
                const response = await fetch(`/api/stripe-session?session_id=${sessionId}`);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('[Meta Pixel] API Validation failed:', response.status, errorData);
                    return;
                }

                const data = await response.json();
                console.log('[Meta Pixel] Session data received:', data);

                // Only track if payment is confirmed
                if (data.value > 0 && (data.payment_status === 'paid' || data.payment_status === 'no_payment_required')) {
                    if (typeof window.fbq === 'function') {
                        console.log('[Meta Pixel] Firing Purchase event:', { value: data.value, currency: data.currency });
                        window.fbq('track', 'Purchase', {
                            value: data.value,
                            currency: data.currency || 'BRL'
                        });
                        localStorage.setItem(trackerKey, 'true');
                        console.log('[Meta Pixel] Purchase event SENT and stored in localStorage.');
                    } else {
                        console.error('[Meta Pixel] ERROR: window.fbq is not a function!');
                    }
                } else {
                    console.warn('[Meta Pixel] Skipping Purchase track: payment_status is', data.payment_status, 'or value is', data.value);
                }
            } catch (err) {
                console.error('[Meta Pixel] Critical error during tracking:', err);
            }
        };

        trackPurchase();
    }, [sessionId]);

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
