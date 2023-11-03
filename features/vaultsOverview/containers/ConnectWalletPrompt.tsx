import { useMainContext } from 'components/context/MainContextProvider'
import { Icon } from 'components/Icon'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { arrow_right } from 'theme/icons'
import { Button, Flex, Heading } from 'theme-ui'

export function ConnectWalletPrompt() {
  const { t } = useTranslation()
  const { context$ } = useMainContext()
  const [contextData] = useObservable(context$)
  const { connect, connecting } = useConnection()

  return contextData?.status === 'connectedReadonly' ? (
    <Flex sx={{ flexDirection: 'column', mt: '112px' }}>
      <Heading as="h1" variant="header3" sx={{ textAlign: 'center', fontWeight: 'regular' }}>
        {t('vaults-overview.headers.not-connected-suggestions')}
      </Heading>
      <Button
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
        onClick={() => {
          if (!connecting) {
            connect()
          }
        }}
      >
        {t('connect-wallet')}
        <Icon
          icon={arrow_right}
          sx={{
            left: 2,
            position: 'relative',
            ml: 2,
            transition: 'transform 200ms',
          }}
        />
      </Button>
    </Flex>
  ) : null
}
