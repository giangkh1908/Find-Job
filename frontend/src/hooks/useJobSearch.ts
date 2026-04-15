import { useState, useCallback } from 'react'
import type { Job } from '@/types'
import { searchJobs, type JobSearchResult } from '@/api/jobApi'

export function useJobSearch() {
  const [prompt, setPrompt] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['TopCV'])
  const [maxResults, setMaxResults] = useState(20)
  const [location, setLocation] = useState('')
  const [results, setResults] = useState<Job[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchProgress, setSearchProgress] = useState(0)
  const [aiAnalysis, setAiAnalysis] = useState<JobSearchResult['aiAnalysis'] | null>(null)
  const [locationStats, setLocationStats] = useState<JobSearchResult['locationStats']>([])
  const [summary, setSummary] = useState('')

  const togglePlatform = useCallback((id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }, [])

  const search = useCallback(async () => {
    if (!prompt.trim() || selectedPlatforms.length === 0) return

    setIsSearching(true)
    setSearchError(null)
    setSearchProgress(0)
    setAiAnalysis(null)
    setLocationStats([])
    setSummary('')
    try {
      const result = await searchJobs(
        {
          prompt: prompt.trim(),
          platforms: selectedPlatforms,
          maxResults,
          location: location.trim() || undefined,
        },
        {
          onStatusChange: (status) => {
            setSearchProgress(status.progress)
          },
        }
      )
      setResults(result.jobs)
      setAiAnalysis(result.aiAnalysis)
      setLocationStats(result.locationStats)
      setSummary(result.summary)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed'
      setSearchError(message)
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }, [prompt, selectedPlatforms, maxResults, location])

  return {
    prompt,
    setPrompt,
    selectedPlatforms,
    togglePlatform,
    maxResults,
    setMaxResults,
    location,
    setLocation,
    results,
    isSearching,
    searchError,
    searchProgress,
    search,
    aiAnalysis,
    locationStats,
    summary,
  }
}