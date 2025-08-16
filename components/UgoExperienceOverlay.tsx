import React from 'react';
import { SparklesIcon, SunIcon, ViewfinderCircleIcon, ArrowsPointingOutIcon } from './icons';

interface UgoExperienceOverlayProps {
    feedback: {
        isDocumentVisible?: boolean;
        shotQuality?: {
            lighting?: 'good' | 'poor' | 'ok';
            stability?: 'stable' | 'blurry';
            framing?: 'good' | 'partial' | 'far';
        };
        userFeedback?: string;
    } | null;
}

const QualityIndicator: React.FC<{ label: string, status: 'good' | 'poor' | 'ok' | 'stable' | 'blurry' | 'partial' | 'far' | undefined, Icon: React.FC<any> }> = ({ label, status, Icon }) => {
    const colorClasses = {
        good: 'text-green-400',
        stable: 'text-green-400',
        ok: 'text-yellow-400',
        poor: 'text-red-400',
        blurry: 'text-red-400',
        partial: 'text-yellow-400',
        far: 'text-yellow-400',
        default: 'text-slate-400',
    };
    
    const color = colorClasses[status || 'default'];

    return (
        <div className={`flex items-center gap-1.5 p-2 rounded-lg bg-black/30 backdrop-blur-sm ${color}`}>
            <Icon className="w-5 h-5" />
            <span className="text-xs font-semibold">{label}</span>
        </div>
    );
};

export const UgoExperienceOverlay: React.FC<UgoExperienceOverlayProps> = ({ feedback }) => {
    const { isDocumentVisible, shotQuality, userFeedback } = feedback || {};
    const statusText = isDocumentVisible ? (userFeedback || 'Inquadratura perfetta') : 'Inquadra un documento...';

    return (
        <div className="absolute inset-0 p-4 pointer-events-none flex justify-end items-center">
            <style>{`
                @keyframes ugo-fade-in-right {
                    from { opacity: 0; transform: translateX(10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-ugo-fade-in-right { animation: ugo-fade-in-right 0.3s ease-out forwards; }
            `}</style>
            
            <div className="flex flex-col items-end gap-3 animate-ugo-fade-in-right">
                {/* User feedback text */}
                <div className="flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md">
                    <SparklesIcon className="w-5 h-5 text-purple-400" />
                    <span>{statusText}</span>
                </div>
                
                {/* Quality indicators */}
                <div className="space-y-2">
                    <QualityIndicator label="Luce" status={shotQuality?.lighting} Icon={SunIcon} />
                    <QualityIndicator label="Stabilità" status={shotQuality?.stability} Icon={ViewfinderCircleIcon} />
                    <QualityIndicator label="Inquadratura" status={shotQuality?.framing} Icon={ArrowsPointingOutIcon} />
                </div>
            </div>
        </div>
    );
};
