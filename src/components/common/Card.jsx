// Deliberately a plain element, not a Framer Motion component: Dashboard
// (and several other pages) mount up to ~10 Cards at once, and animating
// every single one in simultaneously (opacity + transform, each with its
// own semi-transparent gradient background) overloads the GPU compositor on
// some Android devices, causing real rendering corruption — ghosted/trailing
// duplicate content while scrolling. Confirmed on a real device; not worth
// the decorative fade-in.
export default function Card({ children, className = '', hover = false, as: As = 'div', ...props }) {
  return (
    <As className={`glass-card rounded-2xl shadow-card p-5 ${hover ? 'transition-colors hover:bg-bg-hover/60' : ''} ${className}`} {...props}>
      {children}
    </As>
  )
}
