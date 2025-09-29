import { css } from '@emotion/react';

// Global theme for the entire application
export const globalTheme = {
  colors: {
    primary: 'hsl(222.2, 84%, 4.9%)',
    primaryForeground: 'hsl(210, 40%, 98%)',
    secondary: 'hsl(210, 40%, 96%)',
    secondaryForeground: 'hsl(222.2, 84%, 4.9%)',
    muted: 'hsl(210, 40%, 96%)',
    mutedForeground: 'hsl(215.4, 16.3%, 46.9%)',
    border: 'hsl(214.3, 31.8%, 91.4%)',
    input: 'hsl(214.3, 31.8%, 91.4%)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
    destructive: 'hsl(0, 84.2%, 60.2%)',
    destructiveForeground: 'hsl(210, 40%, 98%)',
    ring: 'hsl(222.2, 84%, 4.9%)',
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    12: '3rem',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
};

// Common emotion mixins
export const mixins = {
  flexCenter: css`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  flexColumn: css`
    display: flex;
    flex-direction: column;
  `,
  transition: css`
    transition: all 0.2s ease-in-out;
  `,
  focusRing: css`
    &:focus-visible {
      outline: 2px solid ${globalTheme.colors.ring};
      outline-offset: 2px;
    }
  `,
  button: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    border-radius: ${globalTheme.borderRadius.md};
    font-size: ${globalTheme.fontSize.sm};
    font-weight: ${globalTheme.fontWeight.medium};
    cursor: pointer;
    border: none;
    transition: all 0.2s ease-in-out;
    
    &:disabled {
      pointer-events: none;
      opacity: 0.5;
    }
    
    &:focus-visible {
      outline: 2px solid ${globalTheme.colors.ring};
      outline-offset: 2px;
    }
  `,
};