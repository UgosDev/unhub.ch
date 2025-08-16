import React, { useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const InteractiveBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { effectiveTheme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: { x: number; y: number; vx: number; vy: number; }[];
        let mouse = { x: -200, y: -200 };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const initParticles = () => {
            const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                });
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particleColor = effectiveTheme === 'dark' ? 'rgba(192, 132, 252, 0.4)' : 'rgba(158, 91, 254, 0.4)';
            const lineColor = effectiveTheme === 'dark' ? 'rgba(192, 132, 252, 0.1)' : 'rgba(158, 91, 254, 0.1)';
            const mouseLineColor = effectiveTheme === 'dark' ? 'rgba(192, 132, 252, 0.3)' : 'rgba(158, 91, 254, 0.3)';

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();

                // Lines to other particles
                for (let i = 0; i < particles.length; i++) {
                    const p2 = particles[i];
                    const distance = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = lineColor;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
                
                // Lines to mouse
                const mouseDistance = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                if (mouseDistance < 200) {
                     ctx.beginPath();
                     ctx.moveTo(p.x, p.y);
                     ctx.lineTo(mouse.x, mouse.y);
                     ctx.strokeStyle = mouseLineColor;
                     ctx.lineWidth = 1;
                     ctx.stroke();
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        resizeCanvas();
        initParticles();
        animate();

        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [effectiveTheme]);

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />;
};

export default InteractiveBackground;