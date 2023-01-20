import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Heading } from 'theme-ui'

export function ConnectWalletPrompt() {
  const { t } = useTranslation()
  const { context$ } = useAppContext()
  const [contextData] = useObservable(context$)

  return contextData?.status === 'connectedReadonly' ? (
    <Flex sx={{ flexDirection: 'column', mt: '112px' }}>
      <Heading as="h1" variant="header3" sx={{ textAlign: 'center', fontWeight: 'regular' }}>
        {t('vaults-overview.headers.not-connected-suggestions')}
      </Heading>
      <AppLink
        href="/connect"
        variant="primary"
        sx={{
          display: 'flex',
          mx: 'auto',
          mt: '24px',
          px: '40px',
          py: 2,
          alignItems: 'center',
          '&:hover svg': {
            transform: 'translateX(10px)',
          },
        }}
      >
        {t('connect-wallet')}
        <Icon
          name="arrow_right"
          sx={{
            left: 2,
            position: 'relative',
            ml: 2,
            transition: 'transform 200ms',
          }}
        />
      </AppLink>
    </Flex>
  ) : null
}
