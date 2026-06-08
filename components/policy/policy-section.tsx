import type { ReactNode } from 'react'

export function PolicySection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-2">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
