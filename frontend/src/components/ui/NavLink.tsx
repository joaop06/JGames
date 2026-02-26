import { NavLink as RouterNavLink, type NavLinkProps } from 'react-router-dom'

export default function NavLink(props: NavLinkProps) {
  return (
    <RouterNavLink
      style={({ isActive }) => ({
        color: isActive ? 'var(--accent-hover)' : 'var(--accent)',
        fontWeight: isActive ? 700 : 400,
        textDecoration: isActive ? 'underline' : 'none',
        padding: 'var(--space-2) var(--space-3)',
        borderRadius: 'var(--radius-md)',
        transition: 'color var(--transition-fast)',
      })}
      {...props}
    />
  )
}
