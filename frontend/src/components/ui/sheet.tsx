import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  side: 'left' | 'right' | 'top' | 'bottom';
}

const SheetContext = React.createContext<SheetContextValue>({
  open: false,
  setOpen: () => {},
  side: 'left',
});

interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export function Sheet({ children, open: controlledOpen, onOpenChange, side = 'left' }: SheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  return (
    <SheetContext.Provider value={{ open, setOpen, side }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { setOpen } = React.useContext(SheetContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<{ onClick?: React.MouseEventHandler }>).props.onClick?.(e);
        setOpen(true);
      },
    });
  }
  return <span onClick={() => setOpen(true)} className="cursor-pointer">{children}</span>;
}

const sideTransforms: Record<string, string> = {
  left: 'inset-y-0 left-0 h-full w-72 sm:w-80 border-r translate-x-[-100%] data-[open=true]:translate-x-0',
  right: 'inset-y-0 right-0 h-full w-72 sm:w-80 border-l translate-x-[100%] data-[open=true]:translate-x-0',
  top: 'inset-x-0 top-0 h-auto border-b translate-y-[-100%] data-[open=true]:translate-y-0',
  bottom: 'inset-x-0 bottom-0 h-auto border-t translate-y-[100%] data-[open=true]:translate-y-0',
};

export function SheetContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen, side } = React.useContext(SheetContext);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div
        data-open={open}
        className={cn(
          'fixed z-50 bg-white shadow-lg transition-transform duration-300 ease-in-out',
          sideTransforms[side],
          open && sideTransforms[side].split(' ').pop(),
          className
        )}
        style={{ transform: 'none' }}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </button>
        <div className="h-full overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2 mb-4', className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold text-gray-900', className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-gray-500', className)} {...props} />;
}

export function SheetClose({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { setOpen } = React.useContext(SheetContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<{ onClick?: React.MouseEventHandler }>).props.onClick?.(e);
        setOpen(false);
      },
    });
  }
  return <span onClick={() => setOpen(false)} className="cursor-pointer">{children}</span>;
}
