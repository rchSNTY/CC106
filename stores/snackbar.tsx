import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { Snackbar, type SnackbarVariant } from '@/components/ui/snackbar';

type SnackbarOptions = {
  message: string;
  variant?: SnackbarVariant;
  actionLabel?: string;
  onAction?: () => void;
  autoDismissMs?: number;
};

type SnackbarContextValue = {
  showSnackbar: (options: SnackbarOptions) => void;
  hideSnackbar: () => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState<SnackbarVariant>('info');
  const [actionLabel, setActionLabel] = useState<string | undefined>(undefined);
  const actionRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideSnackbar = useCallback(() => {
    setVisible(false);
  }, []);

  const showSnackbar = useCallback((options: SnackbarOptions) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    actionRef.current = options.onAction ?? null;
    setActionLabel(options.actionLabel);
    setVariant(options.variant ?? 'info');
    setMessage(options.message);
    setVisible(true);

    if (options.autoDismissMs) {
      timerRef.current = setTimeout(() => {
        hideSnackbar();
      }, options.autoDismissMs);
    }
  }, [hideSnackbar]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const value = useMemo(() => ({ showSnackbar, hideSnackbar }), [hideSnackbar, showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        visible={visible}
        message={message}
        variant={variant}
        actionLabel={actionLabel}
        onAction={actionLabel && actionRef.current ? () => actionRef.current?.() : undefined}
        onDismiss={visible ? hideSnackbar : undefined}
      />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return ctx;
}

