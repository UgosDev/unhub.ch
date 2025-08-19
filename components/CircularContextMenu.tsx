import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

// =============================================================
// CircularContextMenu.tsx — menu radiale accessibile + portal + long-press + semi-cerchio
// =============================================================

type DocumentGroupLike = {
  category?: string;
  pageCount?: number;
};

type MenuActionIdLike =
  | 'select'
  | 'expand'
  | 'send'
  | 'downloadZip'
  | 'downloadPdf'
  | 'ungroup';

export interface CircularContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  targetGroup?: DocumentGroupLike;
  isSelected: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onSelect: () => void;
  onExpand: () => void;
  onSendToApp: () => void;
  onDownloadZip: () => void;
  onDownloadPdf: () => void;
  onUngroup: () => void;
  actionsConfig: (MenuActionIdLike | null)[];
  layout?: 'auto' | 'circle' | 'semi-top' | 'semi-bottom' | 'semi-left' | 'semi-right';
  showCenterLabel?: boolean;
}

const clampToViewport = (x: number, y: number, w = 200, h = 200) => {
  const padding = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const nx = Math.max(padding, Math.min(x, vw - w - padding));
  const ny = Math.max(padding, Math.min(y, vh - h - padding));
  return { x: nx, y: ny };
};

function getAngleSpan(layout: NonNullable<CircularContextMenuProps['layout']>, coords: {x:number;y:number}) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const radius = 96; // same as radius in component
  let mode = layout;

  if (layout === 'auto') {
    const spaceTop = coords.y - radius;
    const spaceBottom = vh - coords.y - radius;
    const spaceLeft = coords.x - radius;
    const spaceRight = vw - coords.x - radius;

    const canBeFullCircle = spaceTop > 0 && spaceBottom > 0 && spaceLeft > 0 && spaceRight > 0;

    if (canBeFullCircle) {
        mode = 'circle';
    } else {
        const dTop = coords.y;
        const dBottom = vh - coords.y;
        const dLeft = coords.x;
        const dRight = vw - coords.x;
        const minVertical = Math.min(dTop, dBottom);
        const minHorizontal = Math.min(dLeft, dRight);
        
        if (minVertical < minHorizontal) {
            mode = dTop < dBottom ? 'semi-bottom' : 'semi-top';
        } else {
            mode = dLeft < dRight ? 'semi-right' : 'semi-left';
        }
    }
  }
  
  switch (mode) {
    case 'circle':      return { start: -Math.PI, end: Math.PI };
    case 'semi-top':    return { start: -Math.PI, end: 0 };
    case 'semi-bottom': return { start: 0, end: Math.PI };
    case 'semi-left':   return { start: -Math.PI/2, end: Math.PI/2 };
    case 'semi-right':  return { start: Math.PI/2, end: (Math.PI*3)/2 };
    default:            return { start: -Math.PI, end: Math.PI };
  }
}

export const CircularContextMenu: React.FC<CircularContextMenuProps> = ({
  isOpen,
  position,
  targetGroup,
  isSelected,
  isExpanded,
  onClose,
  onSelect,
  onExpand,
  onSendToApp,
  onDownloadZip,
  onDownloadPdf,
  onUngroup,
  actionsConfig,
  layout = 'auto',
  showCenterLabel = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState(position);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const radius = 96;

  useEffect(() => {
    if (!isOpen) return;
    const { x, y } = clampToViewport(position.x, position.y, radius * 2 + 48, radius * 2 + 48);
    setCoords({ x, y });
  }, [isOpen, position.x, position.y]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (ref.current && !ref.current.contains(t)) onClose();
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true } as any);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside as any);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !targetGroup) return null;

  const targetApp = targetGroup.category === 'Assicurazione' ? 'polizze.ch' : 'archivio.ch';

  const Icon = ({ path, className = 'w-6 h-6' }: { path: string; className?: string }) => (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
  const icons = {
    x: <Icon path="M6 6l8 8M6 14L14 6" />,
    select: <Icon path="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />,
    chevronUp: <Icon path="M5.293 12.707a1 1 0 010-1.414L10 6.586l4.707 4.707a1 1 0 11-1.414 1.414L10 9.414l-3.293 3.293a1 1 0 01-1.414 0z" />,
    chevronDown: <Icon path="M14.707 7.293a1 1 0 010 1.414L10 13.414 5.293 8.707a1 1 0 011.414-1.414L10 10.586l3.293-3.293a1 1 0 011.414 0z" />,
    send: <Icon path="M3.055 8.53L16.94 3.44a1 1 0 011.316 1.316L13.47 18.945a1 1 0 01-1.822-.22l-1.9-5.074-5.074-1.9a1 1 0 01.62-1.221z" />,
    zip: <Icon path="M6 2h7a1 1 0 011 1v14a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zm5 3H9v2h2V5zM9 9h2v2H9V9z" />,
    pdf: <Icon path="M4 3h8l4 4v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2z" />,
    layers: <Icon path="M10 3l7 4-7 4-7-4 7-4zm0 6l7 4-7 4-7-4 7-4z" />,
  } as const;

  const actionMap = {
    select: { label: isSelected ? 'Deseleziona' : 'Seleziona', icon: icons.select, handler: onSelect },
    expand: { label: isExpanded ? 'Comprimi' : 'Espandi', icon: isExpanded ? icons.chevronUp : icons.chevronDown, handler: onExpand },
    send: { label: `Invia a ${targetApp}`, icon: icons.send, handler: onSendToApp },
    downloadZip: { label: 'Scarica ZIP', icon: icons.zip, handler: onDownloadZip },
    downloadPdf: { label: 'Scarica PDF', icon: icons.pdf, handler: onDownloadPdf },
    ungroup: { label: 'Dividi Fascicolo', icon: icons.layers, handler: onUngroup },
  } as const;

  const actions = actionsConfig
    .map((id) => {
      if (!id) return null;
      if (id === 'ungroup' && (targetGroup.pageCount ?? 0) <= 1) return null;
      return actionMap[id];
    })
    .filter((a): a is NonNullable<typeof a> => !!a);

  const count = actions.length;
  const span = getAngleSpan(layout, coords);
  const fullCircle = Math.abs(span.end - span.start) > Math.PI * 1.5;
  const angleAt = (i: number) => {
    if (count <= 1) return -Math.PI / 2;
    if (fullCircle) {
      const step = (span.end - span.start) / count;
      return span.start + step * i;
    } else {
      const step = (span.end - span.start) / (count - 1);
      return span.start + step * i;
    }
  };

  const centerButton = (
    <button
      onClick={onClose}
      className="absolute top-0 left-0 w-16 h-16 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-all duration-200 ease-in-out"
      style={{ transform: 'translate(-50%, -50%)' }}
      aria-label={hoveredLabel ? hoveredLabel : 'Chiudi menu'}
    >
      {showCenterLabel && hoveredLabel ? (
        <span className="text-xs font-bold text-center px-1">{hoveredLabel}</span>
      ) : (
        <svg className="w-8 h-8" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M6 6l8 8M6 14L14 6" />
        </svg>
      )}
    </button>
  );

  const radialButtons = actions.map((action, i) => {
    const angle = angleAt(i);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const isActive = i === activeIndex;
    const isHovered = hoveredLabel === action.label;
    const activeStyle = isActive || isHovered;

    return (
      <button
        key={action.label}
        onClick={() => { action.handler(); onClose(); }}
        onMouseEnter={() => setHoveredLabel(action.label)}
        onMouseLeave={() => setHoveredLabel(null)}
        className={[
          'absolute top-0 left-0 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ease-in-out',
          activeStyle ? 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 scale-110' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200',
          'focus:outline-none focus:ring-2 focus:ring-purple-400/70',
        ].join(' ')}
        style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`, animationDelay: `${i * 0.03}s` }}
        aria-label={action.label}
        tabIndex={isActive ? 0 : -1}
      >
        {action.icon}
      </button>
    );
  });

  const node = (
    <div className="fixed inset-0 z-[12000]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" aria-hidden onClick={onClose} />
      <div
        ref={ref}
        className="absolute"
        style={{ top: coords.y, left: coords.x }}
        onClick={(e) => e.stopPropagation()}
        aria-label="Menu contestuale radiale"
      >
        <div className="relative w-0 h-0 select-none">
          {centerButton}
          {radialButtons}
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
};