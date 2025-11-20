import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from './Icons';
import { ModeConfig } from '../types';

// --- Helper to get dynamic colors based on mode & theme ---
const getModeClasses = (mode: ModeConfig) => {
  if (mode.id === 'peds') return {
    focus: 'focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    textHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    ring: 'ring-emerald-500/50',
    glow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    bgSolid: 'bg-emerald-500',
    bgSoft: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderChecked: 'peer-checked:border-emerald-500 dark:peer-checked:border-emerald-400',
    bgChecked: 'peer-checked:bg-emerald-500 dark:peer-checked:bg-emerald-500',
    textChecked: 'peer-checked:text-white dark:peer-checked:text-white',
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    iconText: 'text-emerald-700 dark:text-emerald-300',
    optionHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300',
    optionSelected: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
  };
  if (mode.id === 'obgyn') return {
    focus: 'focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
    textHover: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
    border: 'border-pink-200 dark:border-pink-500/30',
    ring: 'ring-pink-500/50',
    glow: 'shadow-[0_0_20px_-5px_rgba(236,72,153,0.15)]',
    bg: 'bg-pink-50 dark:bg-pink-500/10',
    bgSolid: 'bg-pink-500',
    bgSoft: 'bg-pink-50 dark:bg-pink-900/20',
    borderChecked: 'peer-checked:border-pink-500 dark:peer-checked:border-pink-400',
    bgChecked: 'peer-checked:bg-pink-500 dark:peer-checked:bg-pink-500',
    textChecked: 'peer-checked:text-white dark:peer-checked:text-white',
    iconBg: 'bg-pink-100 dark:bg-pink-500/20',
    iconText: 'text-pink-700 dark:text-pink-300',
    optionHover: 'hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-700 dark:hover:text-pink-300',
    optionSelected: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
  };
  // Adult - Indigo/Slate
  return {
    focus: 'focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    textHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-500/30',
    ring: 'ring-indigo-500/50',
    glow: 'shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)]',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    bgSolid: 'bg-indigo-500',
    bgSoft: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderChecked: 'peer-checked:border-indigo-500 dark:peer-checked:border-indigo-400',
    bgChecked: 'peer-checked:bg-indigo-500 dark:peer-checked:bg-indigo-500',
    textChecked: 'peer-checked:text-white dark:peer-checked:text-white',
    iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
    iconText: 'text-indigo-700 dark:text-indigo-300',
    optionHover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300',
    optionSelected: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
  };
};

interface SectionProps {
  id?: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  modeConfig: ModeConfig;
}

export const Section: React.FC<SectionProps> = ({ id, title, icon, children, isOpen, onToggle, modeConfig }) => {
  const styles = getModeClasses(modeConfig);

  return (
    <div 
      id={id}
      className={`group relative mb-6 overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-500 ease-out
        ${isOpen 
            ? `border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 ${styles.glow} ring-1 ring-slate-200 dark:ring-white/5 shadow-xl` 
            : 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }
    `}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-6 text-left outline-none"
      >
        <div className="flex items-center gap-5">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
            ${isOpen ? `${styles.iconBg} ${styles.iconText} scale-110 rotate-3 shadow-lg` : 'bg-slate-200 dark:bg-slate-800 text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400'}`}>
             {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-6 h-6' })}
          </div>
          <span className={`text-2xl font-bold tracking-tight transition-colors ${isOpen ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
            {title}
          </span>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800/50 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? 'rotate-180 bg-slate-200 dark:bg-slate-800' : ''}`}>
           <ChevronDownIcon className={`h-5 w-5 text-slate-500 ${isOpen ? 'text-slate-700 dark:text-slate-300' : ''}`} />
        </div>
      </button>
      
      <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-8 pt-2">
             {/* Divider */}
            <div className={`mb-8 h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700/50 to-transparent`} />
            <div className="flex flex-col gap-8 animate-fade-in">
              {children}
            </div>
        </div>
      </div>
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  modeConfig: ModeConfig;
  suffix?: string;
}

export const Input: React.FC<InputProps> = ({ label, modeConfig, suffix, className = '', ...props }) => {
  const styles = getModeClasses(modeConfig);
  return (
    <div className={`group relative rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-white/5 transition-all duration-300 ease-out ${styles.focus} hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:shadow-md hover:-translate-y-0.5 focus-within:-translate-y-0.5 focus-within:shadow-lg`}>
       <div className="flex flex-col px-5 py-4">
         <label className={`text-base font-bold uppercase tracking-wider text-slate-500 transition-colors group-focus-within:${styles.text} select-none mb-1.5`}>
            {label}
         </label>
         <div className="relative flex items-center">
            <input
                className={`w-full bg-transparent text-lg font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none leading-relaxed ${className}`}
                {...props}
            />
            {suffix && (
                <span className="pointer-events-none ml-2 text-lg font-semibold text-slate-400 dark:text-slate-500 select-none">
                    {suffix}
                </span>
            )}
         </div>
       </div>
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  modeConfig: ModeConfig;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, modeConfig, className = '', ...props }) => {
  const styles = getModeClasses(modeConfig);
  return (
     <div className={`group relative rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-white/5 transition-all duration-300 ease-out ${styles.focus} hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:shadow-md hover:-translate-y-0.5 focus-within:-translate-y-0.5 focus-within:shadow-lg`}>
       <div className="flex flex-col px-5 py-4">
         <label className={`mb-2 text-base font-bold uppercase tracking-wider text-slate-500 transition-colors group-focus-within:${styles.text} select-none`}>
            {label}
         </label>
         <textarea
            className={`w-full resize-y bg-transparent text-lg font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none leading-relaxed min-h-[120px] ${className}`}
            {...props}
         />
       </div>
    </div>
  );
};

interface SelectProps {
  label: string;
  options: string[];
  modeConfig: ModeConfig;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ label, options, modeConfig, placeholder = "Select option...", value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState<string>("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const styles = getModeClasses(modeConfig);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const getOptionId = useCallback(
    (option: string) => `${menuId}-option-${option.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`,
    [menuId]
  );

  const selectedValue = value !== undefined ? value : internalSelected;

  const focusOption = useCallback((index: number) => {
    const option = optionRefs.current[index];
    if (option) {
      option.focus({ preventScroll: true });
    }
  }, []);

  const handleSelect = (val: string) => {
    if (onChange) {
        onChange(val);
    } else {
        setInternalSelected(val);
    }
    setIsOpen(false);
  };

  const openDropdown = () => {
    if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width
        });
    }
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  // Click outside handler & Scroll handler to close
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
        // Close if clicking outside the portal menu AND outside the button trigger
        // Note: The portal menu is in document.body, so we check if target is inside dropdown-portal-root if we had a specific ID, 
        // but simpler is to rely on the event bubbling or just close if not button.
        // Since the menu is portaled, containerRef doesn't contain it.
        if (containerRef.current && containerRef.current.contains(event.target as Node)) {
            return;
        }
        // If we clicked on the portal menu itself (we can use a data attribute or class check, but usually the menu items handle the click)
        // Let's assume if we click outside the trigger, we close. 
        // But if we click INSIDE the portal, we shouldn't close immediately? 
        // Actually, the menu items have onClick -> handleSelect -> close.
        // So we only need to detect clicks that are NEITHER the trigger NOR the menu.
        
        // Using a simpler approach: Check if click target is inside the custom dropdown UI.
        const target = event.target as HTMLElement;
        if (target.closest('[data-portal-menu="true"]')) return;
        
        setIsOpen(false);
    };

    const handleScroll = () => {
        if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
        document.addEventListener('mousedown', handleGlobalClick);
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
    }
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const selectedIndex = selectedValue ? options.indexOf(selectedValue) : -1;
      const initialIndex = selectedIndex >= 0 ? selectedIndex : 0;
      setActiveIndex(initialIndex);
      requestAnimationFrame(() => focusOption(initialIndex));
    } else {
      optionRefs.current = [];
      buttonRef.current?.focus({ preventScroll: true });
    }
  }, [focusOption, isOpen, options, selectedValue]);

  const handleButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (['Enter', ' ', 'Spacebar', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      if (!isOpen) {
        const selectedIndex = selectedValue ? options.indexOf(selectedValue) : -1;
        const initialIndex = selectedIndex >= 0 ? selectedIndex : 0;
        setActiveIndex(initialIndex);
        openDropdown();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        focusOption(activeIndex);
      } else {
        closeDropdown();
      }
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!options.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => {
        const next = (prev + 1) % options.length;
        focusOption(next);
        return next;
      });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => {
        const next = (prev - 1 + options.length) % options.length;
        focusOption(next);
        return next;
      });
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
      focusOption(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      const lastIndex = options.length - 1;
      setActiveIndex(lastIndex);
      focusOption(lastIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown();
    } else if (event.key === 'Tab') {
      closeDropdown();
    }
  };

  return (
    <div
        ref={containerRef}
        className={`group relative rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-white/5 transition-all duration-300 ease-out ${styles.focus} hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:shadow-md hover:-translate-y-0.5 focus-within:-translate-y-0.5 focus-within:shadow-lg z-20 ${isOpen ? 'ring-4 ' + styles.ring : ''}`}
    >
      <div className="flex flex-col px-5 py-4 h-full justify-center relative">
        <label className={`text-base font-bold uppercase tracking-wider text-slate-500 transition-colors group-focus-within:${styles.text} select-none mb-1.5`}>
            {label}
        </label>
        
        <button
            ref={buttonRef}
            type="button"
            onClick={toggleDropdown}
            onKeyDown={handleButtonKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? menuId : undefined}
            role="combobox"
            className="flex w-full items-center justify-between text-left focus:outline-none"
        >
            <span className={`text-lg font-semibold truncate ${selectedValue ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>
                {selectedValue || placeholder}
            </span>
            <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <ChevronDownIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 stroke-[3]" />
            </div>
        </button>

        {/* Portal Dropdown Menu */}
        {isOpen && createPortal(
            <div
                data-portal-menu="true"
                id={menuId}
                role="listbox"
                aria-activedescendant={options[activeIndex] ? getOptionId(options[activeIndex]) : undefined}
                tabIndex={-1}
                onKeyDown={handleMenuKeyDown}
                style={{
                    top: `${coords.top}px`,
                    left: `${coords.left}px`,
                    width: `${coords.width}px`
                }}
                className="fixed z-[9999] animate-pop origin-top"
            >
                <div className={`w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden`}>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
                        {options.map((option) => (
                            <button
                                key={option}
                                id={getOptionId(option)}
                                type="button"
                                role="option"
                                aria-selected={selectedValue === option}
                                onClick={() => handleSelect(option)}
                                ref={(el) => {
                                  const optionIndex = options.indexOf(option);
                                  optionRefs.current[optionIndex] = el;
                                }}
                                tabIndex={-1}
                                className={`w-full px-5 py-3 text-left text-base font-medium transition-colors ${selectedValue === option ? styles.optionSelected : `text-slate-600 dark:text-slate-400 ${styles.optionHover}`}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>,
            document.body
        )}
      </div>
    </div>
  );
};

interface CheckboxGroupProps {
  label: string;
  items: string[];
  modeConfig: ModeConfig;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ label, items, modeConfig }) => {
    const styles = getModeClasses(modeConfig);
    
    return (
        <div className="rounded-3xl bg-white/50 dark:bg-slate-950/20 p-6 border border-slate-200 dark:border-white/5">
            <label className="mb-5 block text-base font-bold uppercase tracking-wider text-slate-500">{label}</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((item) => (
                    <label key={item} className="relative group cursor-pointer tap-highlight-transparent">
                        <input type="checkbox" className="peer sr-only" />
                        <div className={`
                            h-full flex items-center justify-center text-center px-4 py-3.5 rounded-2xl border-2 transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)
                            bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700
                            text-slate-600 dark:text-slate-400 font-bold text-sm
                            
                            group-hover:border-slate-300 dark:group-hover:border-slate-600 group-hover:-translate-y-0.5
                            group-active:scale-95
                            
                            ${styles.borderChecked} ${styles.bgChecked} ${styles.textChecked}
                            peer-checked:shadow-md peer-checked:scale-[1.02]
                            peer-checked:animate-pop
                        `}>
                            <span className="z-10 relative">{item}</span>
                        </div>
                        
                        {/* Animated Glow behind selection */}
                        <div className={`absolute inset-0 rounded-2xl ${styles.bgSolid} opacity-0 blur-md transition-opacity duration-500 peer-checked:opacity-20 -z-10`}></div>
                    </label>
                ))}
            </div>
        </div>
    )
}

export const ContextBadge: React.FC<{ label: string; modeConfig: ModeConfig }> = ({ label, modeConfig }) => {
    const styles = getModeClasses(modeConfig);
    return (
        <div className={`inline-flex items-center rounded-lg px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider ${styles.bgSoft} ${styles.text} mb-5 border ${styles.border}`}>
            {label}
        </div>
    );
}

export const ModuleContext: React.FC<{ children: React.ReactNode; modeConfig: ModeConfig }> = ({ children, modeConfig }) => {
    const styles = getModeClasses(modeConfig);
    return (
        <div className={`animate-fade-in relative overflow-hidden rounded-3xl border ${styles.border} bg-slate-50/80 dark:bg-slate-900/20 p-6`}>
            <div className={`absolute left-0 top-0 h-full w-1.5 ${styles.bgSolid} opacity-60`} />
            <div className="pl-2">
                 {children}
            </div>
        </div>
    );
}