// Henüz yapılmamış modüller için geçici ekran.
export default function Placeholder({ title, description }) {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-400">
        {description}
      </div>
    </div>
  )
}
