import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import type { AjnaIsCachedPosition } from 'features/ajna/common/types'
import { resolveIfCachedPosition } from 'features/ajna/positions/common/helpers/resolveIfCachedPosition'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniProductType } from 'features/omni-kit/types'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const AjnaOmniEarnFormOrderInformation: FC<AjnaIsCachedPosition> = ({ cached = false }) => {
  const { t } = useTranslation()

  const {
    environment: { quoteToken, collateralPrice, quotePrice, isShort, priceFormat, isOracless },
    steps: { isFlowStateReady },
    tx: { txDetails, isTxSuccess },
  } = useOmniGeneralContext()
  const {
    position: { cachedPosition, currentPosition, isSimulationLoading },
  } = useOmniProductContext(OmniProductType.Earn)

  const { positionData: _positionData, simulationData: _simulationData } = resolveIfCachedPosition({
    cached,
    cachedPosition,
    currentPosition,
  })

  const positionData = _positionData as AjnaEarnPosition
  const simulationData = _simulationData as AjnaEarnPosition | undefined

  const apyCurrentPosition = positionData.apy
  const apySimulation = simulationData?.apy

  const feeWhenActionBelowLup = simulationData?.getFeeWhenBelowLup || zero
  const withAjnaFee =
    feeWhenActionBelowLup.gt(zero) && !positionData.pool.lowestUtilizedPriceIndex.isZero()

  const isLoading = !cached && isSimulationLoading
  const formatted = {
    amountToLend: `${formatCryptoBalance(positionData.quoteTokenAmount)} ${quoteToken}`,
    afterAmountToLend:
      simulationData?.quoteTokenAmount &&
      `${formatCryptoBalance(simulationData.quoteTokenAmount)} ${quoteToken}`,
    netApy:
      positionData.isEarningFees && apyCurrentPosition.per365d
        ? formatDecimalAsPercent(apyCurrentPosition.per365d)
        : formatDecimalAsPercent(zero),
    afterNetApy: apySimulation?.per365d
      ? formatDecimalAsPercent(simulationData?.isEarningFees ? apySimulation.per365d : zero)
      : undefined,
    lendingPrice: `${formatCryptoBalance(
      normalizeValue(isShort ? one.div(positionData.price) : positionData.price),
    )} ${priceFormat}`,
    afterLendingPrice: `${
      simulationData?.price &&
      formatCryptoBalance(
        normalizeValue(isShort ? one.div(simulationData.price) : simulationData.price),
      )
    } ${priceFormat}`,
    maxLtv: formatDecimalAsPercent(positionData.price.div(collateralPrice.div(quotePrice))),
    afterMaxLtv:
      simulationData?.price &&
      formatDecimalAsPercent(simulationData?.price.div(collateralPrice.div(quotePrice))),
    feeWhenActionBelowLup: `${formatCryptoBalance(feeWhenActionBelowLup)} ${quoteToken}`,
    totalCost: txDetails?.txCost ? `$${formatAmount(txDetails.txCost, 'USD')}` : '-',
    oneDayApy: simulationData?.apy.per1d && formatDecimalAsPercent(simulationData.apy.per1d),
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('amount-to-lend'),
          value: formatted.amountToLend,
          change: formatted.afterAmountToLend,
          isLoading,
        },
        {
          label: t('net-apy'),
          value: formatted.netApy,
          change: formatted.afterNetApy,
          isLoading,
        },
        {
          label: t('lending-price'),
          value: formatted.lendingPrice,
          change: formatted.afterLendingPrice,
          isLoading,
        },
        ...(!isOracless
          ? [
              {
                label: t('max-ltv-to-lend-at'),
                value: formatted.maxLtv,
                change: formatted.afterMaxLtv,
                isLoading,
              },
            ]
          : []),
        ...(withAjnaFee
          ? [
              {
                label: t('deposit-fee'),
                value: formatted.feeWhenActionBelowLup,
                isLoading,
                tooltip: t('ajna.position-page.earn.common.form.deposit-fee-tooltip', {
                  value: formatted.oneDayApy,
                }),
              },
            ]
          : []),
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
