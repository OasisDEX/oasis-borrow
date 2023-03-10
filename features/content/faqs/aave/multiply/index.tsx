import { TranslatedContent } from 'features/content/index'
import { useScrollToTop } from 'helpers/useScrollToTop'
import React from 'react'

import en from './en.mdx'

export const AaveMultiplyFaq = () => {
  useScrollToTop()
  return <TranslatedContent content={{ en /* es, pt */ }} />
}
