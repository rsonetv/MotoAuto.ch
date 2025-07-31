'use client';
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';

export const LoadingButton = forwardRef<HTMLButtonElement, ButtonProps & { loading?: boolean }>(
  ({ loading, children, ...props }, ref) => (
    <Button ref={ref} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  ),
);
LoadingButton.displayName = 'LoadingButton';