import { Slot } from '@radix-ui/react-slot';
import { cn } from '@renderer/lib/utils';
import * as React from 'react';
import { buttonVariants, type ButtonVariantProps } from './button-variants';

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  ButtonVariantProps & {
    asChild?: boolean;
  }): React.JSX.Element {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
