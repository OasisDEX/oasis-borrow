import { content as tosContent } from './tos/tos'
import { content as privacyContent } from './privacy/privacy'

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
}

export const currentContent: Content = v1
