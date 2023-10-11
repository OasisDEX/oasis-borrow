import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { TranslationType } from 'ts_modules/i18next'

export const getNavUseCasesItems = (t: TranslationType) => {
  const translations = t('nav.use-cases-items', { returnObjects: true }) as unknown as {
    title: string
    details: { title: string; description: string }[]
  }[]

  const linkMap = [
    {
      label: t('read-more'),
      url: EXTERNAL_LINKS.DOCS.NAVIGATION[0],
    },
    {
      label: t('read-more'),
      url: EXTERNAL_LINKS.DOCS.NAVIGATION[1],
    },
    {
      label: t('read-more'),
      url: EXTERNAL_LINKS.DOCS.NAVIGATION[2],
    },
  ]

  return [
    ...translations.map((item, i) => ({
      title: item.title,
      list: {
        items: item.details,
        link: linkMap[i],
      },
    })),
  ]
}
