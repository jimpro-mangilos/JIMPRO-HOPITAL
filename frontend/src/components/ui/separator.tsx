import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const separatorVariants = cva('shrink-0 bg-gray-200', {
  variants: {
    orientation: {
      horizontal: 'h-[1px] w-full',
      vertical: 'h-full w-[1px]',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof separatorVariants> {}

function Separator({ className, orientation, ...props }: SeparatorProps) {
  return <div className={cn(separatorVariants({ orientation }), className)} role="separator" {...props} />;
}

export { Separator };
export default Separator;
