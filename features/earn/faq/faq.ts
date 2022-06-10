import fs from 'fs'
import { join } from 'path'

export interface Career {
  title: string
  location: string
  area: string
  slug: string
}
export function slugify(name: string) {
  return name.replace(/\.mdx$/, '')
}

export function getFaqFileNames() {
  const allFiles = fs.readdirSync(join(process.cwd(), 'features/earn/faq'))
  return allFiles.filter((file) => file.endsWith('.mdx'))
}

export async function getFaqByFileName(fileName: string): Promise<Career> {
  const { meta } = await import(`features/earn/listings/${fileName}`)
  return {
    ...meta,
    slug: slugify(fileName),
  }
}

export function EarnFaq({ faqName } : { faqName: string }) {

}