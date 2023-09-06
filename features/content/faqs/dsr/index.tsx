import React from 'react'
import { TranslatedContent } from 'features/content'
import en from 'features/content/faqs/dsr/en.mdx'
import { useScrollToTop } from 'helpers/useScrollToTop'

export const DsrFaq = () => {
  useScrollToTop()

  return <TranslatedContent content={{ en /* es, pt */ }} />
}
