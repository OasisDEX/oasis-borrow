import { WithArrow } from 'components/WithArrow'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button } from 'theme-ui'

import { useWeb3OnBoardConnection } from './useWeb3OnBoardConnection'

export function ConnectButton() {
  const { t } = useTranslation()
  const { connecting, executeConnection } = useWeb3OnBoardConnection({ walletConnect: true })

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
        onClick={() => executeConnection()}
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
