/**
 * Landing Page - Public homepage showcasing the product
 */
import { Link } from 'react-router-dom'
import { Search, Sparkles, Zap, Shield, TrendingUp, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Find-Job</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-brand hover:bg-brand-hover text-white font-medium rounded-lg transition-colors"
              >
                Bắt đầu ngay
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Công nghệ AI tiên tiến</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Tìm việc làm dễ dàng
            <br />
            <span className="text-brand">với AI thông minh</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Nhập yêu cầu bằng ngôn ngữ tự nhiên. AI sẽ tìm kiếm và gợi ý 
            việc làm phù hợp với kỹ năng và kinh nghiệm của bạn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg shadow-brand/25"
            >
              Tìm việc ngay - Miễn phí
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-lg border border-slate-200 transition-colors"
            >
              Đăng nhập
            </Link>
          </div>

          {/* Demo Search Box */}
          <div className="mt-16 p-6 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
            <p className="text-sm text-slate-500 mb-4">Ví dụ tìm kiếm:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Kế toán dưới 1 năm kinh nghiệm',
                'Marketing Hồ Chí Minh',
                'Lập trình viên NodeJS',
                'Nhân sự 3-5 năm kinh nghiệm',
              ].map((example) => (
                <Link
                  key={example}
                  to="/register"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm transition-colors"
                >
                  {example}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tại sao chọn Find-Job?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Chúng tôi sử dụng AI để mang đến trải nghiệm tìm việc tốt nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI thông minh',
                description: 'Phân tích yêu cầu của bạn bằng ngôn ngữ tự nhiên và tìm việc phù hợp nhất.',
              },
              {
                icon: Zap,
                title: 'Tìm kiếm nhanh',
                description: 'Kết quả trong vài giây với công nghệ tìm kiếm thông minh từ nhiều nguồn.',
              },
              {
                icon: TrendingUp,
                title: 'Lọc theo kinh nghiệm',
                description: 'Lọc việc theo mức kinh nghiệm phù hợp với bạn, từ fresher đến senior.',
              },
              {
                icon: Search,
                title: 'Nhiều nguồn tuyển dụng',
                description: 'Tổng hợp việc làm từ TopCV, LinkedIn, ITviec và nhiều nguồn khác.',
              },
              {
                icon: Shield,
                title: 'An toàn & Bảo mật',
                description: 'Thông tin cá nhân của bạn được bảo vệ an toàn.',
              },
              {
                icon: Users,
                title: 'Dễ sử dụng',
                description: 'Giao diện thân thiện, đơn giản, ai cũng có thể sử dụng được.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl border border-slate-100 hover:border-brand/20 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Cách hoạt động
            </h2>
            <p className="text-lg text-slate-600">
              Chỉ 3 bước đơn giản để tìm việc ưng ý
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Nhập yêu cầu',
                description: 'Mô tả công việc bạn muốn bằng ngôn ngữ tự nhiên',
              },
              {
                step: '02',
                title: 'AI phân tích',
                description: 'Hệ thống AI phân tích và tìm kiếm việc phù hợp',
              },
              {
                step: '03',
                title: 'Nhận kết quả',
                description: 'Xem danh sách việc làm đã được lọc và xếp hạng',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-brand text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-brand">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Sẵn sàng tìm việc mới?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Đăng ký miễn phí ngay hôm nay và bắt đầu tìm kiếm việc làm ưng ý
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-brand hover:bg-slate-100 font-semibold rounded-xl text-lg transition-colors"
          >
            Bắt đầu tìm việc miễn phí
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Find-Job</span>
            </div>
            <p className="text-sm">
              © 2026 Find-Job. Tìm việc thông minh với AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
