import React, { useState, useEffect, useRef } from 'react';
import { UnHubChWordmarkIcon, MagnifyingGlassIcon, SparklesIcon, LockClosedIcon, ShieldCheckIcon, DocumentTextIcon, ClockIcon } from '../components/icons';
import { type BrandKey } from '../services/brandingService';

const rotatingSubtitles = [
    "Dove stavi andando?",
    "Cosa stavi cercando?",
    "Ti sei perso?",
    "Il tuo punto di partenza digitale.",
    "Un hub per tutti i tuoi documenti."
];

const services = [
    { brand: 'scan' as BrandKey, name: 'scansioni.ch', color: 'var(--unhub-purple)', icon: <SparklesIcon className="w-8 h-8"/>, position: { top: '25%', left: '20%' } },
    { brand: 'archivio' as BrandKey, name: 'archivio.ch', color: 'var(--unhub-red)', icon: <LockClosedIcon className="w-8 h-8"/>, position: { top: '35%', left: '80%' } },
    { brand: 'polizze' as BrandKey, name: 'polizze', color: 'var(--unhub-cyan)', icon: <ShieldCheckIcon className="w-8 h-8"/>, position: { top: '70%', left: '15%' } },
    { brand: 'disdette' as BrandKey, name: 'disdette.ch', color: 'var(--unhub-green)', icon: <DocumentTextIcon className="w-8 h-8"/>, position: { top: '75%', left: '70%' } },
    { brand: null, name: 'Coming Soon...', color: 'var(--unhub-gray)', icon: <ClockIcon className="w-8 h-8"/>, position: { top: '50%', left: '50%' } }
];

const UnHubPage: React.FC = () => {
    const [subtitle, setSubtitle] = useState(rotatingSubtitles[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const subtitleInterval = setInterval(() => {
            setSubtitle(prev => {
                const currentIndex = rotatingSubtitles.indexOf(prev);
                const nextIndex = (currentIndex + 1) % rotatingSubtitles.length;
                return rotatingSubtitles[nextIndex];
            });
        }, 4000);
        
        const canvas = canvasRef.current;
        if (!canvas) return () => clearInterval(subtitleInterval);

        const ctx = canvas.getContext('2d');
        if (!ctx) return () => clearInterval(subtitleInterval);
        
        let animationFrameId: number;
        let particles: { x: number; y: number; vx: number; vy: number; radius: number }[];
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const initParticles = () => {
            const particleCount = Math.floor((canvas.width * canvas.height) / 20000);
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 1,
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particleColor = 'rgba(192, 132, 252, 0.5)';
            const lineColor = 'rgba(168, 85, 247, 0.08)';

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();

                for (let i = 0; i < particles.length; i++) {
                    const p2 = particles[i];
                    const distance = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = lineColor;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => { resizeCanvas(); initParticles(); };
        window.addEventListener('resize', handleResize);
        
        resizeCanvas();
        initParticles();
        animate();

        return () => {
            clearInterval(subtitleInterval);
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleNavigate = (brand: BrandKey) => {
        window.location.href = `${window.location.origin}?brand=${brand}`;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.toLowerCase().trim();
        if (!query) return;

        if (query.includes('scan') || query.includes('fattur')) handleNavigate('scan');
        else if (query.includes('archiv') || query.includes('document')) handleNavigate('archivio');
        else if (query.includes('polizz') || query.includes('assicur')) handleNavigate('polizze');
        else if (query.includes('disdett') || query.includes('contratto')) handleNavigate('disdette');
        else handleNavigate('scan');
    };

    return (
        <div className="unhub-nexus-container">
            <canvas ref={canvasRef} className="unhub-nexus-canvas" />
            
            <main className="relative z-10 text-center flex flex-col items-center justify-center w-full min-h-screen p-4">
                <UnHubChWordmarkIcon className="h-20 text-white mb-4" />
                <p className="mt-4 text-xl text-slate-300 h-8 transition-opacity duration-500">{subtitle}</p>
                <form onSubmit={handleSearch} className="mt-8 w-full max-w-xl relative">
                    <MagnifyingGlassIcon className="w-6 h-6 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cerca un servizio (es. 'fatture', 'polizze')..."
                        className="w-full pl-14 pr-5 py-4 bg-slate-800/80 backdrop-blur-sm border-2 border-slate-700 rounded-full text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        aria-label="Cerca un servizio"
                    />
                </form>
            </main>
            
            {services.map(service => (
                <div 
                    key={service.name} 
                    className={`unhub-node unhub-node-${service.brand || 'soon'}`}
                    style={{ 
                        '--node-color': service.color, 
                        top: service.position.top, 
                        left: service.position.left 
                    } as React.CSSProperties}
                    onClick={() => service.brand && handleNavigate(service.brand)}
                    title={service.name}
                >
                    <div className="unhub-node-core"></div>
                    <div className="unhub-node-info">
                        {service.icon}
                        <span className="unhub-node-name">{service.name}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UnHubPage;