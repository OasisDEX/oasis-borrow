import { useTranslation } from 'next-i18next'
import React from 'react'

import { content as cookieContent } from './cookie/cookie'
import { content as privacyContent } from './privacy/privacy'
import { content as supportContent, ContentTypeSupport } from './support/support'
import { content as tosContent } from './tos/tos'

export interface ContentType {
  [key: string]: any | ContentTypeSupport
}

interface ContentVersioned {
  version: string
  content: ContentType
}

export interface Content {
  tos: ContentVersioned
  privacy: ContentVersioned
  support: ContentVersioned
  cookie: ContentVersioned
}

const v1: Content = {
  tos: {
    version: 'version-11.07.2022',
    content: <TranslatedContent content={tosContent} />,
  },
  privacy: {
    version: 'ver-7.7.2022',
    content: <TranslatedContent content={privacyContent} />,
  },
  support: {
    version: 'ver-4.11.2020',
    content: supportContent,
  },
  cookie: {
    version: 'ver-1.7.2022',
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
