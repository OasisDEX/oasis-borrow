import { TranslatedContent } from 'features/content/index'
import React from 'react'

import { useScrollToTop } from '../../../../../helpers/useScrollToTop'
import en from './en.mdx'

export const AaveMultiplyFaq = () => {
  useScrollToTop()
  return <TranslatedContent content={{ en /* es, pt */ }} />
}
