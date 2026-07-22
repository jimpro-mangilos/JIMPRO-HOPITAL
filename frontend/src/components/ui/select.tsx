import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

interface SelectContextValue {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue>({
  value: '',
  onChange: () => {},
  open: false,
  setOpen: () => {},
});

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Select({ value, onValueChange, children, disabled }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onChange: onValueChange, open, setOpen }}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children, placeholder }: {
  className?: string;
  children?: React.ReactNode;
  placeholder?: string;
}) {
  const { open, setOpen, value } = React.useContext(SelectContext);
  const displayChildren = children || (value ? <SelectValue /> : <span className="text-gray-400">{placeholder || 'Sélectionner...'}</span>);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:bg-gray-50',
        className
      )}
    >
      <span className="truncate">{displayChildren}</span>
      <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform ml-2', open && 'rotate-180')} />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext);
  return <>{value || <span className="text-gray-400">{placeholder || ''}</span>}</>;
}

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = React.useContext(SelectContext);
  if (!open) return null;

  return (
    <div className={cn(
      'absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg animate-fade-in',
      className
    )}>
      <div className="max-h-60 overflow-auto">
        {children}
      </div>
    </div>
  );
}

export function SelectItem({ value, children, disabled }: {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { value: selectedValue, onChange, setOpen } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        onChange(value);
        setOpen(false);
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none hover:bg-gray-100',
        isSelected && 'bg-primary-50 text-primary-700 font-medium',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {isSelected && <Check className="absolute left-2 h-4 w-4" />}
      {children}
    </button>
  );
}
