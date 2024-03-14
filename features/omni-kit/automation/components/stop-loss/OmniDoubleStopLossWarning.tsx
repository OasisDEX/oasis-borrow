import { MessageCard } from 'components/MessageCard'
import type { FC } from 'react'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'

export const OmniDoubleStopLossWarning: FC<{
  hasTrailingStopLoss?: boolean
  onClick: () => void
}> = ({ hasTrailingStopLoss = false, onClick }) => {
  const { t } = useTranslation()
  return hasTrailingStopLoss ? (
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
          components={{
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
          }}
        />,
      ]}
      type="warning"
      withBullet={false}
    />
  ) : null
}
