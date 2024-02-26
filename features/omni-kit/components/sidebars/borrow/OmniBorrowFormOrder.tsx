import { negativeToZero, normalizeValue } from '@oasisdex/dma-library'
import { InfoSection } from 'components/infoSection/InfoSection'
import { OmniGasEstimation } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { resolveIfCachedPosition } from 'features/omni-kit/protocols/ajna/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function OmniBorrowFormOrder() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, isOracless, isShort, priceFormat, quoteToken },
    steps: { isFlowStateReady },
    tx: { isTxSuccess, txDetails },
  } = useOmniGeneralContext()
  const {
    position: { cachedPosition, currentPosition, isSimulationLoading },
    dynamicMetadata: {
      values: { shouldShowDynamicLtv, afterPositionDebt, afterAvailableToBorrow },
    },
  } = useOmniProductContext(OmniProductType.Borrow)

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached: isTxSuccess,
    cachedPosition,
    currentPosition,
  })

  const liquidationPrice = normalizeValue(
    isShort ? one.div(positionData.liquidationPrice) : positionData.liquidationPrice,
  )
  const afterLiquidationPrice =
    simulationData?.liquidationPrice &&
    normalizeValue(
      isShort ? one.div(simulationData.liquidationPrice) : simulationData.liquidationPrice,
    )

  const isLoading = !isTxSuccess && isSimulationLoading
  const formatted = {
    collateralLocked: `${formatCryptoBalance(positionData.collateralAmount)} ${collateralToken}`,
    afterCollateralLocked:
      simulationData?.collateralAmount &&
      `${formatCryptoBalance(simulationData.collateralAmount)} ${collateralToken}`,
    ltv: formatDecimalAsPercent(positionData.riskRatio.loanToValue),
    afterLtv:
      simulationData?.riskRatio && formatDecimalAsPercent(simulationData.riskRatio.loanToValue),
    liquidationPrice: `${formatCryptoBalance(liquidationPrice)} ${priceFormat}`,
    afterLiquidationPrice:
      afterLiquidationPrice && `${formatCryptoBalance(afterLiquidationPrice)} ${priceFormat}`,
    dynamicMaxLtv: formatDecimalAsPercent(positionData.maxRiskRatio.loanToValue),
    afterDynamicMaxLtv:
      simulationData?.maxRiskRatio.loanToValue &&
      formatDecimalAsPercent(simulationData.maxRiskRatio.loanToValue),
    debt: `${formatCryptoBalance(positionData.debtAmount)} ${quoteToken}`,
    afterDebt: afterPositionDebt && `${formatCryptoBalance(afterPositionDebt)} ${quoteToken}`,
    availableToWithdraw: `${formatCryptoBalance(
      positionData.collateralAvailable,
    )} ${collateralToken}`,
    afterAvailableToWithdraw:
      simulationData?.collateralAvailable &&
      `${formatCryptoBalance(simulationData.collateralAvailable)} ${collateralToken}`,
    availableToBorrow: `${formatCryptoBalance(positionData.debtAvailable())} ${quoteToken}`,
    afterAvailableToBorrow:
      afterAvailableToBorrow &&
      `${formatCryptoBalance(negativeToZero(afterAvailableToBorrow))} ${quoteToken}`,
    totalCost: txDetails?.txCost ? formatUsdValue(txDetails.txCost) : '-',
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
          label: t('system.liquidation-price'),
          value: formatted.liquidationPrice,
          change: formatted.afterLiquidationPrice,
          isLoading,
        },
        ...(!isOracless
          ? [
              {
                label: t('vault-changes.ltv'),
                value: formatted.ltv,
                change: formatted.afterLtv,
                isLoading,
              },
            ]
          : []),
        ...(!isOracless && shouldShowDynamicLtv({ includeCache: true })
          ? [
              {
                label: t('system.dynamic-max-ltv'),
                value: formatted.dynamicMaxLtv,
                change: formatted.afterDynamicMaxLtv,
                isLoading,
              },
            ]
          : []),
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
        ...(isTxSuccess
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
                value: <OmniGasEstimation />,
                isLoading,
              },
            ]
          : []),
      ]}
    />
  )
}
