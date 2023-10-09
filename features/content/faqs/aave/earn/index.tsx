import { TranslatedContent } from 'features/content/index'
import { useScrollToTop } from 'helpers/useScrollToTop'
import React from 'react'

import enV2 from './en_v2'
import enV3 from './en_v3'

export const AaveEarnFaqV2 = () => {
  useScrollToTop()
  return <TranslatedContent content={{ en: enV2 /* es, pt */ }} />
}

export const AaveEarnFaqV3 = () => {
  useScrollToTop()
  return <TranslatedContent content={{ en: enV3 /* es, pt */ }} />
}
