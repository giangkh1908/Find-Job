import { motion } from 'motion/react'

export function HeroSection() {
  return (
    <section className="text-center space-y-2">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
      >
        Hệ Thống Trợ Lý Tìm Việc AI 🚀
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-slate-500 max-w-2xl mx-auto text-lg"
      >
        Tự động hóa việc tìm kiếm và phân tích cơ hội việc làm bằng Playwright & AI.
      </motion.p>
    </section>
  )
}
