# Light Theme Implementation for MotoAuto.ch

## Overview
This implementation adds a complete light/dark theme system to the MotoAuto.ch platform with support for system theme detection and manual theme switching.

## Features Added

### 1. Theme Provider Setup
- **File**: `components/theme-provider.tsx`
- **Purpose**: Wraps the entire application with next-themes provider
- **Configuration**: 
  - Default theme: Light
  - System theme support: Enabled
  - Attribute: `class` (for Tailwind CSS)

### 2. Theme Toggle Component
- **File**: `components/ui/theme-toggle.tsx`
- **Features**:
  - Dropdown menu with 3 options: Light, Dark, System
  - Animated sun/moon icons
  - Polish language labels ("Jasny", "Ciemny", "System")
  - Adaptive styling for different header states
  - Visual feedback for active theme

### 3. CSS Theme Variables
- **File**: `styles/motoauto-theme.css`
- **Implementation**: HSL-based CSS custom properties
- **Colors**:
  - **Light Theme**: Clean whites and light grays with MotoAuto brand colors
  - **Dark Theme**: Dark blues and charcoals maintaining brand identity
  - **Variables**: Complete shadcn/ui color system support

### 4. Tailwind Configuration
- **File**: `tailwind.config.ts`
- **Updates**:
  - Added `darkMode: "class"` configuration
  - Mapped all theme colors to CSS custom properties
  - Support for semantic color names (background, foreground, primary, etc.)

### 5. Layout Integration
- **File**: `app/layout.tsx`
- **Changes**:
  - Added ThemeProvider wrapper
  - Imported theme CSS file
  - Added `suppressHydrationWarning` for SSR compatibility

### 6. Header Components Updated
- **Files**: 
  - `components/header-new.tsx` - Hero page header
  - `components/layout/header.tsx` - Main application header
- **Changes**:
  - Added theme toggle to desktop and mobile menus
  - Updated all color classes to use theme variables
  - Responsive theme toggle placement

## Theme Colors

### Light Theme
- **Background**: `#f7f9fc` (light blue-gray)
- **Foreground**: `#0a0a0a` (almost black)
- **Primary**: `#009fb7` (MotoAuto brand blue)
- **Secondary**: `#e9eef5` (light gray-blue)
- **Accent**: `#009fb7` (matches primary)
- **Borders**: `#dfe5ef` (subtle gray-blue)

### Dark Theme
- **Background**: `#0d1b2a` (dark blue)
- **Foreground**: `#ffffff` (white)
- **Primary**: `#00cfe8` (lighter brand blue)
- **Secondary**: `#1a2332` (medium dark blue)
- **Accent**: `#00cfe8` (matches primary)
- **Borders**: `#2a3441` (dark gray-blue)

## Usage

### Manual Theme Switching
Users can switch themes using the theme toggle button located in:
- **Desktop**: Header right side (sun/moon icon)
- **Mobile**: Mobile menu under "Motyw" section

### System Theme Support
- Automatically detects user's system preference
- Updates when system theme changes
- Available as "System" option in theme dropdown

### Developer Usage
```tsx
import { useTheme } from 'next-themes'

function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="bg-background text-foreground">
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to dark
      </button>
    </div>
  )
}
```

## Testing

### Test Page
- **URL**: `/theme-test`
- **Purpose**: Demonstrates all theme features
- **Content**: 
  - Theme toggle functionality
  - Color variable demonstrations
  - UI component examples
  - Instructions for testing

### Manual Testing Steps
1. Visit any page on the site
2. Click the theme toggle (sun/moon icon)
3. Select different theme options
4. Verify colors change appropriately
5. Test system theme detection
6. Check mobile responsive behavior

## Technical Implementation

### CSS Custom Properties Pattern
```css
:root {
  --background: 210 40% 98%;
  --foreground: 0 0% 3.9%;
  /* ... more variables */
}

.dark {
  --background: 219 33% 10%;
  --foreground: 0 0% 98%;
  /* ... dark theme overrides */
}
```

### Tailwind Integration
```css
.bg-background { background-color: hsl(var(--background)); }
.text-foreground { color: hsl(var(--foreground)); }
```

### React Component Pattern
```tsx
<ThemeProvider attribute="class" defaultTheme="light">
  <App />
</ThemeProvider>
```

## Browser Support
- All modern browsers with CSS custom properties support
- Graceful fallback to default colors if custom properties not supported
- SSR-safe with hydration warnings suppressed

## Performance
- No runtime color calculations
- CSS-only theme switching
- Minimal JavaScript overhead
- Cached theme preference in localStorage

## Accessibility
- Respects system accessibility preferences
- High contrast maintained in both themes
- Screen reader friendly theme toggle
- Keyboard navigation support

## Future Enhancements
1. **Additional Themes**: Could add more color schemes (e.g., high contrast)
2. **Theme Customization**: Allow users to create custom themes
3. **Component-Level Themes**: More granular theme control
4. **Animation Options**: Theme transition animations
5. **Theme Scheduling**: Automatic theme switching based on time

## Troubleshooting

### Common Issues
1. **Theme not persisting**: Check localStorage and next-themes configuration
2. **Colors not changing**: Verify CSS custom properties are loaded
3. **Hydration warnings**: Ensure `suppressHydrationWarning` is set
4. **Mobile menu issues**: Check responsive breakpoints in theme toggle

### Debug Steps
1. Inspect CSS custom properties in dev tools
2. Check localStorage for theme preference
3. Verify Tailwind classes are generated
4. Test theme provider context availability

## Files Modified/Created

### Created
- `components/ui/theme-toggle.tsx` - Theme toggle component
- `app/theme-test/page.tsx` - Theme testing page
- `THEME_IMPLEMENTATION.md` - This documentation

### Modified
- `app/layout.tsx` - Added theme provider
- `components/theme-provider.tsx` - Updated configuration
- `styles/motoauto-theme.css` - Added complete theme variables
- `tailwind.config.ts` - Added theme color mappings
- `app/globals.css` - Updated base styles
- `components/header-new.tsx` - Added theme toggle
- `components/layout/header.tsx` - Added theme toggle and updated colors

## Integration with MotoAuto Brand
The theme system maintains MotoAuto.ch's brand identity by:
- Preserving the signature blue (`#009fb7`) as primary color
- Keeping the red accent (`.ch`) in all themes
- Using brand-appropriate color schemes
- Maintaining visual hierarchy and contrast ratios

This implementation provides a solid foundation for theme switching while maintaining the platform's visual identity and user experience standards.
