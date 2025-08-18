import React, { useState } from 'react';
import type { DocumentGroup } from '../services/geminiService';
import type { MenuActionId } from '../services/settingsService';
import { 
    XMarkIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, PaperAirplaneIcon,
    DownloadIcon, DocumentTextIcon, LayersIcon
} from './icons';

interface CircularContextMenuProps {
    isOpen: boolean;
    position: { x: number; y: number };
    targetGroup: DocumentGroup | undefined;
    isSelected: boolean;
    isExpanded: boolean;
    onClose: () => void;
    onSelect: () => void;
    onExpand: () => void;
    onSendToApp: () => void;
    onDownloadZip: () => void;
    onDownloadPdf: () => void;
    onUngroup: () => void;
    actionsConfig: (MenuActionId | null)[];
}

export const CircularContextMenu: React.FC<CircularContextMenuProps> = ({
    isOpen, position, targetGroup, isSelected, isExpanded, onClose,
    onSelect, onExpand, onSendToApp, onDownloadZip, onDownloadPdf, onUngroup,
    actionsConfig
}) => {
    const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

    const handleAction = (callback: Function) => {
        callback();
        onClose();
    };

    if (!isOpen || !targetGroup) return null;
    
    const targetApp = targetGroup.category === 'Assicurazione' ? 'polizze.ch' : 'archivio.ch';

    const masterActionList: Record<MenuActionId, { label: string; icon: React.ReactNode; handler: () => void; }> = {
        select: { label: isSelected ? 'Deseleziona' : 'Seleziona', icon: <CheckCircleIcon className="w-6 h-6" />, handler: () => handleAction(onSelect) },
        expand: { label: isExpanded ? 'Comprimi' : 'Espandi', icon: isExpanded ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />, handler: () => handleAction(onExpand) },
        send: { label: `Invia a ${targetApp}`, icon: <PaperAirplaneIcon className="w-6 h-6" />, handler: () => handleAction(onSendToApp) },
        downloadZip: { label: 'Scarica ZIP', icon: <DownloadIcon className="w-6 h-6" />, handler: () => handleAction(onDownloadZip) },
        downloadPdf: { label: 'Scarica PDF', icon: <DocumentTextIcon className="w-6 h-6" />, handler: () => handleAction(onDownloadPdf) },
        ungroup: { label: 'Dividi Fascicolo', icon: <LayersIcon className="w-6 h-6" />, handler: () => handleAction(onUngroup) },
    };

    const actions = actionsConfig
        .map(actionId => {
            if (!actionId) return null;
            // Conditionally hide 'ungroup' if not applicable
            if (actionId === 'ungroup' && targetGroup.pageCount <= 1) return null;
            return masterActionList[actionId];
        })
        .filter((action): action is typeof masterActionList[MenuActionId] => !!action);

    const radius = 85;
    const numActions = actions.length;
    const angleStep = numActions > 0 ? (2 * Math.PI) / numActions : 0;

    return (
        <div className="fixed inset-0 z-50" onContextMenu={(e) => e.preventDefault()} role="dialog" aria-modal="true">
            <style>{`
                @keyframes ccm-fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes ccm-scale-in {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    70% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                 .ccm-fade-in-text { animation: ccm-fade-in 0.1s ease-out forwards; }
                .ccm-backdrop { animation: ccm-fade-in 0.2s ease-out forwards; }
                .ccm-button { animation: ccm-scale-in 0.2s ease-out forwards; }
            `}</style>
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60 ccm-backdrop" />
            
            <div
                className="absolute"
                style={{ top: position.y, left: position.x }}
                onClick={(e) => e.stopPropagation()}
                aria-label="Menu contestuale"
            >
                <div className="relative w-0 h-0">
                    <button
                        onClick={onClose}
                        className="absolute top-0 left-0 w-16 h-16 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-all duration-200 ease-in-out ccm-button"
                        style={{ transform: 'translate(-50%, -50%)' }}
                        aria-label="Chiudi menu"
                    >
                        {hoveredLabel ? (
                             <span className="text-xs font-bold text-center px-1 ccm-fade-in-text">{hoveredLabel}</span>
                        ) : (
                            <XMarkIcon className="w-8 h-8" />
                        )}
                    </button>
                    
                    {actions.map((action, i) => {
                        const angle = i * angleStep - (Math.PI / 2); // Start from the top
                        const x = radius * Math.cos(angle);
                        const y = radius * Math.sin(angle);
                        const isHovered = hoveredLabel === action.label;
                        return (
                             <button
                                key={action.label}
                                onClick={action.handler}
                                onMouseEnter={() => setHoveredLabel(action.label)}
                                onMouseLeave={() => setHoveredLabel(null)}
                                className={`absolute top-0 left-0 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ease-in-out ccm-button
                                  ${isHovered 
                                    ? 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 scale-110' 
                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                  }`}
                                style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`, animationDelay: `${i * 0.03}s` }}
                                aria-label={action.label}
                            >
                                {action.icon}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};