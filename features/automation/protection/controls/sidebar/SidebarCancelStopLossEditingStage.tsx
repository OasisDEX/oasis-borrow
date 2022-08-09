import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { MessageCard } from 'components/MessageCard'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import {
  errorsStopLossValidation,
  warningsStopLossValidation,
} from 'features/automation/protection/common/validation'
import {
  CancelDownsideProtectionInformation,
  CancelSlFormLayoutProps,
} from 'features/automation/protection/controls/CancelSlFormLayout'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export function SidebarCancelStopLossEditingStage({
  ethBalance,
  ethPrice,
  ilkData,
  liquidationPrice,
  selectedSLValue,
  token,
  txError,
  vault: { debt },
}: CancelSlFormLayoutProps) {
  const { t } = useTranslation()

  const gasEstimation = useGasEstimationContext()

  const errors = errorsStopLossValidation({ txError, debt: debt })
  const warnings = warningsStopLossValidation({
    token,
    gasEstimationUsd: gasEstimation?.usdValue,
    ethBalance,
    ethPrice,
  })

  return (
    <Grid>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('protection.cancel-downside-protection-desc')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <CancelDownsideProtectionInformation
        liquidationPrice={liquidationPrice}
        ethPrice={ethPrice}
        gasEstimationUsd={gasEstimation?.usdValue}
        ethBalance={ethBalance}
        txError={txError}
        selectedSLValue={selectedSLValue}
      />
      <MessageCard
        messages={[
          <>
            <strong>{t(`notice`)}</strong>: {t('protection.cancel-notice')}
          </>,
        ]}
        type="warning"
        withBullet={false}
      />
    </Grid>
  )
}
