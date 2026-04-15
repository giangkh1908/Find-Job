import { Globe, CheckCircle2 } from 'lucide-react'
import { PLATFORMS } from '@/constants'

export interface PlatformSelectorProps {
  selected: string[]
  onToggle: (id: string) => void
}

export function PlatformSelector({ selected, onToggle }: PlatformSelectorProps) {
  return (
    <section className="card p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-brand" />
        <h3 className="font-bold text-slate-800">Nền tảng Mục tiêu</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 flex-grow">
        {PLATFORMS.map((platform) => (
          <button
            key={platform.id}
            onClick={() => onToggle(platform.id)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              selected.includes(platform.id)
                ? 'border-brand bg-brand/5 ring-1 ring-brand/20'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selected.includes(platform.id) ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {platform.icon}
            </div>
            <div className="flex-grow">
              <span
                className={`font-semibold ${
                  selected.includes(platform.id) ? 'text-brand' : 'text-slate-700'
                }`}
              >
                {platform.name}
              </span>
            </div>
            {selected.includes(platform.id) && <CheckCircle2 className="w-5 h-5 text-brand" />}
          </button>
        ))}
      </div>
    </section>
  )
}
