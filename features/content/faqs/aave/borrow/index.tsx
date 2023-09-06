import React from 'react'
import { TranslatedContent } from 'features/content'
import en from 'features/content/faqs/aave/borrow/en.mdx'
import { useScrollToTop } from 'helpers/useScrollToTop'

export const AaveBorrowFaq = () => {
  useScrollToTop()

  return <TranslatedContent content={{ en /* es, pt */ }} />
}
