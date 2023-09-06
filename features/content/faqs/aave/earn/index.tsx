import React from 'react'
import enV2 from 'features/content/faqs/aave/earn/en_v2.mdx'
import enV3 from 'features/content/faqs/aave/earn/en_v3.mdx'
import { TranslatedContent } from 'features/content/index'
import { useScrollToTop } from 'helpers/useScrollToTop'

export const AaveEarnFaqV2 = () => {
  useScrollToTop()

  return <TranslatedContent content={{ en: enV2 /* es, pt */ }} />
}

export const AaveEarnFaqV3 = () => {
  useScrollToTop()

  return <TranslatedContent content={{ en: enV3 /* es, pt */ }} />
}
