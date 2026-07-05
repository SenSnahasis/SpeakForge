import Card from '../common/Card'

export default function ChartCard({ title, subtitle, children, height = 220 }) {
  return (
    <Card>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div style={{ width: '100%', height }}>{children}</div>
    </Card>
  )
}
