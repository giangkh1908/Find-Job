import { AnimatePresence } from 'motion/react'
import { Header, Footer } from '@/components/layout'
import { HeroSection, SearchCriteria, PlatformSelector, SearchConfig, ResultsTable } from '@/components/home'
import { ActionButton } from '@/components/ui'
import { useJobSearch } from '@/hooks'
import { Helmet } from '@/components/seo'
import { getWebSiteSchema, getJobPostingSchema } from '@/components/seo'

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

  const websiteSchema = getWebSiteSchema({
    name: 'Find-Job',
    description: 'Tìm việc làm với AI thông minh',
    url: 'https://findjob.com',
  })

  return (
    <>
      <Helmet>
        <title>{results.length > 0 ? `Tìm thấy ${results.length} việc làm "${prompt}" | Find-Job` : 'Tìm Việc Làm - AI Job Aggregator | Find-Job'}</title>
        <meta name="description" content={results.length > 0 ? `Tìm thấy ${results.length} việc làm phù hợp với "${prompt}". Tìm việc nhanh chóng với AI.` : 'Tìm kiếm việc làm với AI thông minh. Nhập yêu cầu bằng ngôn ngữ tự nhiên.'} />
        {prompt && <meta name="keywords" content={prompt} />}
      </Helmet>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {results.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: results.slice(0, 10).map((job, i) => getJobPostingSchema(job, i)),
            }),
          }}
        />
      )}

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
    </>
  )
}
