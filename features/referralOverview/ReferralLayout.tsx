import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Text } from 'theme-ui'

import { fadeInAnimation } from '../../theme/animations'

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
            <Text variant="text.header2">{t('ref.ref-a-friend')}</Text>
            <Text variant="text.paragraph2" sx={{ textAlign: 'center', color: 'neutral80' }}>
              {t('ref.intro-1')}{' '}
              <AppLink
                href={`https://kb.oasis.app/help/a-step-by-step-guide-to-refer-a-friend`}
                target="_blank"
                sx={{
                  fontSize: 3,
                }}
                variant="inText"
              >
                {' '}
                {t('ref.intro-link')}{' '}
                <Icon
                  name="arrow_right"
                  size="12px"
                  sx={{
                    position: 'relative',
                  }}
                />
              </AppLink>
            </Text>
            {children}
            <Text variant="text.headerSettings" pt="40px" sx={{ fontSize: 4 }}>
              {t('ref.need-help')}
            </Text>
            <AppLink
              variant="inText"
              target="_blank"
              href="https://kb.oasis.app/help/a-step-by-step-guide-to-refer-a-friend"
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
                name="arrow_right"
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
              href="https://kb.oasis.app/help"
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
                name="arrow_right"
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
