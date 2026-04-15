/**
 * SEO Provider - Dynamic meta tags with react-helmet-async
 */
import { HelmetProvider, Helmet } from 'react-helmet-async'

export { Helmet }

export function SeoProvider({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      {children}
    </HelmetProvider>
  )
}
