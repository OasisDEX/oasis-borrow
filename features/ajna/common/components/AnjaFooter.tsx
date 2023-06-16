import { AppLink } from 'components/Links'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex } from 'theme-ui'

const content = [
  {
    titleTranslationKey: 'ajna.title',
    link: 'https://www.ajna.finance/',
  },
  {
    titleTranslationKey: 'seo.default.title',
    link: 'https://summer.fi',
  },
  {
    titleTranslationKey: 'nav.terms',
    link: 'https://summer.fi/ajna',
  },
  {
    titleTranslationKey: 'nav.privacy',
    link: 'https://summer.fi/ajna',
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
              fontSize: 4,
              color: 'primary',
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
