import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { WithChildren } from 'helpers/types/With.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Heading, Text } from 'theme-ui'
import { fadeInAnimation } from 'theme/animations'
import { arrow_right } from 'theme/icons'

export function ReferralLayout({ children }: WithChildren) {
  const { t } = useTranslation()

  return (
    <Grid sx={{ flex: 1, zIndex: 1 }}>
      <Flex sx={{ mt: '48px', mb: '98px', flexDirection: 'column' }}>
        <>
          <Grid
            columns={[1, null, 1]}
            sx={{
              justifyItems: 'center',
              position: 'relative',
              maxWidth: '688px',
              gap: '8px',
              margin: '0 auto',
              ...fadeInAnimation,
            }}
          >
            <Heading as="h3" variant="header3">
              {t('ref.ref-a-friend')}
            </Heading>
            <Text variant="paragraph2" sx={{ textAlign: 'center', color: 'neutral80' }}>
              {t('ref.intro-1')}{' '}
              <AppLink
                href={EXTERNAL_LINKS.KB.REFER_A_FRIEND}
                target="_blank"
                sx={{
                  fontSize: 3,
                }}
                variant="inText"
              >
                {' '}
                {t('ref.intro-link')}{' '}
                <Icon
                  icon={arrow_right}
                  size="12px"
                  sx={{
                    position: 'relative',
                  }}
                />
              </AppLink>
            </Text>
            {children}
            <Text variant="boldParagraph1" as="p" pt="40px">
              {t('ref.need-help')}
            </Text>
            <AppLink
              variant="inText"
              target="_blank"
              href={EXTERNAL_LINKS.KB.REFER_A_FRIEND}
              sx={{
                pt: '8px',
                fontSize: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {t('ref.help-link-1')}{' '}
              <Icon
                icon={arrow_right}
                size="12px"
                sx={{
                  ml: 1,
                  position: 'relative',
                }}
              />
            </AppLink>
            <AppLink
              variant="inText"
              target="_blank"
              href={EXTERNAL_LINKS.KB.HELP}
              sx={{
                pt: '8px',
                fontSize: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {t('ref.help-link-2')}{' '}
              <Icon
                icon={arrow_right}
                size="12px"
                sx={{
                  ml: 1,
                  position: 'relative',
                }}
              />
            </AppLink>
          </Grid>
        </>
      </Flex>
    </Grid>
  )
}
