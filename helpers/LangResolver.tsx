import React from 'react'
import { ContentType } from 'features/content'
import { useTranslation } from 'next-i18next'

export function LangResolver({ content }: { content: ContentType }) {
  const {
    i18n: { language },
  } = useTranslation()

  console.log('content.en : ', content.en)
  const Content = content[language] || content.en
  console.log('content: ', Content)
  return <Content />
}