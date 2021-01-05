import fs from 'fs'
import { join } from 'path'

export interface GuideMetadata {
  title: string
  summary: string
  featuredImage: string
  readTime: string
  slug: string
}

export interface GuideMainContent {
  [key: string]: any
}

const guidesDirectory = join(process.cwd(), 'components/guides/content')

export function getGuidesSlugs() {
  return fs.readdirSync(guidesDirectory)
}

export function getGuideMetadata(folder: string) {
  const { meta }: { meta: GuideMetadata } = require(`./content/${folder}/${folder}.tsx`)

  return {
    ...meta,
  }
}

export function getGuideMainContent(folder: string) {
  const {
    mainContent,
  }: { mainContent: GuideMainContent } = require(`./content/${folder}/${folder}.tsx`)

  return {
    ...mainContent,
  }
}

export function getAllGuidesMetadata() {
  const folders = getGuidesSlugs()
  const guides = folders.map((folder) => getGuideMetadata(folder))

  return guides
}
