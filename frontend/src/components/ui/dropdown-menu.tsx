import * as React from 'react';
import { cn } from '@/lib/utils';

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue>({
  open: false,
  setOpen: () => {},
});

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { open, setOpen } = React.useContext(DropdownContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<{ onClick?: React.MouseEventHandler }>).props.onClick?.(e);
        setOpen(!open);
      },
    });
  }
  return (
    <button type="button" onClick={() => setOpen(!open)} className="cursor-pointer">
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, align = 'end', className }: {
  children: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
}) {
  const { open } = React.useContext(DropdownContext);
  if (!open) return null;

  return (
    <div className={cn(
      'absolute z-50 mt-2 min-w-[12rem] rounded-md border border-gray-200 bg-white py-1 shadow-lg animate-fade-in',
      align === 'end' ? 'right-0' : 'left-0',
      className
    )}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className, destructive }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
}) {
  const { setOpen } = React.useContext(DropdownContext);

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-gray-100',
        destructive && 'text-red-600 hover:bg-red-50',
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn('my-1 h-px bg-gray-200', className)} />;
}

export function DropdownMenuLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider', className)}>{children}</div>;
}
