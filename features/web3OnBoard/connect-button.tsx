import { WithArrow } from 'components/WithArrow'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button } from 'theme-ui'

import { useConnection } from './useConnection'

export function ConnectButton() {
  const { t } = useTranslation()
  const { connecting, connect } = useConnection()

  return (
    <div>
      <Button
        variant="buttons.secondary"
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          height: '100%',
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
