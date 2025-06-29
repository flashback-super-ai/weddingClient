'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium cursor-pointer overflow-hidden disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          'text-primary-foreground bg-primary hover:bg-primary/90 before:absolute before:inset-0 before:bg-primary-foreground/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity',
        outline:
          'border !bg-background dark:!bg-input/30 dark:border-input hover:bg-accent hover:text-accent-foreground before:absolute before:inset-0 before:bg-accent/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity',
        secondary:
          'text-secondary-foreground bg-secondary hover:bg-secondary/80 before:absolute before:inset-0 before:bg-purple-300/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity',
        ghost:
          'hover:bg-accent hover:text-accent-foreground before:absolute before:inset-0 before:bg-accent/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-12 rounded-xl px-8 has-[>svg]:px-6',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface RippleButtonProps extends HTMLMotionProps<'button'>, VariantProps<typeof buttonVariants> {
  rippleColor?: string;
}

function RippleButton({
  className,
  variant,
  size,
  rippleColor = 'rgba(255, 255, 255, 0.7)',
  children,
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setRipples((prev) => [...prev, { x, y, id: Date.now() }]);
      onClick?.(event);
    },
    [onClick]
  );

  const removeRipple = React.useCallback((id: number) => {
    setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
  }, []);

  return (
    <motion.button
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {ripples.map(({ x, y, id }) => (
        <motion.span
          key={id}
          className="absolute rounded-full pointer-events-none"
          style={{
            backgroundColor: rippleColor,
            left: x,
            top: y,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ width: 0, height: 0, opacity: 0.75 }}
          animate={{ width: 200, height: 200, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          onAnimationComplete={() => removeRipple(id)}
        />
      ))}
      {children as React.ReactNode}
    </motion.button>
  );
}

export { RippleButton, type RippleButtonProps };
