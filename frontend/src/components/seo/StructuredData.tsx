/**
 * SEO Component - Structured Data (JSON-LD)
 */
import type { Job } from '@/types'

interface WebSiteSchema {
  name: string
  description: string
  url: string
}

export function getWebSiteSchema({ name, description, url }: WebSiteSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Find-Job',
      logo: {
        '@type': 'ImageObject',
        url: `${url}/favicon.svg`,
      },
    },
  }
}

export function getJobPostingSchema(job: Job, index: number) {
  const baseUrl = 'https://findjob.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: `${job.title} tại ${job.company}. Yêu cầu: ${job.experience} kinh nghiệm. Địa điểm: ${job.location}. Lương: ${job.salary}.`,
    identifier: {
      '@type': 'PropertyValue',
      name: job.company,
      value: `job-${job.id || index + 1}`,
    },
    datePosted: new Date().toISOString().split('T')[0],
    validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      sameAs: baseUrl,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressRegion: getRegionFromCity(job.location),
        addressCountry: 'VN',
      },
    },
    skills: job.title,
    experienceRequirements: {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: parseExperience(job.experience),
    },
    baseSalary: job.salary !== 'Thoả thuận' ? {
      '@type': 'MonetaryAmount',
      currency: 'VND',
      value: parseSalary(job.salary),
    } : undefined,
    url: job.link,
  }
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

function getRegionFromCity(city: string): string {
  const regions: Record<string, string> = {
    'hà nội': 'Hanoi',
    'tp hcm': 'Ho Chi Minh',
    'hồ chí minh': 'Ho Chi Minh',
    'đà nẵng': 'Da Nang',
    'hải phòng': 'Hai Phong',
    'cần thơ': 'Can Tho',
  }
  return regions[city.toLowerCase()] || city
}

function parseExperience(exp: string): number | undefined {
  const match = exp.match(/\d+/)
  if (match) {
    return parseInt(match[0]) * 12 // Convert years to months
  }
  if (exp.toLowerCase().includes('không')) return 0
  return undefined
}

function parseSalary(salary: string): string | undefined {
  // Extract number from salary string like "10 - 15 triệu"
  const match = salary.match(/[\d,.]+/)
  if (match) {
    return match[0].replace(',', '.') + '000000' // Convert to VND
  }
  return undefined
}
