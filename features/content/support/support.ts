import { ContentType } from '..'
import { content as cn } from './cn'
import { content as en } from './en'
import { content as es } from './es'
import { content as pt } from './pt'

export type ContentSectionId =
  | 'buying-dai'
  | 'saving-lending-dai'
  | 'using-oasis'
  | 'using-multiply'
  | 'security'
  | 'using-daiwallet'

export interface ContentQuestion {
  question: string
  answer: string
}

export interface ContentNavigation {
  title: string
  id: ContentSectionId
}

interface ContentSection {
  title: string
  id: ContentSectionId
  questions: ContentQuestion[]
}

export interface ContentTypeSupport {
  title: string
  navigation: ContentNavigation[]
  sections: ContentSection[]
  cantFind: string
  contactLink: string
}

export const content: ContentType = {
  en,
  es,
  pt,
  cn,
}
