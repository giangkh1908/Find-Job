import { AnimatePresence } from 'motion/react'
import { Header, Footer } from '@/components/layout'
import { HeroSection, SearchCriteria, PlatformSelector, SearchConfig, ResultsTable } from '@/components/home'
import { ActionButton } from '@/components/ui'
import { useJobSearch } from '@/hooks'

export default function HomePage() {
  const {
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
  } = useJobSearch()

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <HeroSection />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SearchCriteria value={prompt} onChange={setPrompt} />

            <SearchConfig
              maxResults={maxResults}
              onMaxResultsChange={setMaxResults}
              location={location}
              onLocationChange={setLocation}
            />
          </div>

          <div className="space-y-8">
            <PlatformSelector selected={selectedPlatforms} onToggle={togglePlatform} />
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <ActionButton onClick={search} disabled={isSearching || !prompt.trim() || selectedPlatforms.length === 0} isLoading={isSearching}>
            🚀 Bắt Đầu Tìm Dữ liệu
          </ActionButton>
        </div>

        <AnimatePresence>
          {(results.length > 0 || isSearching || searchError) && (
            <ResultsTable 
              results={results} 
              isSearching={isSearching} 
              error={searchError}
              progress={searchProgress}
            />
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
