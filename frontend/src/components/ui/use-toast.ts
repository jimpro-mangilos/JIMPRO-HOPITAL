import { useContext } from 'react';
import { ToastContext } from './toast';
import type { Toast } from './toast';

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return a no-op if used outside provider (shouldn't happen in app)
    return {
      toasts: [] as Toast[],
      toast: (_t: Omit<Toast, 'id'>) => {},
      dismiss: (_id: string) => {},
    };
  }
  return ctx;
}
