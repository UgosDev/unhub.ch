import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * ListContextMenu.tsx — drop‑in accessibile con tastiera, portal, collisione, submenu, async, mobile-friendly.
 *
 * ✅ Caratteristiche
 * - Accessibilità: ruoli ARIA, roving tabindex, frecce ↑/↓/→/←, Home/End, Enter/Space, Esc.
 * - Portal su document.body per evitare clipping.
 * - Collision handling (clamp su viewport) per menu e sottomenu.
 * - Submenu con hover intent (delay) + apertura via tastiera e via tap.
 * - Azioni async: spinner e disabilitazione temporanea.
 * - Separatori con role="separator".
 * - Max-height con scroll per liste lunghe.
 * - Riduce flicker: delay per submenu, cancellazione al rientro.
 * - Mobile-friendly: tap per aprire sottomenu, supporto long-press (helper opzionale sotto).
 * - Animazioni leggere (motion-safe, niente layer complessi): fade/scale.
 *
 * 📦 API (TypeScript)
 *
 * type ActionItem = {
 *   type?: 'action';            // default 'action' per retrocompatibilità
 *   id?: string;                // chiave stabile opzionale
 *   label: string;
 *   icon?: React.ReactNode;
 *   disabled?: boolean;
 *   danger?: boolean;
 *   handler?: () => void | Promise<void>;
 *   submenu?: ContextMenuAction[];
 * };
 *
 * type SeparatorItem = { type: 'separator'; id?: string };
 * type ContextMenuAction = ActionItem | SeparatorItem;
 *
 * interface ListContextMenuProps {
 *   isOpen: boolean;
 *   position: { x: number; y: number };
 *   actions: ContextMenuAction[];
 *   onClose: () => void;
 *   id?: string;                // per aria-controls
 *   autoFocus?: boolean;        // default true
 * }
 */

export type SeparatorItem = { type: 'separator'; id?: string };
export type ActionItem = {
  type?: 'action';
  id?: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  handler?: () => void | Promise<void>;
  submenu?: ContextMenuAction[];
};
export type ContextMenuAction = ActionItem | SeparatorItem;

export interface ListContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  actions: ContextMenuAction[];
  onClose: () => void;
  id?: string;
  autoFocus?: boolean;
}

// ---------- utils ----------
const clampToViewport = (x: number, y: number, w: number, h: number) => {
  const padding = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const nx = Math.max(padding, Math.min(x, vw - w - padding));
  const ny = Math.max(padding, Math.min(y, vh - h - padding));
  return { x: nx, y: ny };
};

const isAction = (a: ContextMenuAction): a is ActionItem => (a as any).type !== 'separator';

// Spinner minimale (Tailwind-only)
const Spinner: React.FC<{ className?: string; title?: string }> = ({ className = "w-4 h-4", title = "Loading" }) => (
  <svg className={"animate-spin " + className} viewBox="0 0 24 24" aria-hidden>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    <title>{title}</title>
  </svg>
);

// ---------- MenuItem ----------
const MenuItem: React.FC<{
  action: ActionItem;
  isActive: boolean;
  onActivate: () => void;
  onOpenSubmenu: (rect: DOMRect) => void;
  loading: boolean;
}> = React.memo(({ action, isActive, onActivate, onOpenSubmenu, loading }) => {
  const ref = useRef<HTMLButtonElement>(null);

  const onMouseEnter = () => {
    if (action.submenu && ref.current) onOpenSubmenu(ref.current.getBoundingClientRect());
  };

  // Apertura sottomenu anche da touch/tap (tap una volta apre, seconda volta attiva primo figlio)
  const onPointerDown = (e: React.PointerEvent) => {
    if (action.submenu && e.pointerType === 'touch' && ref.current) {
      e.preventDefault();
      onOpenSubmenu(ref.current.getBoundingClientRect());
    }
  };

  const disabled = !!action.disabled || loading;

  return (
    <button
      ref={ref}
      role="menuitem"
      aria-disabled={disabled || undefined}
      aria-haspopup={action.submenu ? 'menu' : undefined}
      aria-expanded={action.submenu ? (isActive ? true : undefined) : undefined}
      tabIndex={isActive ? 0 : -1}
      onMouseEnter={onMouseEnter}
      onPointerDown={onPointerDown}
      onClick={() => {
        if (disabled) return;
        if (action.submenu) {
          if (ref.current) onOpenSubmenu(ref.current.getBoundingClientRect());
          return;
        }
        onActivate();
      }}
      className={[
        'w-full flex justify-between items-center px-3 py-2 text-sm text-left rounded-md outline-none',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700',
        action.danger ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        {action.icon && <span className="w-5 h-5 shrink-0">{action.icon}</span>}
        <span className="truncate">{action.label}</span>
      </div>
      <div className="flex items-center gap-2">
        {loading && <Spinner className="w-4 h-4" />}
        {action.submenu && (
          // ChevronRightIcon come <svg> inline per evitare dipendenza esterna
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L9.586 11 7.293 8.707a1 1 0 111.414-1.414l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );
});

// ---------- ListContextMenu ----------
export const ListContextMenu: React.FC<ListContextMenuProps> = ({
  isOpen,
  position,
  actions,
  onClose,
  id = 'context-menu',
  autoFocus = true,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState(position);
  const [activeIndex, setActiveIndex] = useState(0);
  const [submenu, setSubmenu] = useState<{
    items: ContextMenuAction[];
    pos: { x: number; y: number };
    parentIndex: number;
  } | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Delay per hover intent
  const submenuTimer = useRef<number | null>(null);

  const enabledIndexes = useMemo(() =>
    actions
      .map((a, i) => (isAction(a) && !a.disabled ? i : -1))
      .filter((i) => i !== -1),
  [actions]);

  const firstEnabled = enabledIndexes[0] ?? 0;

  // Posizione e animazione all'apertura
  useEffect(() => {
    if (!isOpen) return;
    setMounted(false);
    // Primo frame: calcolo clamp
    requestAnimationFrame(() => {
      const el = menuRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const { x, y } = clampToViewport(position.x, position.y, rect.width, rect.height);
      setCoords({ x, y });
      // Secondo frame: abilita animazione
      requestAnimationFrame(() => setMounted(true));
    });
    // Reset focus sul primo elemento attivabile
    setActiveIndex(firstEnabled);
  }, [isOpen, position.x, position.y, firstEnabled]);

  // Click/touch esterno per chiudere
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t)) onClose();
    };
    document.addEventListener('mousedown', h);
    document.addEventListener('touchstart', h, { passive: true } as any);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('touchstart', h as any);
    };
  }, [isOpen, onClose]);

  // Focus iniziale (roving tabindex)
  useEffect(() => {
    if (!isOpen || !autoFocus) return;
    const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    if (items && items.length) items[Math.min(activeIndex, items.length - 1)].focus();
  }, [isOpen, activeIndex, autoFocus]);

  const focusNext = (dir: 1 | -1) => {
    if (!actions.length) return;
    let i = activeIndex;
    for (let step = 0; step < actions.length; step++) {
      i = (i + dir + actions.length) % actions.length;
      const a = actions[i];
      if (isAction(a) && !a.disabled) {
        setActiveIndex(i);
        break;
      }
    }
  };

  const openSubmenu = (items: ContextMenuAction[], rect: DOMRect, parentIndex: number) => {
    if (submenuTimer.current) window.clearTimeout(submenuTimer.current);
    submenuTimer.current = window.setTimeout(() => {
      const estimatedWidth = 248; // ~w-60
      const gap = 4;
      const rightX = rect.right + gap;
      const leftX = rect.left - estimatedWidth - gap;
      const y = rect.top;
      const openRight = rightX + estimatedWidth < window.innerWidth - 8;
      const x = openRight ? rightX : Math.max(8, leftX);
      setSubmenu({ items, pos: { x, y }, parentIndex });
    }, 140);
  };

  const cancelSubmenuDelay = () => {
    if (submenuTimer.current) window.clearTimeout(submenuTimer.current);
  };

  const closeSubmenu = () => setSubmenu(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Gestione tastiera per il menu principale
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusNext(1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusNext(-1);
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(firstEnabled);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      // ultimo attivabile
      const last = [...enabledIndexes].pop();
      if (typeof last === 'number') setActiveIndex(last);
      return;
    }
    const current = actions[activeIndex];
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (current && isAction(current) && !current.disabled) {
        if (current.submenu) {
          // apri submenu
          const el = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')[activeIndex];
          if (el) openSubmenu(current.submenu, el.getBoundingClientRect(), activeIndex);
        } else {
          triggerHandler(current);
        }
      }
      return;
    }
    if (e.key === 'ArrowRight') {
      if (current && isAction(current) && current.submenu) {
        const el = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')[activeIndex];
        if (el) openSubmenu(current.submenu, el.getBoundingClientRect(), activeIndex);
      }
      return;
    }
    if (e.key === 'ArrowLeft') {
      if (submenu) closeSubmenu();
      else onClose();
      return;
    }
  };

  const triggerHandler = async (a: ActionItem) => {
    const key = a.id ?? a.label;
    try {
      if (a.handler) {
        const res = a.handler();
        if (res && typeof (res as any).then === 'function') {
          setLoadingKey(key);
          await res;
        }
      }
    } finally {
      setLoadingKey(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const menuNode = (
    <div
      ref={menuRef}
      id={id}
      role="menu"
      aria-orientation="vertical"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={[
        'fixed z-[10000] w-60 select-none',
        'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md',
        'rounded-lg border border-slate-200 dark:border-slate-700 p-1.5',
        'shadow-xl shadow-black/5',
        'max-h-[70vh] overflow-auto',
        'transition transform motion-reduce:transition-none',
        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
      ].join(' ')}
      style={{ top: coords.y, left: coords.x }}
      onMouseEnter={cancelSubmenuDelay}
      onMouseLeave={closeSubmenu}
    >
      {actions.map((a, i) =>
        isAction(a) ? (
          <MenuItem
            key={(a.id ?? a.label) + '-' + i}
            action={a}
            isActive={i === activeIndex}
            loading={loadingKey === (a.id ?? a.label)}
            onActivate={() => triggerHandler(a)}
            onOpenSubmenu={(rect) => a.submenu && openSubmenu(a.submenu, rect, i)}
          />
        ) : (
          <div key={(a.id ?? 'sep') + '-' + i} role="separator" className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
        )
      )}
    </div>
  );

  const submenuNode = submenu && (
    <Submenu
      parentIndex={submenu.parentIndex}
      items={submenu.items}
      pos={submenu.pos}
      onCloseAll={onClose}
      onCloseSelf={closeSubmenu}
      onActivate={(a) => triggerHandler(a)}
    />
  );

  return createPortal(
    <>
      {menuNode}
      {submenuNode}
    </>,
    document.body
  );
};

// ---------- Submenu (portaled) ----------
const Submenu: React.FC<{
  parentIndex: number;
  items: ContextMenuAction[];
  pos: { x: number; y: number };
  onCloseAll: () => void;
  onCloseSelf: () => void;
  onActivate: (a: ActionItem) => void;
}> = ({ parentIndex, items, pos, onCloseAll, onCloseSelf, onActivate }) => {
  const subRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState(pos);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Clamp posizione dopo mount
    requestAnimationFrame(() => {
      const el = subRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const { x, y } = clampToViewport(pos.x, pos.y, rect.width, rect.height);
      setCoords({ x, y });
      requestAnimationFrame(() => setMounted(true));
    });
  }, [pos.x, pos.y]);

  // Chiudi su click/touch esterni al submenu (ma non chiudere il principale)
  useEffect(() => {
    const h = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (subRef.current && !subRef.current.contains(t)) onCloseSelf();
    };
    document.addEventListener('mousedown', h);
    document.addEventListener('touchstart', h, { passive: true } as any);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('touchstart', h as any);
    };
  }, [onCloseSelf]);

  const enabledIndexes = useMemo(() =>
    items.map((a, i) => (isAction(a) && !a.disabled ? i : -1)).filter((i) => i !== -1),
  [items]);
  const [activeIndex, setActiveIndex] = useState(enabledIndexes[0] ?? 0);

  useEffect(() => {
    const itemsEls = subRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    if (itemsEls && itemsEls.length) itemsEls[Math.min(activeIndex, itemsEls.length - 1)].focus();
  }, [activeIndex]);

  const focusNext = (dir: 1 | -1) => {
    if (!items.length) return;
    let i = activeIndex;
    for (let step = 0; step < items.length; step++) {
      i = (i + dir + items.length) % items.length;
      const a = items[i];
      if (isAction(a) && !a.disabled) {
        setActiveIndex(i);
        break;
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      onCloseAll();
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); focusNext(1); return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); focusNext(-1); return; }
    if (e.key === 'Home')      { e.preventDefault(); setActiveIndex(enabledIndexes[0] ?? 0); return; }
    if (e.key === 'End')       { e.preventDefault(); const last = [...enabledIndexes].pop(); if (typeof last === 'number') setActiveIndex(last); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); onCloseSelf(); return; }

    const current = items[activeIndex];
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (current && isAction(current) && !current.disabled) onActivate(current);
      return;
    }
  };

  return createPortal(
    <div
      ref={subRef}
      role="menu"
      aria-orientation="vertical"
      className={[
        'fixed z-[11000] w-60 select-none',
        'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md',
        'rounded-lg border border-slate-200 dark:border-slate-700 p-1.5',
        'shadow-xl shadow-black/5',
        'max-h-[70vh] overflow-auto',
        'transition transform motion-reduce:transition-none',
        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
      ].join(' ')}
      style={{ top: coords.y, left: coords.x }}
      onKeyDown={onKeyDown}
    >
      {items.map((a, i) =>
        isAction(a) ? (
          <MenuItem
            key={(a.id ?? a.label) + '-' + i}
            action={a}
            isActive={i === activeIndex}
            loading={false}
            onActivate={() => onActivate(a)}
            onOpenSubmenu={() => {}}
          />
        ) : (
          <div key={(a as SeparatorItem).id ?? 'sep-' + i} role="separator" className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
        )
      )}
    </div>,
    document.body
  );
};

// ---------- Hook opzionale: long-press per aprire menu su mobile ----------
/**
 * Esempio d'uso:
 * const { bind, cancel } = useLongPress((e) => {
 *   openMenuAt({ x: e.clientX, y: e.clientY });
 * }, { delay: 450 });
 *
 * <div {...bind}>Elemento con context menu</div>
 */
export function useLongPress(
  onLongPress: (e: PointerEvent) => void,
  opts: { delay?: number } = {}
) {
  const delay = opts.delay ?? 450;
  const timer = useRef<number | null>(null);

  const onPointerDown = useCallback((ev: React.PointerEvent) => {
    if (timer.current) window.clearTimeout(timer.current);
    const native = ev.nativeEvent as unknown as PointerEvent;
    timer.current = window.setTimeout(() => onLongPress(native), delay);
  }, [delay, onLongPress]);

  const onPointerUp = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  return {
    bind: {
      onPointerDown,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
    cancel: onPointerUp,
  } as const;
}

// ---------- Esempio minimale (commentato) ----------
/*
import { ListContextMenu, type ContextMenuAction, useLongPress } from './ListContextMenu';

function Example() {
  const [isOpen, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const actions: ContextMenuAction[] = [
    { label: 'Apri', handler: () => console.log('Apri') },
    { label: 'Rinomina…', handler: async () => { await new Promise(r => setTimeout(r, 800)); alert('Rinominato'); } },
    { type: 'separator' },
    { label: 'Sposta in', submenu: [
        { label: 'Cartella A', handler: () => console.log('A') },
        { label: 'Cartella B', handler: () => console.log('B') },
      ]
    },
    { type: 'separator' },
    { label: 'Elimina', danger: true, handler: () => console.log('Elimina') },
  ];

  // Desktop: click destro
  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setOpen(true);
  };

  // Mobile: long-press helper
  const { bind } = useLongPress((e) => {
    setPos({ x: e.clientX, y: e.clientY });
    setOpen(true);
  });

  return (
    <div className="min-h-[60vh] p-8" onContextMenu={onContextMenu} {...bind}>
      <p>Click destro o long-press qui.</p>
      <ListContextMenu isOpen={isOpen} position={pos} actions={actions} onClose={() => setOpen(false)} />
    </div>
  );
}
*/