import { TranslatedContent } from 'features/content'
import React from 'react'

import { useScrollToTop } from '../../../../helpers/useScrollToTop'
import en from './en.mdx'

export const AaveFaq = () => {
  useScrollToTop()
  return <TranslatedContent content={{ en /* es, pt */ }} />
}
