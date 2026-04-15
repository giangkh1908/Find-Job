import type { Job } from '@/types'

const API_BASE = '/api'

export interface SearchJobsPayload {
  prompt: string
  platforms: string[]
  maxResults?: number
  location?: string
}

export interface JobSearchResult {
  jobs: Job[]
  aiAnalysis: {
    keywords: string[]
    experienceFilter: string | null
    locationFilter: string | null
    scrapedJobs: number
    filteredJobs: number
    finalJobs: number
  }
  locationStats: Array<{ city: string; count: number }>
  summary: string
}

interface SearchCreateResponse {
  searchId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  pollIntervalMs?: number
  message?: string
}

interface SearchStatusResponse {
  searchId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  resultCount: number
  error: string | null
}

interface SearchResultResponse {
  searchId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  resultCount: number
  jobs: Job[]
  aiAnalysis?: JobSearchResult['aiAnalysis']
  locationStats?: JobSearchResult['locationStats']
  summary?: string
  error: string | null
}

interface SearchJobsOptions {
  timeoutMs?: number
  onStatusChange?: (status: SearchStatusResponse) => void
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data.data as T
}

async function createSearch(payload: SearchJobsPayload): Promise<SearchCreateResponse> {
  return fetchApi<SearchCreateResponse>('/jobs/search', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

async function getSearchStatus(searchId: string): Promise<SearchStatusResponse> {
  return fetchApi<SearchStatusResponse>(`/jobs/${searchId}/status`)
}

async function getSearchResults(searchId: string): Promise<SearchResultResponse> {
  return fetchApi<SearchResultResponse>(`/jobs/${searchId}/results`)
}

export async function searchJobs(
  payload: SearchJobsPayload,
  options: SearchJobsOptions = {}
): Promise<JobSearchResult> {
  const startedAt = Date.now()
  const timeoutMs = options.timeoutMs ?? 120000

  const created = await createSearch(payload)
  const pollIntervalMs = created.pollIntervalMs ?? 2000

  while (Date.now() - startedAt < timeoutMs) {
    const status = await getSearchStatus(created.searchId)
    options.onStatusChange?.(status)

    if (status.status === 'completed') {
      const result = await getSearchResults(created.searchId)
      return {
        jobs: result.jobs,
        aiAnalysis: result.aiAnalysis || {
          keywords: [],
          experienceFilter: null,
          locationFilter: null,
          scrapedJobs: 0,
          filteredJobs: 0,
          finalJobs: 0,
        },
        locationStats: result.locationStats || [],
        summary: result.summary || '',
      }
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Job search failed')
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
  }

  throw new Error('Search timeout. Please try again.')
}