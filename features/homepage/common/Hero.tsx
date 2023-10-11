import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { useAppConfig } from 'helpers/config'
import { scrollTo } from 'helpers/scrollTo'
import { useTranslation } from 'next-i18next'
import type { ReactNode } from 'react'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Button, Flex, Grid, Heading, Text } from 'theme-ui'
import { arrow_right } from 'theme/icons'

export function Hero({
  sx,
  isConnected,
  heading,
  headingWidth = '804px',
  subheading,
  subheadingWidth = '740px',
  primaryButton = {
    isVisible: true,
    translationKey: 'find-your-defi-product',
  },
  secondaryButton,
}: {
  sx?: ThemeUIStyleObject
  isConnected: boolean
  heading: string
  headingWidth?: string
  subheading: ReactNode
  subheadingWidth?: string
  primaryButton?: {
    isVisible: boolean
    translationKey: string
  }
  secondaryButton?: {
    link: string
    translationKey: string
  }
}) {
  const { t } = useTranslation()
  const { Referrals: referralsEnabled } = useAppConfig('features')
  const { connecting, connect } = useConnection()

  return (
    <Flex
      sx={{
        position: 'relative',
        justifySelf: 'center',
        alignItems: 'center',
        textAlign: 'center',
        mt: referralsEnabled ? '24px' : '64px',
        mb: 5,
        flexDirection: 'column',
        ...sx,
      }}
    >
      <Heading
        as="h1"
        variant="heroHeader"
        sx={{
          mt: [2, 5],
          mb: [4, 3],
          maxWidth: ['100%', headingWidth],
        }}
      >
        {t(heading)}
      </Heading>
      <Text
        variant="paragraph1"
        as="p"
        sx={{
          display: ['none', 'block'],
          mb: 4,
          color: 'neutral80',
          maxWidth: ['100%', subheadingWidth],
        }}
      >
        {subheading}
      </Text>
      <Grid gap="12px">
        {primaryButton.isVisible && (
          <Button
            variant="primary"
            sx={{
              display: 'flex',
              margin: '0 auto',
              px: '40px',
              py: 2,
              alignItems: 'center',
              '&:hover svg': {
                transform: 'translateX(10px)',
              },
            }}
            onClick={isConnected ? scrollTo('product-hub') : () => connecting || connect()}
          >
            {isConnected ? t(primaryButton.translationKey) : t('connect-wallet')}
            <Icon
              icon={arrow_right}
              sx={{
                ml: 2,
                position: 'relative',
                left: 2,
                transition: '0.2s',
              }}
            />
          </Button>
        )}
        {secondaryButton && (
          <AppLink href={secondaryButton.link}>
            <Button
              variant="action"
              sx={{
                width: '100%',
                height: '52px',
                fontSize: '18px',
                borderColor: 'primary100',
                borderRadius: 'round',
              }}
            >
              {t(secondaryButton.translationKey)}
            </Button>
          </AppLink>
        )}
      </Grid>
    </Flex>
  )
}
