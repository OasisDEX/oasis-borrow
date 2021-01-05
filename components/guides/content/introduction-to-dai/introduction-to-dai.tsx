import { GuideMainContent, GuideMetadata } from 'components/guides/guides'

import en from './en.mdx'
import es from './es.mdx'

export const meta: GuideMetadata = {
  title: 'guides.guide.introduction-to-dai.title',
  summary: 'guides.guide.introduction-to-dai.summary',
  featuredImage: 'static/img/guides/thumbnail_introduction_dai.png',
  readTime: 'guides.guide.introduction-to-dai.readTime',
  slug: 'introduction-to-dai',
}

export const mainContent: GuideMainContent = {
  en,
  es,
}
