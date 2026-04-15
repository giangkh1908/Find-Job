import { motion } from 'motion/react'
import { Zap, Loader2, ExternalLink, AlertCircle } from 'lucide-react'
import type { Job } from '@/types'

export interface ResultsTableProps {
  results: Job[]
  isSearching: boolean
  error?: string | null
  progress?: number
}

export function ResultsTable({ results, isSearching, error, progress = 0 }: ResultsTableProps) {
  if (error) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="p-8 flex flex-col items-center justify-center space-y-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-slate-500">Vui lòng thử lại sau</p>
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="card"
    >
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Kết quả tìm kiếm
        </h3>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {results.length} công việc tìm thấy
        </span>
      </div>

      {isSearching && (
        <div className="p-8 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-brand animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Đang quét dữ liệu từ các nền tảng...</p>
          {progress > 0 && (
            <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Chức danh</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Công ty</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Lương</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">KN</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Địa điểm</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((job, index) => (
                <motion.tr
                  key={job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-400">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{job.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{job.company}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 font-bold text-xs">
                      {job.salary}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{job.experience}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{job.location}</td>
                  <td className="px-6 py-4 text-sm">
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:text-brand-hover p-2 rounded-lg hover:bg-brand/10 transition-all inline-flex items-center gap-1 font-semibold"
                    >
                      Xem <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isSearching && results.length === 0 && (
        <div className="p-12 flex flex-col items-center justify-center space-y-4">
          <Zap className="w-10 h-10 text-slate-300" />
          <p className="text-slate-500 font-medium">Chưa có kết quả tìm kiếm</p>
          <p className="text-sm text-slate-400">Nhập từ khóa và bấm "Bắt Đầu Tìm Dữ liệu"</p>
        </div>
      )}
    </motion.section>
  )
}
