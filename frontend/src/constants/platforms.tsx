import { Linkedin, Briefcase, Globe } from 'lucide-react'
import type { Platform } from '@/types'
import topcvLogo from '@/assets/platforms/topcv.png'

export const PLATFORMS: Platform[] = [
  { id: 'TopCV', name: 'TopCV', icon: <img src={topcvLogo} alt="TopCV" className="w-5 h-5 object-contain" /> },
  { id: 'LinkedIn', name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" /> },
  { id: 'ITviec', name: 'ITviec', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'Custom', name: 'Web Tự Chọn (AI Quét)', icon: <Globe className="w-5 h-5" /> },
]
