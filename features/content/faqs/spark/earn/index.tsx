import { TranslatedContent } from 'features/content/index'
import { useScrollToTop } from 'helpers/useScrollToTop'
import React from 'react'

import enV3 from './en_v3.mdx'

export const SparkEarnFaqV3 = () => {
  useScrollToTop()
  return <TranslatedContent content={{ en: enV3 /* es, pt */ }} />
}
