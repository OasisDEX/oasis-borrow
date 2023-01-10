import { ConnectButton } from '@rainbow-me/rainbowkit'
import { WithArrow } from 'components/WithArrow'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button } from 'theme-ui'

export function ConnectWalletButton() {
  const { t } = useTranslation()

  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => {
        return (
          <Button
            variant="buttons.secondary"
            onClick={openConnectModal}
            sx={{
              display: 'flex',
              flexShrink: 0,
              p: 0,
              textDecoration: 'none',
              bg: 'neutral10',
              boxShadow: 'buttonMenu',
            }}
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
        )
      }}
    </ConnectButton.Custom>
  )
}
