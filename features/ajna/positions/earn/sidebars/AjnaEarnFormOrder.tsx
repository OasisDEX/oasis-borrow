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
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormOrder({ cached = false }: { cached?: boolean }) {
  const { t } = useTranslation()

  const {
    environment: { collateralToken, quoteToken, collateralPrice, quotePrice },
    tx: { txDetails, isTxSuccess },
  } = useAjnaGeneralContext()
  const {
    position: { cachedPosition, currentPosition, isSimulationLoading },
  } = useAjnaProductContext('earn')

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached,
    cachedPosition,
    currentPosition,
  })

  const apyCurrentPosition = positionData.apy
  const apySimulation = simulationData?.apy

  const feeWhenActionBelowLup = simulationData?.getFeeWhenBelowLup || zero
  const withAjnaFee = feeWhenActionBelowLup.gt(zero)

  const isLoading = !cached && isSimulationLoading
  const formatted = {
    amountToLend: formatCryptoBalance(positionData.quoteTokenAmount),
    maxLtv: formatDecimalAsPercent(positionData.price.div(collateralPrice.div(quotePrice))),
    netApy: apyCurrentPosition.per365d
      ? formatDecimalAsPercent(apyCurrentPosition.per365d)
      : formatDecimalAsPercent(zero),
    lendingPrice: formatCryptoBalance(positionData.price),
    afterAmountToLend:
      simulationData?.quoteTokenAmount && formatCryptoBalance(simulationData.quoteTokenAmount),
    afterNetApy: apySimulation?.per365d && formatDecimalAsPercent(apySimulation.per365d),
    afterMaxLtv:
      simulationData?.price &&
      formatDecimalAsPercent(simulationData?.price.div(collateralPrice.div(quotePrice))),
    afterLendingPrice: simulationData?.price && formatCryptoBalance(simulationData.price),
    totalCost: txDetails?.txCost
      ? `$${formatAmount(txDetails.txCost.plus(feeWhenActionBelowLup), 'USD')}`
      : '-',
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('amount-to-lend'),
          value: `${formatted.amountToLend} ${quoteToken}`,
          secondaryValue: `${formatted.afterAmountToLend} ${quoteToken}`,
          isLoading,
        },
        {
          label: t('net-apy'),
          value: formatted.netApy,
          secondaryValue: formatted.afterNetApy,
          isLoading,
        },
        {
          label: t('lending-price'),
          value: `${formatted.lendingPrice} ${collateralToken}/${quoteToken}`,
          secondaryValue: `${formatted.afterLendingPrice} ${collateralToken}/${quoteToken}`,
          isLoading,
        },
        {
          label: t('max-ltv-to-lend-at'),
          value: formatted.maxLtv,
          secondaryValue: formatted.afterMaxLtv,
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
              value: (
                <>
                  <GasEstimation />
                  {withAjnaFee && <>{` + $${formatAmount(feeWhenActionBelowLup, 'USD')}`}</>}
                </>
              ),
              dropdownValues: withAjnaFee
                ? [
                    {
                      label: t('max-gas-fee'),
                      value: <GasEstimation />,
                    },
                    {
                      label: t('ajna.position-page.earn.common.form.ajna-fee'),
                      value: `$${formatAmount(feeWhenActionBelowLup, 'USD')}`,
                    },
                  ]
                : undefined,
              isLoading,
            },
      ]}
    />
  )
}
