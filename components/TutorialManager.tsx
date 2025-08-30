import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon, XMarkIcon } from './icons';

export interface TutorialStep {
    id: string;
    elementSelector?: string;
    title: string;
    content: string;
    tooltipPosition?: 'top' | 'right' | 'bottom' | 'left' | 'center';
    preAction?: () => void;
}

interface TutorialManagerProps {
    isActive: boolean;
    steps: TutorialStep[];
    currentStepIndex: number;
    onNext: () => void;
    onPrev: () => void;
    onStop: () => void;
}

const Tooltip: React.FC<Omit<TutorialManagerProps, 'isActive'>> =
    ({ steps, currentStepIndex, onNext, onPrev, onStop }) => {
        const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });
        const tooltipRef = useRef<HTMLDivElement>(null);
        const step = steps[currentStepIndex];

        useLayoutEffect(() => {
            const tooltipEl = tooltipRef.current;
            if (!tooltipEl) return;

            const positionTooltip = () => {
                const targetEl = step.elementSelector ? document.querySelector(step.elementSelector) as HTMLElement : null;

                if (step.tooltipPosition === 'center' || !targetEl) {
                    setStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 1 });
                    return;
                }

                // Ensure tooltip is in the DOM to be measured, but invisible.
                tooltipEl.style.opacity = '0';
                const targetRect = targetEl.getBoundingClientRect();
                const tooltipRect = tooltipEl.getBoundingClientRect();
                tooltipEl.style.opacity = ''; // Reset opacity for style state to take over

                const { innerWidth: vpW, innerHeight: vpH } = window;
                const PADDING = 10;
                const OFFSET = 12;

                const potentialPositions: Record<string, { top: number; left: number }> = {
                    'bottom': {
                        top: targetRect.bottom + OFFSET,
                        left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
                    },
                    'top': {
                        top: targetRect.top - tooltipRect.height - OFFSET,
                        left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
                    },
                    'right': {
                        top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
                        left: targetRect.right + OFFSET
                    },
                    'left': {
                        top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
                        left: targetRect.left - tooltipRect.width - OFFSET
                    }
                };
                
                const preferredOrder: ('top' | 'right' | 'bottom' | 'left')[] = [
                    step.tooltipPosition || 'bottom',
                    'bottom', 'top', 'right', 'left' // Fallbacks
                ];
                const order = [...new Set(preferredOrder)];

                let finalPos = null;

                for (const pos of order) {
                    const { top, left } = potentialPositions[pos];
                    if (
                        top >= PADDING &&
                        left >= PADDING &&
                        top + tooltipRect.height <= vpH - PADDING &&
                        left + tooltipRect.width <= vpW - PADDING
                    ) {
                        finalPos = { top, left };
                        break;
                    }
                }
                
                if (!finalPos) {
                    let { top, left } = potentialPositions[order[0]];
                    left = Math.max(PADDING, Math.min(left, vpW - tooltipRect.width - PADDING));
                    top = Math.max(PADDING, Math.min(top, vpH - tooltipRect.height - PADDING));
                    finalPos = { top, left };
                }
                
                setStyle({ top: `${finalPos.top}px`, left: `${finalPos.left}px`, transform: 'none', opacity: 1 });
            };
            
            const timerId = setTimeout(positionTooltip, 100);
            window.addEventListener('resize', positionTooltip);

            return () => {
                clearTimeout(timerId);
                window.removeEventListener('resize', positionTooltip);
            };

        }, [step, currentStepIndex]);
        
        const handleNext = () => {
            if (currentStepIndex === steps.length - 1) {
                onStop();
            } else {
                onNext();
            }
        };

        return (
            <div
                ref={tooltipRef}
                style={style}
                className="fixed bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-80 z-[60] border border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out"
                role="dialog"
                aria-labelledby="tutorial-title"
            >
                <h3 id="tutorial-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{step.content}</p>
                <div className="mt-6 flex justify-between items-center">
                    <p className="text-sm font-semibold text-slate-500">{currentStepIndex + 1} / {steps.length}</p>
                    <div className="flex items-center gap-2">
                         <button
                            onClick={onStop}
                            className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                            Salta Tour
                        </button>
                        {currentStepIndex > 0 && (
                            <button onClick={onPrev} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                                <ArrowUturnLeftIcon className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 text-sm font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                           {currentStepIndex === steps.length - 1 ? 'Fine' : 'Avanti'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

export const TutorialManager: React.FC<TutorialManagerProps> = ({ isActive, steps, currentStepIndex, onNext, onPrev, onStop }) => {
    const [elementRect, setElementRect] = useState<DOMRect | null>(null);
    
    const currentStep = steps[currentStepIndex];

    useLayoutEffect(() => {
        if (!isActive) return;

        let el: HTMLElement | null = null;
        if (currentStep?.elementSelector) {
            // Use a small delay to allow the element to appear after a navigation preAction
            const timeoutId = setTimeout(() => {
                el = document.querySelector(currentStep.elementSelector!) as HTMLElement;

                if (el) {
                    const rect = el.getBoundingClientRect();
                    setElementRect(rect);
                    el.classList.add('highlight-animation', 'relative', 'z-[51]');
                    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                } else {
                    setElementRect(null);
                }
            }, 150);
            return () => clearTimeout(timeoutId);
        } else {
            setElementRect(null);
        }

        return () => {
             const highlightedEl = document.querySelector('.highlight-animation');
             highlightedEl?.classList.remove('highlight-animation', 'relative', 'z-[51]');
        };
    }, [isActive, currentStepIndex, currentStep]);

    if (!isActive) {
        return null;
    }

    const overlayPath = elementRect
        ? `M0 0 H${window.innerWidth} V${window.innerHeight} H0 Z M${elementRect.left} ${elementRect.top} H${elementRect.right} V${elementRect.bottom} H${elementRect.left} Z`
        : `M0 0 H${window.innerWidth} V${window.innerHeight} H0 Z`;

    return (
        <div className="fixed inset-0 z-50">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                    d={overlayPath}
                    fill="rgba(0, 0, 0, 0.6)"
                    fillRule="evenodd"
                    style={{ transition: 'd 0.3s ease-in-out' }}
                />
            </svg>
            <Tooltip
                steps={steps}
                currentStepIndex={currentStepIndex}
                onNext={onNext}
                onPrev={onPrev}
                onStop={onStop}
            />
        </div>
    );
};