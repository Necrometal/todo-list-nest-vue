import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

/**
 * Bridges PrimeVue's design tokens to the shadcn CSS variables in
 * src/assets/theme.css. Values are `var(--token)` references (not
 * copied colors), so editing theme.css re-themes PrimeVue too, and
 * light/dark switching follows the existing `.dark` class for free.
 */
export const ShadcnPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      xs: 'calc(var(--radius) - 6px)',
      sm: 'calc(var(--radius) - 4px)',
      md: 'calc(var(--radius) - 2px)',
      lg: 'var(--radius)',
      xl: 'calc(var(--radius) + 4px)',
    },
  },
  semantic: {
    primary: {
      color: 'var(--primary)',
      contrastColor: 'var(--primary-foreground)',
      hoverColor: 'color-mix(in oklab, var(--primary), black 10%)',
      activeColor: 'color-mix(in oklab, var(--primary), black 20%)',
    },
    formField: {
      background: 'var(--background)',
      disabledBackground: 'var(--muted)',
      filledBackground: 'var(--muted)',
      filledHoverBackground: 'var(--muted)',
      filledFocusBackground: 'var(--muted)',
      borderColor: 'var(--border)',
      hoverBorderColor: 'var(--ring)',
      focusBorderColor: 'var(--ring)',
      invalidBorderColor: 'var(--destructive)',
      color: 'var(--foreground)',
      disabledColor: 'var(--muted-foreground)',
      placeholderColor: 'var(--muted-foreground)',
      invalidPlaceholderColor: 'var(--destructive)',
      iconColor: 'var(--muted-foreground)',
    },
    content: {
      background: 'var(--card)',
      hoverBackground: 'var(--accent)',
      borderColor: 'var(--border)',
      color: 'var(--card-foreground)',
      hoverColor: 'var(--accent-foreground)',
    },
    overlay: {
      select: {
        background: 'var(--popover)',
        borderColor: 'var(--border)',
        color: 'var(--popover-foreground)',
      },
      popover: {
        background: 'var(--popover)',
        borderColor: 'var(--border)',
        color: 'var(--popover-foreground)',
      },
      modal: {
        background: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--card-foreground)',
      },
    },
    text: {
      color: 'var(--foreground)',
      hoverColor: 'var(--foreground)',
      mutedColor: 'var(--muted-foreground)',
      hoverMutedColor: 'var(--muted-foreground)',
    },
    highlight: {
      background: 'var(--accent)',
      focusBackground: 'var(--accent)',
      color: 'var(--accent-foreground)',
      focusColor: 'var(--accent-foreground)',
    },
  },
})
