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
}

const v1: Content = {
  tos: {
    version: 'version-1.06.2021',
    content: tosContent,
  },
  privacy: {
    version: 'ver-1.6.2021',
    content: privacyContent,
  },
  support: {
    version: 'ver-4.11.2020',
    content: supportContent,
  },
}

export const currentContent: Content = v1
