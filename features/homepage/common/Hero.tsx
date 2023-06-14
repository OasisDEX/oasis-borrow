import { Icon } from '@makerdao/dai-ui-icons'
import { useConnection } from 'features/web3OnBoard'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Button, Flex, Heading, SxStyleProp, Text } from 'theme-ui'

export function Hero({
  sx,
  isConnected,
  heading,
  subheading,
  showButton = true,
}: {
  sx?: SxStyleProp
  isConnected: boolean
  heading: string
  subheading: ReactNode
  showButton?: boolean
}) {
  const { t } = useTranslation()
  const referralsEnabled = useFeatureToggle('Referrals')
  const { connecting, connect } = useConnection({
    initialConnect: true,
  })

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
      <Heading as="h1" variant="heroHeader" sx={{ mt: 5, mb: 3, maxWidth: ['100%', '700px'] }}>
        {t(heading)}
      </Heading>
      <Text variant="paragraph1" sx={{ mb: 4, color: 'neutral80', maxWidth: ['100%', '450px'] }}>
        {subheading}
      </Text>
      {showButton && (
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
          onClick={async () => connecting || (await connect())}
        >
          {isConnected ? t('find-your-defi-product') : t('connect-wallet')}
          <Icon
            name="arrow_right"
            sx={{
              ml: 2,
              position: 'relative',
              left: 2,
              transition: '0.2s',
            }}
          />
        </Button>
      )}
    </Flex>
  )
}
