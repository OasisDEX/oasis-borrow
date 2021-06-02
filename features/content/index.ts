import { content as tosContent } from './tos/tos'

export interface ContentType {
  [key: string]: any
}

interface ContentVersioned {
  version: string
  content: ContentType
}

export interface Content {
  tos: ContentVersioned
}

const v1: Content = {
  tos: {
    version: 'version-1.06.2021',
    content: tosContent,
  },
}

export const currentContent: Content = v1
