import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type BisileSelectOption<T extends string = string> = {
  value: T;
  label: string;
};

type BisileSelectProps<T extends string = string> = {
  value: T;
  options: ReadonlyArray<BisileSelectOption<T>>;
  onChange: (value: T) => void;
  ariaLabel: string;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
};

export const BisileSelect = <T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder,
  icon,
  className = '',
}: BisileSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setIsOpen(false);
        }}
        className="field-light flex h-12 w-full items-center justify-between gap-3 px-4 text-left font-inter text-xs font-light transition-colors hover:border-[#8A6F35]/70"
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon && <span className="shrink-0 text-[#8A6F35]/70">{icon}</span>}
          <span className={`truncate ${selectedOption ? 'text-[#2A2114]/82' : 'text-[#5B3A24]/48'}`}>
            {selectedOption?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          size={15}
          strokeWidth={1.25}
          className={`shrink-0 text-[#8A6F35]/68 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      <div
        role="listbox"
        className={`absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden border border-[#A3915D]/24 bg-[#F7F4EF] shadow-[0_18px_45px_rgba(42,33,20,0.10)] transition-[max-height,opacity,transform] duration-300 ease-out ${isOpen ? 'max-h-72 translate-y-0 opacity-100' : 'pointer-events-none max-h-0 -translate-y-2 opacity-0'}`}
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={value === option.value}
            style={{ transitionDelay: isOpen ? `${index * 35}ms` : '0ms' }}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            className={`block w-full px-4 py-3 text-left font-inter text-xs font-light transition-all duration-300 hover:bg-[#E9E6DF] hover:text-accent ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'} ${value === option.value ? 'text-accent' : 'text-primary/70'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
