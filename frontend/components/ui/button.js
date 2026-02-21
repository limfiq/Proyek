import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const variants = {
        default: 'bg-primary text-white hover:bg-blue-700 shadow-lg hover:shadow-primary/30',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
        link: 'text-primary underline-offset-4 hover:underline',
    };

    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
    };

    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            className={cn(
                'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-95',
                variants[variant],
                sizes[size],
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Button.displayName = 'Button';

export { Button };
