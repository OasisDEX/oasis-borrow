import { useConnectWallet } from '@web3-onboard/react'
import { WithArrow } from 'components/WithArrow'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button } from 'theme-ui'

import { useBridgeConnection } from './useBridgeConnection'

export function ConnectButton() {
  const [{ connecting }, connect] = useConnectWallet()
  const { t } = useTranslation()
  useBridgeConnection()

  return (
    <div>
      <Button
        variant="buttons.secondary"
        sx={{
          display: 'flex',
          flexShrink: 0,
          p: 0,
          textDecoration: 'none',
          bg: 'neutral10',
          boxShadow: 'buttonMenu',
        }}
        disabled={connecting}
        onClick={() => connect()}
      >
        <WithArrow
          sx={{
            py: 2,
            pl: 4,
            pr: '40px',
            fontSize: '16px',
          }}
        >
          {t('connect-wallet-button')}
        </WithArrow>
      </Button>
    </div>
  )
}
