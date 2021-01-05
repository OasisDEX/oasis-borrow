import { content as introContent } from './introduction/introduction'
import { content as latam500TosContent } from './latam500Tos/latam500Tos'
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
  latam500Tos: ContentVersioned
  tos: ContentVersioned
  privacy: ContentVersioned
  introduction: ContentVersioned
  support: ContentVersioned
}

const v1: Content = {
  latam500Tos: {
    version: 'ver-2.11.2020',
    content: latam500TosContent,
  },
  tos: {
    version: 'ver-2.11.2020',
    content: tosContent,
  },
  privacy: {
    version: 'ver-2.11.2020',
    content: privacyContent,
  },
  introduction: {
    version: 'ver-27.10.2020',
    content: introContent,
  },
  support: {
    version: 'ver-4.11.2020',
    content: supportContent,
  },
}

export const currentContent: Content = v1
