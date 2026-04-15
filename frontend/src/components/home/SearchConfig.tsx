import { SlidersHorizontal, MapPin, Hash } from 'lucide-react'

export interface SearchConfigProps {
  maxResults: number
  onMaxResultsChange: (value: number) => void
  location: string
  onLocationChange: (value: string) => void
}

const maxResultsOptions = [10, 20, 30, 50]

export function SearchConfig({ maxResults, onMaxResultsChange, location, onLocationChange }: SearchConfigProps) {
  return (
    <section className="card p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <SlidersHorizontal className="w-5 h-5 text-brand" />
        <h3 className="font-bold text-slate-800">Cấu hình Tìm kiếm</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
            <Hash className="w-4 h-4 text-slate-400" />
            Số lượng kết quả
          </label>
          <div className="flex gap-2">
            {maxResultsOptions.map(option => (
              <button
                key={option}
                onClick={() => onMaxResultsChange(option)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  maxResults === option
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
            <MapPin className="w-4 h-4 text-slate-400" />
            Địa điểm
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="VD: Hồ Chí Minh, Hà Nội, Đà Nẵng..."
            className="input-field"
          />
        </div>
      </div>
    </section>
  )
}