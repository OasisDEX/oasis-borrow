import { MessageCard } from 'components/MessageCard'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function StopLossAaveErrorMessage() {
  const { t } = useTranslation()

  return (
    <MessageCard
      messages={[t('manage-earn-vault.after-ltv-ratio-below-stop-loss-ltv')]}
      type="error"
      withBullet={false}
    />
  )
}
