import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import { normalizeValue, protocols } from '@oasisdex/dma-library'
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
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const AjnaEarnFormOrderInformation: FC = () => {
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
    cached: isTxSuccess,
    cachedPosition,
    currentPosition,
  })

  const positionData = _positionData as AjnaEarnPosition
  const simulationData = _simulationData as AjnaEarnPosition | undefined

  const earnDepositFee = protocols.ajna.getAjnaEarnDepositFee({
    interestRate: positionData.pool.interestRate,
    positionPrice: positionData.price,
    positionQuoteAmount: positionData.quoteTokenAmount,
    simulationPrice: simulationData?.price,
    simulationQuoteAmount: simulationData?.quoteTokenAmount,
  })
  const withAjnaFee =
    earnDepositFee?.gt(zero) && !positionData.pool.lowestUtilizedPriceIndex.isZero()

  const isLoading = !isTxSuccess && isSimulationLoading
  const formatted = {
    amountToLend: `${formatCryptoBalance(positionData.quoteTokenAmount)} ${quoteToken}`,
    afterAmountToLend:
      simulationData?.quoteTokenAmount &&
      `${formatCryptoBalance(simulationData.quoteTokenAmount)} ${quoteToken}`,
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
    earnDepositFee: earnDepositFee
      ? `${formatCryptoBalance(earnDepositFee)} ${quoteToken}`
      : undefined,
    totalCost: txDetails?.txCost ? formatUsdValue(txDetails.txCost) : '-',
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
                value: formatted.earnDepositFee,
                isLoading,
                tooltip: t('ajna.position-page.earn.common.form.deposit-fee-tooltip'),
              },
            ]
          : []),
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
