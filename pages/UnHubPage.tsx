import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UnHubChWordmarkIcon, MagnifyingGlassIcon, SparklesIcon, LockClosedIcon, ShieldCheckIcon, DocumentTextIcon, ClockIcon } from '../components/icons';
import { type BrandKey } from '../services/brandingService';

const initialSatellites = [
    { id: 'scan' as BrandKey, name: 'scansioni.ch', color: 'var(--unhub-purple)', icon: <SparklesIcon className="w-6 h-6"/>, angle: Math.random() * 2 * Math.PI, speed: 0.005, rx: 0.35, ry: 0.20 },
    { id: 'archivio' as BrandKey, name: 'archivio.ch', color: 'var(--unhub-red)', icon: <LockClosedIcon className="w-6 h-6"/>, angle: Math.random() * 2 * Math.PI, speed: -0.006, rx: 0.45, ry: 0.25 },
    { id: 'polizze' as BrandKey, name: 'polizze.ch', color: 'var(--unhub-cyan)', icon: <ShieldCheckIcon className="w-6 h-6"/>, angle: Math.random() * 2 * Math.PI, speed: 0.004, rx: 0.4, ry: 0.35 },
    { id: 'disdette' as BrandKey, name: 'disdette.ch', color: 'var(--unhub-green)', icon: <DocumentTextIcon className="w-6 h-6"/>, angle: Math.random() * 2 * Math.PI, speed: -0.007, rx: 0.5, ry: 0.15 },
    { id: 'soon', name: 'Coming Soon...', color: 'var(--unhub-gray)', icon: <ClockIcon className="w-6 h-6"/>, angle: Math.random() * 2 * Math.PI, speed: 0.003, rx: 0.3, ry: 0.3 }
];

const UnHubPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [satellites, setSatellites] = useState(initialSatellites.map(s => ({ ...s, x: 0, y: 0, z: 1, zIndex: 10 })));
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isCoreHovered, setIsCoreHovered] = useState(false);
    const [sceneTransform, setSceneTransform] = useState({});
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number | null>(null);

    // Animation Loop
    useEffect(() => {
        let lastTime = 0;
        const animate = (time: number) => {
            if (lastTime > 0) {
                const dt = (time - lastTime) / 1000;
                setSatellites(prevSatellites => 
                    prevSatellites.map(s => {
                        const baseSpeed = hoveredId === s.id ? s.speed * 0.1 : s.speed;
                        const newAngle = s.angle + baseSpeed * 60 * dt;
                        
                        const centerX = window.innerWidth / 2;
                        const centerY = window.innerHeight / 2;
                        
                        const x = s.rx * centerX * Math.cos(newAngle);
                        const y = s.ry * centerY * Math.sin(newAngle);
                        
                        const z = Math.sin(newAngle) * 0.4 + 0.8; 
                        const zIndex = Math.floor(z * 100);

                        return { ...s, angle: newAngle, x, y, z, zIndex };
                    })
                );
            }
            lastTime = time;
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [hoveredId]);
    
    // Canvas Background
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let animationFrameId: number;
        let particles: { x: number; y: number; vx: number; vy: number; radius: number }[];
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        const initParticles = () => {
            const particleCount = Math.floor((canvas.width * canvas.height) / 25000);
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
                    radius: Math.random() * 1.2 + 0.8,
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(192, 132, 252, 0.4)';
                ctx.fill();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => { resizeCanvas(); initParticles(); };
        window.addEventListener('resize', handleResize);
        
        resizeCanvas(); initParticles(); animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    // Parallax Effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const offsetX = (clientX / innerWidth - 0.5) * -30;
            const offsetY = (clientY / innerHeight - 0.5) * -30;
            setSceneTransform({ transform: `translate3d(${offsetX}px, ${offsetY}px, 0)` });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleNavigate = (brand: BrandKey) => {
        window.location.href = `${window.location.origin}?brand=${brand}`;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.toLowerCase().trim();
        if (!query) return;

        const service = initialSatellites.find(s => s.name.toLowerCase().includes(query) || s.id.includes(query));
        if(service && service.id !== 'soon') {
            handleNavigate(service.id);
        } else {
            handleNavigate('scan');
        }
    };

    return (
        <div className="unhub-orbital-container">
            <canvas ref={canvasRef} className="unhub-orbital-canvas" />
            <div className="unhub-scene" style={sceneTransform}>
                <div className="unhub-center-content">
                    <UnHubChWordmarkIcon className="h-16 text-white mb-2" />
                    <div 
                        className="unhub-core"
                        onMouseEnter={() => setIsCoreHovered(true)}
                        onMouseLeave={() => setIsCoreHovered(false)}
                    >
                         {!isCoreHovered && <span className="material-symbols-outlined text-5xl text-slate-500">search</span>}
                         <form onSubmit={handleSearch} className="unhub-search-form">
                            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cerca..."
                                className="unhub-search-input"
                                aria-label="Cerca un servizio"
                            />
                        </form>
                    </div>
                </div>

                {satellites.map(service => {
                    const transformString = `translate(-50%, -50%) translate(${service.x}px, ${service.y}px) scale(${service.z})`;
                    return (
                        <div 
                            key={service.id} 
                            className="unhub-satellite"
                            style={{ 
                                '--satellite-color': service.color,
                                '--transform-string': transformString,
                                zIndex: service.zIndex,
                                transform: transformString
                            } as React.CSSProperties}
                            onClick={() => service.id !== 'soon' && handleNavigate(service.id)}
                            onMouseEnter={() => setHoveredId(service.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            title={service.name}
                        >
                            {service.icon}
                            <div className="unhub-satellite-label">{service.name}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UnHubPage;