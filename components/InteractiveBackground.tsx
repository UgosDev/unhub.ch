import React, { useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { BrandKey } from '../services/brandingService';

interface InteractiveBackgroundProps {
    brandKey: BrandKey;
}

const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ brandKey }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { effectiveTheme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        let mouse = { x: -1000, y: -1000, radius: 100 };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        const themeColors = {
            dark: {
                disdette: 'rgba(34, 197, 94, 0.7)', // green-500
                archivio: 'rgba(239, 68, 68, 0.7)', // red-500
                polizze: 'rgba(6, 182, 212, 0.8)',  // cyan-500
                scan: 'rgba(168, 85, 247, 0.7)', // purple-500
            },
            light: {
                disdette: 'rgba(34, 197, 94, 0.7)',
                archivio: 'rgba(239, 68, 68, 0.7)',
                polizze: 'rgba(6, 182, 212, 0.8)',
                scan: 'rgba(139, 92, 246, 0.8)', // violet-500
            }
        };
        const activeColor = themeColors[effectiveTheme][brandKey as keyof typeof themeColors.dark] || themeColors[effectiveTheme].scan;

        // --- Inizializzazione specifica per brand ---
        const init = () => {
            particles = [];
            if (brandKey === 'archivio') {
                const gap = 50;
                 for (let y = 0; y < window.innerHeight + gap; y += gap) {
                    for (let x = 0; x < window.innerWidth + gap; x += gap) {
                        particles.push({ x, y, size: 1.5 });
                    }
                }
            } else if (brandKey === 'polizze') {
                const gap = 40;
                let row = 0;
                for (let y = 0; y < window.innerHeight + gap; y += gap * 0.866) {
                    for (let x = (row % 2 === 0 ? gap / 2 : 0); x < window.innerWidth + gap; x += gap) {
                        particles.push({ x, y, size: 1.2 });
                    }
                    row++;
                }
            } else if (brandKey === 'disdette') {
                const gap = 25;
                for (let y = 0; y < window.innerHeight + gap; y += gap) {
                    for (let x = 0; x < window.innerWidth + gap; x += gap) {
                        particles.push({
                            x: x,
                            y: y,
                            baseX: x,
                            baseY: y,
                            density: (Math.random() * 20) + 5,
                            size: Math.random() * 1.5 + 1,
                        });
                    }
                }
            }
        };

        // --- Loop di animazione ---
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (brandKey === 'disdette') {
                particles.forEach(p => {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const distance = Math.hypot(dx, dy);
                    
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        const forceX = Math.cos(angle) * force * p.density * 0.6;
                        const forceY = Math.sin(angle) * force * p.density * 0.6;
                        p.x -= forceX;
                        p.y -= forceY;
                    } else {
                        if (p.x !== p.baseX) p.x -= (p.x - p.baseX) / 10;
                        if (p.y !== p.baseY) p.y -= (p.y - p.baseY) / 10;
                    }

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = activeColor;
                    ctx.fill();
                });
            } else if (brandKey === 'polizze') {
                const nearbyPoints = particles.filter(p => Math.hypot(p.x - mouse.x, p.y - mouse.y) < 120);
                
                nearbyPoints.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = activeColor;
                    ctx.fill();

                    const distToMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                    if (distToMouse < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(6, 182, 212, ${Math.max(0, 0.8 - distToMouse / 150)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }

                    nearbyPoints.forEach(p2 => {
                        if (p === p2) return;
                        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                        if (dist < 80) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.strokeStyle = `rgba(6, 182, 212, ${Math.max(0, 0.5 - dist / 160)})`;
                            ctx.lineWidth = 0.8;
                            ctx.stroke();
                        }
                    });
                });
            } else if (brandKey === 'archivio') {
                 particles.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(239, 68, 68, 0.2)`;
                    ctx.fill();
                    
                    const distToMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                    if (distToMouse < 200) {
                        for (let i = 0; i < particles.length; i++) {
                            const p2 = particles[i];
                            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                            if (dist < 100) {
                                ctx.beginPath();
                                ctx.moveTo(p.x, p.y);
                                ctx.lineTo(p2.x, p2.y);
                                ctx.strokeStyle = `rgba(239, 68, 68, ${1 - dist / 100})`;
                                ctx.stroke();
                            }
                        }
                    }
                 });
                const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
                gradient.addColorStop(0, `rgba(239, 68, 68, 0.3)`);
                gradient.addColorStop(1, `rgba(239, 68, 68, 0)`);
                ctx.fillStyle = gradient;
                ctx.fillRect(mouse.x - 150, mouse.y - 150, 300, 300);
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        const handleMouseLeave = () => {
            mouse.x = -1000; mouse.y = -1000;
        }

        resizeCanvas();
        init();
        animate();

        window.addEventListener('resize', () => { resizeCanvas(); init(); });
        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [effectiveTheme, brandKey]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />;
};

export default InteractiveBackground;