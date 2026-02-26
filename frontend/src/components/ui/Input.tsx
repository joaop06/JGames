import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export default function Input({ label, error, id, style, ...props }: InputProps) {
  const inputId = id ?? `input-${label.replace(/\s/g, '-').toLowerCase()}`
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <label
        htmlFor={inputId}
        style={{
          display: 'block',
          marginBottom: 'var(--space-1)',
          fontSize: 'var(--size-sm)',
          color: 'var(--text-primary)',
        }}
      >
        {label}
      </label>
      <input
        id={inputId}
        style={{
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elevated)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          color: 'var(--text-primary)',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          ...style,
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          style={{
            color: 'var(--danger)',
            fontSize: 'var(--size-sm)',
            marginTop: 'var(--space-1)',
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
