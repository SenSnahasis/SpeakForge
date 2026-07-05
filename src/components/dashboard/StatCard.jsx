import Card from '../common/Card'

export default function StatCard({ icon: Icon, label, value, sublabel, accent = '#3d6bff' }) {
  return (
    <Card className="flex items-center gap-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}22`, color: accent }}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-50">{value}</p>
        {sublabel && <p className="truncate text-xs text-slate-500">{sublabel}</p>}
      </div>
    </Card>
  )
}
