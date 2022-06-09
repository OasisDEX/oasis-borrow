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

export function getCareerFileNames() {
  const allFiles = fs.readdirSync(join(process.cwd(), 'features/careers/listings'))
  return allFiles.filter((file) => file.endsWith('.mdx'))
}

export async function getCareerByFileName(fileName: string): Promise<Career> {
  const { meta } = await import(`features/careers/listings/${fileName}`)
  return {
    ...meta,
    slug: slugify(fileName),
  }
}
