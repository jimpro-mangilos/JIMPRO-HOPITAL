import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

const variantStyles = {
  default: 'border-l-4 border-blue-500',
  success: 'border-l-4 border-green-500',
  error: 'border-l-4 border-red-500',
  warning: 'border-l-4 border-yellow-500',
};

const variantIcons = {
  default: '🔵',
  success: '✅',
  error: '❌',
  warning: '⚠️',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...t, id };
    setToasts((prev) => [...prev, newToast]);

    if (t.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((to) => to.id !== id));
      }, t.duration || 5000);
    }
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto bg-white rounded-lg shadow-lg p-4 animate-slide-in-right relative',
              variantStyles[t.variant || 'default']
            )}
          >
            <button
              onClick={() => dismiss(t.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="flex items-start gap-2">
              <span className="text-sm">{variantIcons[t.variant || 'default']}</span>
              <div className="flex-1 min-w-0">
                {t.title && <p className="text-sm font-semibold text-gray-900">{t.title}</p>}
                {t.description && <p className="text-sm text-gray-600 mt-0.5">{t.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export { ToastContext };
export default ToastProvider;
