import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function ConnectWalletButton() {
  const { t } = useTranslation()

  return (
    <AppLink
      variant="buttons.secondary"
      href="/connect"
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
    </AppLink>
  )
}
