import React, { useState, useEffect, useRef } from 'react';
import { UnHubChWordmarkIcon, SparklesIcon, LockClosedIcon, ShieldCheckIcon, DocumentTextIcon, ClockIcon, UsersIcon } from '../components/icons';
import { type BrandKey } from '../services/brandingService';

const consumerServices = [
    { id: 'scan', name: 'scansioni.ch', icon: <SparklesIcon className="w-5 h-5 unhub-icon"/> },
    { id: 'archivio', name: 'archivio.ch', icon: <LockClosedIcon className="w-5 h-5 unhub-icon"/> },
    { id: 'polizze', name: 'polizze.ch', icon: <ShieldCheckIcon className="w-5 h-5 unhub-icon"/> },
    { id: 'disdette', name: 'disdette.ch', icon: <DocumentTextIcon className="w-5 h-5 unhub-icon"/> }
];

const proServices = [
    { id: 'fakeleads', name: 'FakeLeads.ch', tagline: 'Simulatore AI per consulenti', icon: <SparklesIcon className="w-5 h-5 unhub-icon"/> },
    { id: 'twodots', name: 'TwoDots.pro', tagline: 'Gestione reti professionali', icon: <UsersIcon className="w-5 h-5 unhub-icon" /> },
    { id: 'epiteto', name: 'Epiteto.ch', tagline: 'Redazione AI per la scrittura', icon: <DocumentTextIcon className="w-5 h-5 unhub-icon"/> },
    { id: 'soon', name: 'Molto altro...', tagline: 'Nuovi strumenti in arrivo', icon: <ClockIcon className="w-5 h-5 unhub-icon"/> }
];


const UnHubPage: React.FC = () => {
    const [hoveredPanel, setHoveredPanel] = useState<'consumer' | 'pro' | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: { x: number; y: number; size: number; speedX: number; speedY: number; color: string }[] = [];
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3,
                    color: Math.random() > 0.5 ? 'rgba(168, 85, 247, 0.5)' : 'rgba(6, 182, 212, 0.5)'
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        
        resizeCanvas();
        animate();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    const handleNavigate = (brand: BrandKey) => {
        window.location.href = `${window.location.origin}?brand=${brand}`;
    };

    return (
        <div className={`unhub-split-container ${hoveredPanel ? `hover-${hoveredPanel}` : ''}`}>
            <canvas id="unhub-canvas" ref={canvasRef}></canvas>
            
            <div 
                className="unhub-panel unhub-panel--consumer"
                onMouseEnter={() => setHoveredPanel('consumer')}
                onMouseLeave={() => setHoveredPanel(null)}
            >
                <div className="unhub-panel-content">
                    <UnHubChWordmarkIcon className="h-12 text-white" />
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Per la tua vita digitale.</h2>
                    <p className="mt-2 text-lg text-slate-400">Strumenti intelligenti per semplificare la quotidianità.</p>
                    <div className="unhub-service-list">
                        {consumerServices.map(service => (
                             <a key={service.id} href={`${window.location.origin}?brand=${service.id}`} className="unhub-service-link">
                                {service.icon}
                                {service.name}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div 
                className="unhub-panel unhub-panel--pro"
                onMouseEnter={() => setHoveredPanel('pro')}
                onMouseLeave={() => setHoveredPanel(null)}
            >
                <div className="unhub-panel-content">
                    <h2 className="text-4xl font-extrabold tracking-tighter text-white">UnHub.pro</h2>
                    <p className="mt-2 text-lg text-slate-400">Tool professionali potenziati dall'AI.</p>
                    <div className="unhub-service-list">
                        {proServices.map(service => (
                            <a key={service.id} href="#" className="unhub-service-link" onClick={e => e.preventDefault()}>
                                {service.icon}
                                <span>{service.name} <span className="text-slate-500 font-normal text-base hidden sm:inline">- {service.tagline}</span></span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnHubPage;