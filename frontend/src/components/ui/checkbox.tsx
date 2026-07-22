import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = ref || inputRef;
    const isChecked = checked;

    React.useImperativeHandle(mergedRef, () => inputRef.current as HTMLInputElement);

    return (
      <label
        className={cn(
          'relative inline-flex items-center cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          type="checkbox"
          className="sr-only"
          ref={typeof ref === 'function' ? undefined : (ref || inputRef)}
          checked={isChecked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          id={id}
          {...props}
        />
        <div
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded border border-gray-300 transition-colors',
            isChecked && 'bg-primary-600 border-primary-600',
            !isChecked && 'bg-white',
            className
          )}
        >
          {isChecked && <Check className="h-3.5 w-3.5 text-white" />}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
export default Checkbox;
