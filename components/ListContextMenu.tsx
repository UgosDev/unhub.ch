import React, { useState, useRef, useEffect } from 'react';
import { ChevronRightIcon } from './icons';

interface ActionItem {
    label: string;
    icon?: React.ReactNode;
    handler?: () => void;
    submenu?: ContextMenuAction[];
    type?: 'action';
}

interface SeparatorItem {
    type: 'separator';
    label?: undefined; 
}

export type ContextMenuAction = ActionItem | SeparatorItem;


interface ListContextMenuProps {
    isOpen: boolean;
    position: { x: number; y: number };
    actions: ContextMenuAction[];
    onClose: () => void;
}

const MenuItem: React.FC<{ action: ActionItem, closeMenu: () => void, openSubmenu: (submenu: ContextMenuAction[], position: { x: number, y: number }) => void }> = ({ action, closeMenu, openSubmenu }) => {
    const itemRef = useRef<HTMLButtonElement>(null);

    const handleClick = () => {
        if (action.handler) {
            action.handler();
        }
        closeMenu();
    };

    const handleMouseEnter = () => {
        if (action.submenu && itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            openSubmenu(action.submenu, { x: rect.right, y: rect.top });
        }
    };

    return (
        <button
            ref={itemRef}
            role="menuitem"
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            className="w-full flex justify-between items-center px-3 py-2 text-sm text-left text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-700"
        >
            <div className="flex items-center gap-3">
                {action.icon && <span className="w-5 h-5">{action.icon}</span>}
                <span>{action.label}</span>
            </div>
            {action.submenu && <ChevronRightIcon className="w-4 h-4" />}
        </button>
    );
};

export const ListContextMenu: React.FC<ListContextMenuProps> = ({ isOpen, position, actions, onClose }) => {
    const [submenu, setSubmenu] = useState<{ items: ContextMenuAction[], position: { x: number, y: number } } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    const openSubmenu = (items: ContextMenuAction[], pos: { x: number, y: number }) => {
        setSubmenu({ items, position: pos });
    };

    const closeSubmenu = () => {
        setSubmenu(null);
    };
    
    const menuStyle = {
        top: position.y,
        left: position.x,
        '--tw-shadow': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        '--tw-shadow-colored': '0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color)',
    };
    
    const renderMenu = (menuActions: ContextMenuAction[], pos: {x: number, y: number}) => (
        <div
            role="menu"
            className="fixed bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-lg shadow-lg p-1.5 border border-slate-200 dark:border-slate-700 w-60 z-50"
            style={{ top: pos.y, left: pos.x }}
            onMouseLeave={closeSubmenu}
        >
            {menuActions.map((action, index) => (
                action.type === 'separator'
                    ? <div key={`sep-${index}`} className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                    : <MenuItem key={action.label} action={action} closeMenu={onClose} openSubmenu={openSubmenu} />
            ))}
        </div>
    );
    
    return (
        <div ref={menuRef}>
            {renderMenu(actions, position)}
            {submenu && renderMenu(submenu.items, submenu.position)}
        </div>
    );
};