import React from 'react';

const tweets = [
    { src: '/tweet-sylvio.png', alt: 'Indicação de Sylvio de Paula no X/Twitter' },
    { src: '/tweet-akemilly.png', alt: 'Indicação de Akemilly no X/Twitter' },
    { src: '/tweet-renata.png', alt: 'Indicação de Renata A. G. S no X/Twitter' },
];

const SocialProofSection: React.FC = () => {
    return (
        <section className="bg-black py-16 px-6">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-center text-white text-2xl sm:text-3xl font-black uppercase tracking-tight mb-3">
                    O QUE ESTÃO FALANDO POR AÍ
                </h2>
                <p className="text-center text-zinc-400 text-base sm:text-lg mb-10">
                    Pessoas reais, resultados reais.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tweets.map((tweet) => (
                        <div
                            key={tweet.src}
                            className="rounded-2xl overflow-hidden border border-zinc-800 shadow-lg hover:border-orange-500/40 transition-colors duration-300"
                        >
                            <img
                                src={tweet.src}
                                alt={tweet.alt}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProofSection;
