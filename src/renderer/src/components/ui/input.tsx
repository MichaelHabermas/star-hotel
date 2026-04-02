import { cn } from '@renderer/lib/utils';
import * as React from 'react';

function Input({ className, type, ...props }: React.ComponentProps<'input'>): React.JSX.Element {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input bg-background ring-offset-background placeholder:text-muted-foreground flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/80 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
