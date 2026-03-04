import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import Input from './Input'

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string },
  'type'
>

export default function PasswordInput({
  label,
  error,
  id,
  style,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <Input
        label={label}
        type={showPassword ? 'text' : 'password'}
        error={error}
        id={id}
        style={{
          ...style,
          paddingRight: '2.75rem',
        }}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        style={{
          position: 'absolute',
          right: 'var(--space-2)',
          top: '2.25rem',
          padding: 'var(--space-1) var(--space-2)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          background: 'transparent',
          color: 'var(--text-muted)',
          fontSize: 'var(--size-sm)',
          cursor: 'pointer',
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
      >
        {showPassword ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  )
}
