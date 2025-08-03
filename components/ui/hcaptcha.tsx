'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    hcaptcha: {
      render: (element: HTMLElement, options: any) => string;
      getResponse: (widgetId: string) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface HCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  className?: string;
}

export function HCaptcha({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = 'light',
  size = 'normal',
  className = ''
}: HCaptchaProps) {
  const captchaRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load hCaptcha script if not already loaded
    if (!window.hcaptcha) {
      const script = document.createElement('script');
      script.src = 'https://js.hcaptcha.com/1/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }

    return () => {
      // Cleanup widget on unmount
      if (widgetId && window.hcaptcha) {
        window.hcaptcha.remove(widgetId);
      }
    };
  }, [widgetId]);

  useEffect(() => {
    if (isLoaded && captchaRef.current && !widgetId && window.hcaptcha) {
      const id = window.hcaptcha.render(captchaRef.current, {
        sitekey: siteKey,
        theme,
        size,
        callback: onVerify,
        'error-callback': onError,
        'expired-callback': onExpire,
      });
      setWidgetId(id);
    }
  }, [isLoaded, siteKey, theme, size, onVerify, onError, onExpire, widgetId]);

  const getResponse = () => {
    if (widgetId && window.hcaptcha) {
      return window.hcaptcha.getResponse(widgetId);
    }
    return '';
  };

  const reset = () => {
    if (widgetId && window.hcaptcha) {
      window.hcaptcha.reset(widgetId);
    }
  };

  return (
    <div className={className}>
      <div ref={captchaRef} />
    </div>
  );
}
