import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black border-t border-zinc-900 py-10 px-6">
            <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
                {/* Logo */}
                <div className="flex items-center gap-1">
                    <span className="text-zinc-600 font-black italic text-lg tracking-widest">KAINÓS</span>
                    <span className="text-orange-500 font-black text-lg">.</span>
                </div>

                {/* Divider */}
                <div className="w-16 h-px bg-zinc-800" />

                {/* Copyright */}
                <p className="text-zinc-600 text-sm text-center">
                    © 2026 Protocolo Kainós. Todos os direitos reservados.{' '}
                    <span className="text-zinc-500">Glória a Deus.</span>
                </p>

                {/* Links */}
                <div className="flex items-center gap-6 text-zinc-700 text-xs">
                    <a href="#" className="hover:text-zinc-400 transition-colors">Privacidade</a>
                    <a href="#" className="hover:text-zinc-400 transition-colors">Termos</a>
                    <a href="#" className="hover:text-zinc-400 transition-colors">Suporte</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
