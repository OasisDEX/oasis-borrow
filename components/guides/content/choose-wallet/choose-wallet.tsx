import { GuideMainContent, GuideMetadata } from 'components/guides/guides'

import en from './en.mdx'
import es from './es.mdx'

export const meta: GuideMetadata = {
  title: 'guides.guide.choose-wallet.title',
  summary: 'guides.guide.choose-wallet.summary',
  featuredImage: 'static/img/guides/thumbnail_choose_wallet.png',
  readTime: 'guides.guide.choose-wallet.readTime',
  slug: 'choose-wallet',
}

export const mainContent: GuideMainContent = {
  en,
  es,
}
