import React from 'react'
import { TranslatedContent } from 'features/content'
import en from 'features/content/faqs/aave/multiply/en.mdx'
import { useScrollToTop } from 'helpers/useScrollToTop'

export const AaveMultiplyFaq = () => {
  useScrollToTop()

  return <TranslatedContent content={{ en /* es, pt */ }} />
}
