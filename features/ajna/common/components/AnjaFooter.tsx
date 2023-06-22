import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex } from 'theme-ui'

const content = [
  {
    titleTranslationKey: 'ajna.title',
    link: EXTERNAL_LINKS.AJNA.HOME,
  },
  {
    titleTranslationKey: 'nav.app',
    link: INTERNAL_LINKS.homepage,
  },
  {
    titleTranslationKey: 'nav.terms',
    link: INTERNAL_LINKS.terms,
  },
  {
    titleTranslationKey: 'nav.privacy',
    link: INTERNAL_LINKS.privacy,
  },
]

export function AnjaFooter() {
  const { t } = useTranslation()
  return (
    <Flex sx={{ justifyContent: 'center' }}>
      <Flex
        as="ul"
        sx={{
          my: '48px',
          gap: [5, 5],
          width: 'fit-content',
          flexWrap: 'wrap',
          pl: 0,
          flexDirection: ['column', 'row'],
          textAlign: 'center',
        }}
      >
        {content.map((item) => (
          <AppLink
            href={item.link}
            key={item.titleTranslationKey}
            sx={{
              fontWeight: 'regular',
              fontSize: 3,
              color: 'interactive100',
              '&:hover': { color: 'neutral80' },
            }}
          >
            {t(item.titleTranslationKey)}
          </AppLink>
        ))}
      </Flex>
    </Flex>
  )
}
