// Email styling theme and utilities
export const emailTheme = {
  colors: {
    primary: '#0070f3',
    primaryHover: '#0056b3',
    background: '#ffffff',
    containerBg: '#f9f9f9',
    text: '#444444',
    textMuted: '#666666',
    border: '#e5e5e5'
  },
  fonts: {
    primary: '"Inter", "Helvetica Neue", "Arial", sans-serif',
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px'
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px'
  },
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }
};

export const emailStyles = {
  main: {
    backgroundColor: emailTheme.colors.background,
    padding: emailTheme.spacing.lg,
    fontFamily: emailTheme.fonts.primary
  },
  container: {
    margin: '0 auto',
    padding: emailTheme.spacing.xl,
    maxWidth: '480px',
    backgroundColor: emailTheme.colors.containerBg,
    borderRadius: emailTheme.borderRadius.lg,
    border: `1px solid ${emailTheme.colors.border}`
  },
  heading: {
    fontSize: emailTheme.fonts.sizes['2xl'],
    fontWeight: emailTheme.fonts.weights.bold,
    color: emailTheme.colors.text,
    margin: `0 0 ${emailTheme.spacing.lg} 0`,
    textAlign: 'center' as const
  },
  paragraph: {
    fontSize: emailTheme.fonts.sizes.base,
    lineHeight: '24px',
    color: emailTheme.colors.text,
    margin: `0 0 ${emailTheme.spacing.md} 0`
  },
  button: {
    display: 'inline-block',
    backgroundColor: emailTheme.colors.primary,
    color: '#ffffff',
    padding: `${emailTheme.spacing.md} ${emailTheme.spacing.lg}`,
    borderRadius: emailTheme.borderRadius.md,
    textDecoration: 'none',
    fontWeight: emailTheme.fonts.weights.semibold,
    fontSize: emailTheme.fonts.sizes.base,
    textAlign: 'center' as const,
    border: 'none',
    cursor: 'pointer'
  },
  footer: {
    fontSize: emailTheme.fonts.sizes.sm,
    color: emailTheme.colors.textMuted,
    textAlign: 'center' as const,
    marginTop: emailTheme.spacing.xl,
    paddingTop: emailTheme.spacing.lg,
    borderTop: `1px solid ${emailTheme.colors.border}`
  },
  link: {
    color: emailTheme.colors.primary,
    textDecoration: 'underline',
    wordBreak: 'break-all' as const
  }
};