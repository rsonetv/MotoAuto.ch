'use client';

import { useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '../../i18n/routing';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { localeMetadata, type Locale } from '../../types/i18n';
import { cn } from '../../lib/utils';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'mobile';
  className?: string;
  showFlags?: boolean;
  showNativeNames?: boolean;
}

export function LanguageSelector({
  variant = 'default',
  className,
  showFlags = true,
  showNativeNames = true
}: LanguageSelectorProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocaleData = localeMetadata[locale];

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    startTransition(() => {
      // Save user preference
      if (typeof window !== 'undefined') {
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      }

      router.replace(pathname, { locale: newLocale });
      setIsOpen(false);
    });
  };

  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-auto px-2 gap-1 text-xs font-medium",
              isPending && "opacity-50 cursor-not-allowed",
              className
            )}
            disabled={isPending}
          >
            {showFlags && (
              <span className="text-base leading-none">
                {currentLocaleData.flag}
              </span>
            )}
            <span className="uppercase tracking-wide">
              {locale}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px]">
          {Object.entries(localeMetadata).map(([code, data]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => handleLocaleChange(code as Locale)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                code === locale && "bg-accent"
              )}
            >
              {showFlags && (
                <span className="text-base leading-none">
                  {data.flag}
                </span>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {showNativeNames ? data.nativeName : data.name}
                </span>
                <span className="text-xs text-muted-foreground uppercase">
                  {code}
                </span>
              </div>
              {code === locale && (
                <Check className="h-3 w-3 ml-auto" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Globe className="h-4 w-4" />
          Language / Sprache
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(localeMetadata).map(([code, data]) => (
            <Button
              key={code}
              variant={code === locale ? "default" : "outline"}
              size="sm"
              onClick={() => handleLocaleChange(code as Locale)}
              disabled={isPending}
              className={cn(
                "justify-start gap-2 h-auto py-2",
                code === locale && "ring-2 ring-primary"
              )}
            >
              {showFlags && (
                <span className="text-lg leading-none">
                  {data.flag}
                </span>
              )}
              <div className="text-left">
                <div className="font-medium text-sm">
                  {showNativeNames ? data.nativeName : data.name}
                </div>
                <div className="text-xs text-muted-foreground uppercase">
                  {code}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 min-w-[120px] justify-between",
            isPending && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={isPending}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {showFlags && (
              <span className="text-base leading-none">
                {currentLocaleData.flag}
              </span>
            )}
            <span className="font-medium">
              {showNativeNames ? currentLocaleData.nativeName : currentLocaleData.name}
            </span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {Object.entries(localeMetadata).map(([code, data]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLocaleChange(code as Locale)}
            className={cn(
              "flex items-center gap-3 cursor-pointer py-3",
              code === locale && "bg-accent"
            )}
          >
            {showFlags && (
              <span className="text-lg leading-none">
                {data.flag}
              </span>
            )}
            <div className="flex flex-col flex-1">
              <span className="font-medium">
                {showNativeNames ? data.nativeName : data.name}
              </span>
              <span className="text-xs text-muted-foreground uppercase">
                {code}
              </span>
            </div>
            {code === locale && (
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}