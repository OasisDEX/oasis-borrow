import { MessageCard } from 'components/MessageCard'
import type { FC } from 'react'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'

export const OmniDoubleStopLossWarning: FC<{
  hasTrailingStopLoss?: boolean
  hasStopLoss?: boolean
  onClick: () => void
}> = ({ hasTrailingStopLoss = false, hasStopLoss = false, onClick }) => {
  const { t } = useTranslation()
  const translationComponents = {
    1: (
      <Text
        sx={{
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
        onClick={onClick}
      />
    ),
  }
  if (hasTrailingStopLoss) {
    return (
      <MessageCard
        messages={[
          t('protection.current-stop-loss-overwrite', {
            addingStopLossType: t('protection.regular-stop-loss'),
            currentStopLossType: t('protection.trailing-stop-loss'),
          }),
          <Trans
            i18nKey="protection.current-stop-loss-overwrite-click-here"
            values={{
              currentStopLossType: t('protection.trailing-stop-loss'),
            }}
            components={translationComponents}
          />,
        ]}
        type="warning"
        withBullet={false}
      />
    )
  }
  if (hasStopLoss) {
    return (
      <MessageCard
        messages={[
          t('protection.current-stop-loss-overwrite', {
            addingStopLossType: t('protection.trailing-stop-loss'),
            currentStopLossType: t('protection.regular-stop-loss'),
          }),
          <Trans
            i18nKey="protection.current-stop-loss-overwrite-click-here"
            values={{
              currentStopLossType: t('protection.regular-stop-loss'),
            }}
            components={translationComponents}
          />,
        ]}
        type="warning"
        withBullet={false}
      />
    )
  }
  return null
}
