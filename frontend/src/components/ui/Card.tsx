import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Se true, aplica sombra com leve glow no accent (estilo arcade) */
  glow?: boolean
}

export default function Card({ glow = false, style, children, ...props }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-5)',
        boxShadow: glow ? 'var(--shadow-card), 0 0 0 1px var(--accent)' : 'var(--shadow-card)',
        transition: 'box-shadow var(--transition-fast)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
