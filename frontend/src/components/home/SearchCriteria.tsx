import { Search } from 'lucide-react'

export interface SearchCriteriaProps {
  value: string
  onChange: (value: string) => void
}

export function SearchCriteria({ value, onChange }: SearchCriteriaProps) {
  return (
    <section className="card p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-5 h-5 text-brand" />
        <h3 className="font-bold text-slate-800">Tiêu chí Tìm kiếm</h3>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="VD: công việc marketing dưới 1 năm kinh nghiệm...."
          className="input-field pl-11"
        />
      </div>
    </section>
  )
}
