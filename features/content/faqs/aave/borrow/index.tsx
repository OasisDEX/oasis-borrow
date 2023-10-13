import { TranslatedContent } from 'features/content'
import { useScrollToTop } from 'helpers/useScrollToTop'
import React from 'react'

import en from './en'

export const AaveBorrowFaq = () => {
  useScrollToTop()
  return <TranslatedContent content={{ en /* es, pt */ }} />
}
