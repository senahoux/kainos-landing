import React from 'react';

const Navbar: React.FC = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <span className="text-white font-black italic text-xl tracking-widest">KAINÓS</span>
                    <span className="text-orange-500 font-black text-xl">.</span>
                </div>
                <a
                    href="#pricing"
                    className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-semibold hover:bg-orange-500/20 transition-all duration-300"
                >
                    Começar Agora
                </a>
            </div>
        </nav>
    );
};

export default Navbar;
