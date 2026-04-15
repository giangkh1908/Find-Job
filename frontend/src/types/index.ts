export interface Job {
  id: number
  title: string
  company: string
  salary: string
  experience: string
  location: string
  link: string
}

export interface Platform {
  id: string
  name: string
  icon: React.ReactNode
}

export interface SearchConfig {
  headlessMode: boolean
  useRealProfile: boolean
  selectedPlatforms: string[]
}
