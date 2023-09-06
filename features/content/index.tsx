import React from 'react'
import { content as cookieContent } from 'features/content/cookie/cookie'
import { content as privacyContent } from 'features/content/privacy/privacy'
import { content as tosContent } from 'features/content/tos/tos'
import { useTranslation } from 'next-i18next'

export interface ContentType {
  [key: string]: any
}

interface ContentVersioned {
  version: string
  content: ContentType
}

export interface Content {
  tos: ContentVersioned
  privacy: ContentVersioned
  cookie: ContentVersioned
}

const v1: Content = {
  tos: {
    version: 'version-26.06.2023',
    content: <TranslatedContent content={tosContent} />,
  },
  privacy: {
    version: 'ver-26.06.2023',
    content: <TranslatedContent content={privacyContent} />,
  },
  cookie: {
    version: 'ver-26.06.2023',
    content: <TranslatedContent content={cookieContent} />,
  },
}

export function TranslatedContent({ content }: { content: ContentType }) {
  const {
    i18n: { language },
  } = useTranslation()
  const ContentComp = content[language] || content.en

  return <ContentComp />
}

export const currentContent: Content = v1
