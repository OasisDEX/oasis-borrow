import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { Trans, useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import React, { useState } from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Grid, Heading, Link, Text } from 'theme-ui'

type FaqLayoutProps = {
  noTitle?: boolean
  learnMoreUrl: string
  contents: {
    title: string
    body: ReactElement
  }[]
}

export function FaqLayout({ noTitle = false, learnMoreUrl, contents }: FaqLayoutProps) {
  const { t } = useTranslation()
  const [sectionId, setSectionId] = useState<string>(contents[0].title)

  const quoteColors = ['success100', 'interactive100', 'primary60']
  const quoteColorsSx = quoteColors.reduce(
    (obj: Record<string, ThemeUIStyleObject>, color, index) => {
      obj[`:nth-of-type(${quoteColors.length}n-${quoteColors.length - index - 1})`] = {
        borderColor: color,
      }
      return obj
    },
    {},
  )

  return (
    <Box>
      {!noTitle && <Text variant="header5">{t('system.faq')}</Text>}
      <Grid sx={{ py: 1, mt: 4 }}>
        {contents.map((anchor) => (
          <Link
            key={anchor.title}
            variant="nav"
            sx={{
              '&, &:hover': { color: sectionId === anchor.title ? 'primary100' : 'primary60' },
              fontSize: '12px',
            }}
            onClick={() => setSectionId(anchor.title)}
          >
            {anchor.title}
          </Link>
        ))}
      </Grid>
      <Box sx={{ my: 4, variant: 'boxes.separator' }} />
      <Grid sx={{ py: 1 }}>
        {contents.map((item) =>
          item.title === sectionId ? (
            <>
              <Box
                sx={{
                  blockquote: {
                    m: 0,
                    pl: 4,
                    py: 3,
                    p: {
                      my: 0,
                    },
                    borderLeft: '8px solid',
                    ...quoteColorsSx,
                  },
                  fontSize: 2,
                  pr: [0, 4],
                }}
              >
                <Heading variant="header5" sx={{ mt: 1, mb: 4 }}>
                  {item.title}
                </Heading>
                {item.body}
              </Box>
            </>
          ) : null,
        )}
      </Grid>
      <Box sx={{ borderRadius: 'mediumLarge', bg: 'neutral30', p: 3, mt: 4 }}>
        <Box sx={{ maxWidth: '455px' }}>
          <Text variant="paragraph3" sx={{ fontWeight: 'bold', mb: 2 }}>
            {t('simulate-faq.learn-more-heading')}
          </Text>
          <Box>
            <Text variant="paragraph3" sx={{ a: { fontWeight: 'normal' } }}>
              <Trans
                i18nKey="simulate-faq.learn-more-body"
                components={[
                  <AppLink key="learn-more-link-1" href={learnMoreUrl} />,
                  <AppLink key="learn-more-link-2" href={EXTERNAL_LINKS.DISCORD} />,
                ]}
              />
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
