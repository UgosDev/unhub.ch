import React from 'react';
import type { BrandKey } from '../services/brandingService';

interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
    // No extra props needed for this basic version
}

const ScanIllustration: React.FC<IllustrationProps> = (props) => (
    <svg viewBox="0 0 200 200" {...props}>
        <defs>
            <linearGradient id="scan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="scan-glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <rect x="20" y="50" width="100" height="130" rx="5" fill="url(#scan-grad)" opacity="0.1" />
        <rect x="35" y="35" width="100" height="130" rx="5" fill="url(#scan-grad)" opacity="0.2" />
        <rect x="50" y="20" width="100" height="130" rx="5" fill="url(#scan-grad)" opacity="0.4" />
        <path d="M150 20 L180 85 L150 150" stroke="url(#scan-grad)" strokeWidth="4" fill="none" filter="url(#scan-glow)" />
    </svg>
);

const ArchivioIllustration: React.FC<IllustrationProps> = (props) => (
    <svg viewBox="0 0 200 200" {...props}>
        <defs>
            <linearGradient id="archivio-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
        </defs>
        <path d="M40 180 L40 60 Q40 40 60 40 L140 40 Q160 40 160 60 L160 180 Z" fill="url(#archivio-grad)" opacity="0.3" />
        <rect x="60" y="10" width="80" height="160" rx="5" fill="url(#archivio-grad)" opacity="0.5" />
        <circle cx="100" cy="150" r="8" fill="white" />
        <rect x="97" y="150" width="6" height="15" fill="url(#archivio-grad)" />
    </svg>
);

const PolizzeIllustration: React.FC<IllustrationProps> = (props) => (
    <svg viewBox="0 0 200 200" {...props}>
        <defs>
            <radialGradient id="polizze-grad">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#22d3ee" />
            </radialGradient>
        </defs>
        <path d="M100 20 L180 60 V 140 L100 180 L20 140 V 60 Z" stroke="url(#polizze-grad)" strokeWidth="6" fill="none" opacity="0.8" />
        <path d="M100 40 L160 70 V 130 L100 160 L40 130 V 70 Z" stroke="url(#polizze-grad)" strokeWidth="3" fill="none" opacity="0.5" />
    </svg>
);

const DisdetteIllustration: React.FC<IllustrationProps> = (props) => (
    <svg viewBox="0 0 200 200" {...props}>
        <defs>
            <linearGradient id="disdette-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#84cc16" />
            </linearGradient>
             <filter id="disdette-glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <rect x="30" y="30" width="140" height="140" rx="8" fill="url(#disdette-grad)" opacity="0.2" />
        <path d="M50 80 L90 120 L150 60" stroke="url(#disdette-grad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#disdette-glow)" />
    </svg>
);

interface WaitlistIllustrationProps {
    brandKey: BrandKey;
    className?: string;
}

const WaitlistIllustration: React.FC<WaitlistIllustrationProps> = ({ brandKey, className }) => {
    const IllustrationComponent = {
        scan: ScanIllustration,
        archivio: ArchivioIllustration,
        polizze: PolizzeIllustration,
        disdette: DisdetteIllustration,
        default: ScanIllustration
    }[brandKey] || ScanIllustration;

    return (
        <div className={className}>
            <IllustrationComponent className="w-full h-full" />
        </div>
    );
};

export default WaitlistIllustration;
