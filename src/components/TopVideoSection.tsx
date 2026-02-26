import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, FastForward, CheckCircle2 } from 'lucide-react';
import Hls from 'hls.js';

interface TopVideoSectionProps {
    onUnlock: () => void;
}

const UNLOCK_TIME = 690; // 11:30 in seconds

const TopVideoSection: React.FC<TopVideoSectionProps> = ({ onUnlock }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showPlayOverlay, setShowPlayOverlay] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isBuffering, setIsBuffering] = useState(false);

    const resetControlsTimer = () => {
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        setShowControls(true);
        controlsTimerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    const handlePlayPause = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
            setShowPlayOverlay(false);
            resetControlsTimer();
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
            setShowControls(true);
            if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        }
    };

    const handleVideoTap = () => {
        if (!showControls) {
            // First tap: just reveal the controls, don't toggle play/pause
            resetControlsTimer();
        } else {
            // Controls already visible: toggle play/pause and reset timer
            handlePlayPause();
        }
    };

    const toggleSpeed = () => {
        if (!videoRef.current) return;
        const newRate = playbackRate === 1 ? 1.5 : 1;
        videoRef.current.playbackRate = newRate;
        setPlaybackRate(newRate);
    };

    const HLS_URL = 'https://pub-9966bcca8c18406581ef1218835c7416.r2.dev/landing-vsl/hls/index.m3u8';

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls: Hls | null = null;

        const onReady = () => {
            // Restore time from localStorage
            const savedTime = localStorage.getItem('vsl_current_time');
            if (savedTime) {
                const time = parseFloat(savedTime);
                if (!isNaN(time)) {
                    video.currentTime = time;
                    setCurrentTime(time);
                    if (time >= UNLOCK_TIME) {
                        onUnlock();
                    }
                }
            }

            // Only attempt autoplay if the video isn't already playing
            if (video.paused) {
                video.play().then(() => {
                    setIsPlaying(true);
                    setShowPlayOverlay(false);
                }).catch(() => {
                    setShowPlayOverlay(true);
                });
            }
        };

        const handleTimeUpdate = () => {
            const time = video.currentTime;
            setCurrentTime(time);
            localStorage.setItem('vsl_current_time', time.toString());
            if (time >= UNLOCK_TIME) {
                onUnlock();
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleEnded = () => {
            onUnlock();
            setIsPlaying(false);
            localStorage.removeItem('vsl_current_time');
        };

        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => setIsBuffering(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);

        if (Hls.isSupported()) {
            // Chrome, Firefox, Android — use HLS.js
            hls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
            });
            hls.loadSource(HLS_URL);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, onReady);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari / iOS — native HLS support
            video.src = HLS_URL;
            video.addEventListener('loadedmetadata', onReady, { once: true });
        }

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
            if (hls) {
                hls.destroy();
            }
        };
    }, [onUnlock]);

    // Progress mapping: fast at start, slow at end
    // p = 1 - (1 - t)^1.5 (moderate) or squared
    const t = duration ? currentTime / duration : 0;
    const progress = (1 - Math.pow(1 - t, 2)) * 100;

    return (
        <section className="bg-black pt-20 pb-16 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">
                {/* Headline Section */}
                <div className="text-center max-w-4xl space-y-6">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight uppercase">
                        ABANDONAR O VÍCIO É POSSÍVEL, <span className="text-orange-500">MESMO QUE VOCÊ TENHA TENTADO INÚMERAS VEZES.</span>
                    </h1>
                    <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed">
                        Você não precisa, necessariamente, começar com uma internação ou se afundar em medicamentos para dar o primeiro passo rumo à libertação, existe uma estratégia estruturada que pode te ajudar a retomar o controle de forma eficaz para conseguir vencer esse hábito destrutivo.
                    </p>
                </div>

                {/* Video & Sidebar Container */}
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-center justify-center">
                    {/* Video Player Column */}
                    <div className="lg:col-span-3 flex justify-center">
                        <div className="relative aspect-[9/16] w-full max-w-[360px] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group mx-auto">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                playsInline
                                preload="auto"
                                onClick={handleVideoTap}
                            />

                            {/* Buffering Indicator */}
                            {isBuffering && isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                    <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                                </div>
                            )}


                            {/* Custom Controls Overlay - handles tap on whole video area */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6 gap-4 ${showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                onClick={handleVideoTap}
                            >
                                {/* Progress Bar Container */}
                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-white"
                                        >
                                            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
                                        </button>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSpeed(); }}
                                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-white text-xs font-bold flex items-center gap-2"
                                    >
                                        <FastForward size={14} />
                                        {playbackRate}x
                                    </button>
                                </div>
                            </div>

                            {/* Initial Play Overlay */}
                            {showPlayOverlay && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer"
                                    onClick={handlePlayPause}
                                >
                                    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_0_50px_rgba(249,115,22,0.5)] animate-pulse">
                                        <Play size={40} fill="white" className="ml-2" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl space-y-6 h-fit">
                        <h3 className="text-white font-black text-xl tracking-tight uppercase border-b border-zinc-800 pb-4">
                            O MÉTODO SERVE PARA:
                        </h3>
                        <ul className="space-y-4">
                            {['PORNOGRAFIA', 'ALCOOLISMO', 'CIGARRO', 'DROGAS', 'OUTROS HÁBITOS COMPULSIVOS'].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-zinc-300 font-medium">
                                    <CheckCircle2 size={18} className="text-orange-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>


                {/* Status Message */}
                <div className="text-zinc-500 text-sm font-medium animate-pulse">
                    Ao terminar o vídeo, será liberado o restante da página.
                </div>
            </div>
        </section>
    );
};

export default TopVideoSection;
