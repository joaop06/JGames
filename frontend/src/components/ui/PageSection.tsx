import type { HTMLAttributes } from 'react'

type PageSectionProps = HTMLAttributes<HTMLElement> & {
  title: string
}

export default function PageSection({ title, children, style, ...props }: PageSectionProps) {
  return (
    <section
      style={{
        marginBottom: 'var(--space-6)',
        ...style,
      }}
      {...props}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--size-lg)',
          marginBottom: 'var(--space-4)',
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}
