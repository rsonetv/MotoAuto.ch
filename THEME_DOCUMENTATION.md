# Theme System Documentation

## Overview

MotoAuto.ch now features a comprehensive theming system that supports both light and dark modes. The theme system uses CSS variables with Tailwind CSS, which allows for consistent styling across the application while supporting different color schemes.

## Theme Switching

The application has theme switchers in the following locations:

1. **Main Navigation Bar**: A theme toggle button in the top navigation area for quick access
2. **Dashboard**: A dedicated theme toggle in the dashboard header
3. **Mobile Menu**: Theme toggle accessible in the mobile navigation menu

## Theme Implementation

### Theme Provider

The application uses `next-themes` library to manage theme state and persistence. The theme provider is configured in the root layout:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="light"
  enableSystem={true}
  disableTransitionOnChange={false}
>
  {children}
</ThemeProvider>
```

### CSS Variables

The theme colors are defined as CSS variables in `app/globals.css`. This allows for a consistent color palette across themes:

```css
:root {
  /* LIGHT (default) */
  --background: 210 40% 98%;    /* #f7f9fc */
  --foreground: 0 0% 3.9%;      /* #0a0a0a */
  /* ... other variables ... */
}

.dark {
  /* DARK */
  --background: 219 33% 10%;    /* #0d1b2a */
  --foreground: 0 0% 98%;
  /* ... other variables ... */
}
```

### Theme Toggle Component

The theme toggle component (`components/ui/theme-toggle.tsx`) provides a dropdown menu with three options:

- Light mode
- Dark mode
- System preference

## Using Theme Classes

When building UI components, use the following classes for proper theme support:

### Base Classes

- `bg-background`: For background colors
- `text-foreground`: For text colors
- `border-border`: For border colors

### Component-Specific Classes

- Cards: `bg-card text-card-foreground`
- Buttons: `bg-primary text-primary-foreground`
- Muted elements: `text-muted-foreground`

### Dark Mode Specific Overrides

For cases where you need different styling in dark mode, use the `dark:` prefix:

```tsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-800 dark:text-gray-200">Content</p>
</div>
```

## Theme-Aware Components

The UI components are designed to work with the theming system out of the box. When using components from the UI library, they will automatically respect the current theme.

## Theme Customization

To customize the theme colors:

1. Edit the CSS variables in `app/globals.css`
2. Update the Tailwind configuration in `tailwind.config.js` if needed

## Best Practices

1. Always use semantic color variables (`bg-background`, `text-foreground`) instead of hardcoded colors
2. Test your components in both light and dark mode
3. Ensure sufficient contrast between text and background colors in both themes
4. Use the `dark:` prefix only when the default theme variables don't provide the desired result

## Browser Support

The theme system works in all modern browsers. For older browsers that don't support CSS variables, a fallback to the light theme is provided.
