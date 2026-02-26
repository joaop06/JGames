import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'success' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--gradient-accent)',
    color: '#fff',
    border: 0,
    boxShadow: '0 0 16px var(--glow)',
  },
  success: {
    background: 'var(--success)',
    color: '#fff',
    border: 0,
  },
  danger: {
    background: 'var(--danger)',
    color: '#fff',
    border: 0,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
  },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--size-sm)' },
  md: { padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--size-base)' },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    font: 'inherit',
    borderRadius: 'var(--radius-md)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'opacity var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)',
    opacity: disabled || loading ? 0.7 : 1,
    ...variantStyles[variant],
    ...sizeStyles[size],
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      style={{ ...baseStyle, ...style }}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  )
}
