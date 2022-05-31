import { Box } from '@theme-ui/components'
import { MessageCard } from 'components/MessageCard'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import {
  CancelDownsideProtectionInformation,
  CancelSlFormLayoutProps,
} from 'features/automation/protection/controls/CancelSlFormLayout'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

export function SidebarCancelStopLossEditingStage({
  txError,
  ethPrice,
  gasEstimation,
  ethBalance,
  gasEstimationUsd,
  liquidationPrice,
}: CancelSlFormLayoutProps) {
  const { t } = useTranslation()
  const gasEstimationText = getEstimatedGasFeeText(gasEstimation)

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
        {t('protection.cancel-downside-protection-desc')}
      </Text>
      <Box my={3}>
        <CancelDownsideProtectionInformation
          gasEstimationText={gasEstimationText}
          liquidationPrice={liquidationPrice}
          ethPrice={ethPrice}
          gasEstimationUsd={gasEstimationUsd}
          ethBalance={ethBalance}
          txError={txError}
        />
      </Box>
      <MessageCard
        messages={[
          <>
            <strong>{t(`notice`)}</strong>: {t('protection.cancel-notice')}
          </>,
        ]}
        type="warning"
        withBullet={false}
      />
    </>
  )
}
