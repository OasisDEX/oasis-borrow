import { ContentType } from 'features/content'
import { useTranslation } from 'next-i18next'

export function LangResolver(content: ContentType) {
  const {
    i18n: { language },
  } = useTranslation()

  const Content = content[language || 'en']

  return <Content />
}