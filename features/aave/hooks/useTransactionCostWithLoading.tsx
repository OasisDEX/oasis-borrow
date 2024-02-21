import { InfoSectionLoadingState } from 'components/infoSection/Item'
import { getEstimatedGasFeeTextOld } from 'components/vault/VaultChangesInformation'
import { GasEstimationStatus, type HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import React from 'react'

export function useTransactionCostWithLoading({
  transactionCost = { gasEstimationStatus: GasEstimationStatus.calculating },
  isLoading = false,
}: {
  transactionCost?: HasGasEstimation
  isLoading?: boolean
}) {
  return isLoading || transactionCost.gasEstimationStatus === GasEstimationStatus.calculating ? (
    <InfoSectionLoadingState />
  ) : (
    getEstimatedGasFeeTextOld(transactionCost, false)
  )
}
