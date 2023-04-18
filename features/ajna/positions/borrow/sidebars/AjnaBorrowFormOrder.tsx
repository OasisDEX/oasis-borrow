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
    collateralLocked: formatCryptoBalance(positionData.collateralAmount),
    debt: formatCryptoBalance(positionData.debtAmount),
    ltv: formatDecimalAsPercent(positionData.riskRatio.loanToValue),
    liquidationPrice: formatCryptoBalance(positionData.liquidationPrice),
    availableToBorrow: formatCryptoBalance(positionData.debtAvailable),
    availableToWithdraw: formatCryptoBalance(positionData.collateralAvailable),
    afterLiquidationPrice:
      simulationData?.liquidationPrice && formatCryptoBalance(simulationData.liquidationPrice),
    afterLtv:
      simulationData?.riskRatio && formatDecimalAsPercent(simulationData.riskRatio.loanToValue),
    afterDebt: simulationData?.debtAmount && formatCryptoBalance(simulationData.debtAmount),
    afterCollateralLocked:
      simulationData?.collateralAmount && formatCryptoBalance(simulationData.collateralAmount),
    afterAvailableToBorrow:
      simulationData?.debtAvailable && formatCryptoBalance(simulationData.debtAvailable),
    afterAvailableToWithdraw:
      simulationData?.collateralAvailable &&
      formatCryptoBalance(simulationData.collateralAvailable),
    totalCost: txDetails?.txCost ? `$${formatAmount(txDetails.txCost, 'USD')}` : '-',
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('system.collateral-locked'),
          value: `${formatted.collateralLocked} ${collateralToken}`,
          change: `${formatted.afterCollateralLocked} ${collateralToken}`,
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
          value: `${formatted.liquidationPrice} ${quoteToken}/${collateralToken}`,
          change: `${formatted.afterLiquidationPrice} ${quoteToken}/${collateralToken}`,
          isLoading,
        },
        {
          label: t('system.debt'),
          value: `${formatted.debt} ${quoteToken}`,
          change: `${formatted.afterDebt} ${quoteToken}`,
          isLoading,
        },
        {
          label: t('system.available-to-withdraw'),
          value: `${formatted.availableToWithdraw} ${collateralToken}`,
          change: `${formatted.afterAvailableToWithdraw} ${collateralToken}`,
          isLoading,
        },
        {
          label: t('system.available-to-borrow'),
          value: `${formatted.availableToBorrow} ${quoteToken}`,
          change: `${formatted.afterAvailableToBorrow} ${quoteToken}`,
          isLoading,
        },
        isTxSuccess && cached
          ? {
              label: t('system.total-cost'),
              value: formatted.totalCost,
              isLoading,
            }
          : {
              label: t('system.max-transaction-cost'),
              value: <GasEstimation />,
              isLoading,
            },
      ]}
    />
  )
}
