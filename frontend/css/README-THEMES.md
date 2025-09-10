# Velora Theme System

## Overview
Velora uses a modular theme system with separate CSS files for light and dark modes, making it easy to customize each theme independently without affecting the other.

## File Structure
```
frontend/css/
├── themes.css          # Base theme configuration
├── dark-theme.css      # Dark theme styles
├── light-theme.css     # Light theme styles
├── theme-config.js     # Theme configuration object
└── styles.css          # Main application styles
```

## Theme Files

### 1. `themes.css` - Base Configuration
- Contains base CSS variables
- Theme transition animations
- Fallback values

### 2. `dark-theme.css` - Dark Theme
- **Colors**: Indigo Pulse Mobility palette
- **Background**: Rich Black (#0A0A12)
- **Surface**: Deep Indigo (#161632)
- **Text**: Light colors for dark backgrounds
- **Special Effects**: Glows, darker shadows

### 3. `light-theme.css` - Light Theme  
- **Colors**: Clean & Professional palette
- **Background**: Pure White (#FFFFFF)
- **Surface**: Light Gray (#F8F9FA)
- **Text**: Dark colors for light backgrounds
- **Special Effects**: Subtle shadows, light effects

## How It Works

### Dynamic Loading
- JavaScript dynamically loads the appropriate theme CSS file
- Uses `<link id="theme-css">` element to swap stylesheets
- Prevents flashing during theme switches

### Theme Switching Process
1. User clicks theme toggle button
2. JavaScript adds `theme-switching` class (disables transitions)
3. Swaps CSS file (`dark-theme.css` ↔ `light-theme.css`)
4. Updates HTML `data-theme` attribute
5. Saves preference to localStorage
6. Removes `theme-switching` class
7. Updates toggle icon

## Customization Guide

### Adding New Themes
1. Create new CSS file (e.g., `custom-theme.css`)
2. Define all required CSS variables
3. Add theme to `theme-config.js`
4. Update JavaScript theme switcher

### Modifying Existing Themes
- **Dark Theme**: Edit `dark-theme.css` only
- **Light Theme**: Edit `light-theme.css` only
- Changes won't affect the other theme

### CSS Variables Reference
```css
/* Core Brand Colors */
--primary-base: #5A31F4;
--secondary-accent: #2CE5FF / #1AD1FF;
--highlight-accent: #20E3B2 / #00F59C;
--alert-warning: #FF4ECD / #FF3EA5;

/* Theme-Specific Variables */
--bg-primary: Background color
--bg-secondary: Secondary background
--surface: Card/component backgrounds
--surface-glow: Hover/active states
--text-primary: Main text color
--text-secondary: Secondary text color
--border: Border color
--shadow: Box shadow values
--glass-bg: Navbar background
--glass-bg-scrolled: Navbar background when scrolled
```

## Best Practices

### 1. Component-Specific Overrides
```css
/* Dark Theme */
.my-component {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
}

.my-component:hover {
    background: var(--surface-glow);
    box-shadow: 0 4px 12px rgba(90, 49, 244, 0.3);
}
```

### 2. Theme-Specific Animations
```css
/* Dark Theme - Glowing effects */
@keyframes darkPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(90, 49, 244, 0.3); }
    50% { box-shadow: 0 0 30px rgba(90, 49, 244, 0.6); }
}

/* Light Theme - Subtle effects */
@keyframes lightPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(90, 49, 244, 0.1); }
    50% { box-shadow: 0 0 30px rgba(90, 49, 244, 0.2); }
}
```

### 3. Responsive Considerations
- Both themes support full responsive design
- Mobile-specific overrides can be added to each theme file
- Use consistent breakpoints across themes

## Testing Themes
1. Start the server: `npm start`
2. Open `http://localhost:3000`
3. Click the theme toggle button (sun/moon icon)
4. Verify smooth transitions
5. Test all components in both themes
6. Check localStorage persistence

## Performance Notes
- Only one theme CSS file loads at a time
- Theme switching is instant (no loading delay)
- CSS variables provide consistent performance
- Transitions are optimized to prevent layout thrashing

## Troubleshooting

### Theme Not Switching
- Check console for JavaScript errors
- Verify theme CSS files exist
- Ensure `theme-css` link element has correct ID

### Styles Not Applied
- Check CSS variable names match
- Verify file paths are correct
- Clear browser cache if needed

### Flashing During Switch
- Ensure `theme-switching` class is applied/removed properly
- Check transition timings in `themes.css`
