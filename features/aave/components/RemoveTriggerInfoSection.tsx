import { InfoSection } from 'components/infoSection/InfoSection'
import { InfoSectionLoadingState } from 'components/infoSection/Item'
import { getEstimatedGasFeeTextOld } from 'components/vault/VaultChangesInformation'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { useTranslation } from 'next-i18next'
import React from 'react'

export interface RemoveTriggerSectionProps {
  isLoading: boolean
  transactionCost: HasGasEstimation
}

export function RemoveTriggerInfoSection({
  isLoading,
  transactionCost,
}: RemoveTriggerSectionProps) {
  const { t } = useTranslation()

  const transactionCostWithLoader =
    isLoading || transactionCost.gasEstimationStatus === GasEstimationStatus.calculating ? (
      <InfoSectionLoadingState />
    ) : (
      getEstimatedGasFeeTextOld(transactionCost, false)
    )

  return (
    <InfoSection
      title={t('system.remove-trigger')}
      items={[
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: transactionCostWithLoader,
        },
      ]}
    />
  )
}
