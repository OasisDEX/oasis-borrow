import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { resolveIfCachedPosition } from 'features/ajna/positions/common/helpers/resolveIfCachedPosition'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormOrder({ cached = false }: { cached?: boolean }) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken },
    steps: { isFlowStateReady },
    tx: { isTxSuccess, txDetails },
  } = useAjnaGeneralContext()
  const {
    position: { cachedPosition, currentPosition, isSimulationLoading },
  } = useAjnaProductContext('borrow')

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached,
    cachedPosition,
    currentPosition,
  })

  const isLoading = !cached && isSimulationLoading
  const formatted = {
    collateralLocked: `${formatCryptoBalance(positionData.collateralAmount)} ${collateralToken}`,
    afterCollateralLocked:
      simulationData?.collateralAmount &&
      `${formatCryptoBalance(simulationData.collateralAmount)} ${collateralToken}`,
    ltv: formatDecimalAsPercent(positionData.riskRatio.loanToValue),
    afterLtv:
      simulationData?.riskRatio && formatDecimalAsPercent(simulationData.riskRatio.loanToValue),
    liquidationPrice: `${formatCryptoBalance(
      positionData.liquidationPrice,
    )} ${quoteToken}/${collateralToken}`,
    afterLiquidationPrice:
      simulationData?.liquidationPrice &&
      `${formatCryptoBalance(simulationData.liquidationPrice)} ${quoteToken}/${collateralToken}`,
    debt: `${formatCryptoBalance(positionData.debtAmount)} ${quoteToken}`,
    afterDebt:
      simulationData?.debtAmount &&
      `${formatCryptoBalance(simulationData.debtAmount)} ${quoteToken}`,
    availableToWithdraw: `${formatCryptoBalance(
      positionData.collateralAvailable,
    )} ${collateralToken}`,
    afterAvailableToWithdraw:
      simulationData?.collateralAvailable &&
      `${formatCryptoBalance(simulationData.collateralAvailable)} ${collateralToken}`,
    availableToBorrow: `${formatCryptoBalance(positionData.debtAvailable())} ${quoteToken}`,
    afterAvailableToBorrow:
      simulationData && `${formatCryptoBalance(simulationData.debtAvailable())} ${quoteToken}`,
    totalCost: txDetails?.txCost ? `$${formatAmount(txDetails.txCost, 'USD')}` : '-',
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('system.collateral-locked'),
          value: formatted.collateralLocked,
          change: formatted.afterCollateralLocked,
          isLoading,
        },
        {
          label: t('vault-changes.ltv'),
          value: formatted.ltv,
          change: formatted.afterLtv,
          isLoading,
        },
        {
          label: t('system.liquidation-price'),
          value: formatted.liquidationPrice,
          change: formatted.afterLiquidationPrice,
          isLoading,
        },
        {
          label: t('system.debt'),
          value: formatted.debt,
          change: formatted.afterDebt,
          isLoading,
        },
        {
          label: t('system.available-to-withdraw'),
          value: formatted.availableToWithdraw,
          change: formatted.afterAvailableToWithdraw,
          isLoading,
        },
        {
          label: t('system.available-to-borrow'),
          value: formatted.availableToBorrow,
          change: formatted.afterAvailableToBorrow,
          isLoading,
        },
        ...(isTxSuccess && cached
          ? [
              {
                label: t('system.total-cost'),
                value: formatted.totalCost,
                isLoading,
              },
            ]
          : isFlowStateReady
          ? [
              {
                label: t('system.max-transaction-cost'),
                value: <GasEstimation />,
                isLoading,
              },
            ]
          : []),
      ]}
    />
  )
}
