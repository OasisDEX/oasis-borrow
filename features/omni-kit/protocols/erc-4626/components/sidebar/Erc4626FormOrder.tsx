import { amountFromWei } from 'blockchain/utils'
import { InfoSection } from 'components/infoSection/InfoSection'
import { OmniGasEstimation, OmniSlippageInfoWithSettings } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  resolveIfCachedPosition,
  resolveIfCachedSwap,
} from 'features/omni-kit/protocols/ajna/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Flex, Text } from 'theme-ui'

export const Erc4626FormOrder: FC = () => {
  const { t } = useTranslation()

  const {
    environment: {
      isStrategyWithDefaultSlippage,
      quotePrecision,
      quotePrice,
      quoteToken,
      slippage,
      slippageSource,
    },
    steps: { isFlowStateReady },
    tx: { isTxSuccess, txDetails, setSlippageSource },
  } = useOmniGeneralContext()
  const {
    form: {
      state: { depositAmount, pullToken },
    },
    position: { cachedPosition, currentPosition, isSimulationLoading, swap },
  } = useOmniProductContext(OmniProductType.Earn)

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached: isTxSuccess,
    cachedPosition,
    currentPosition,
  })

  const swapData = resolveIfCachedSwap({
    cached: isTxSuccess,
    currentSwap: swap?.current,
    cachedSwap: swap?.cached,
  })

  const oasisFee =
    swapData &&
    pullToken &&
    amountFromWei(
      swapData.tokenFee,
      swapData.collectFeeFrom === 'targetToken' ? quotePrecision : pullToken?.precision,
    ).times(swapData.collectFeeFrom === 'targetToken' ? quotePrice : pullToken?.price)

  const isLoading = !isTxSuccess && isSimulationLoading
  const formatted = {
    totalDeposit: `${formatCryptoBalance(positionData.quoteTokenAmount)} ${quoteToken}`,
    afterTotalDeposit:
      simulationData?.quoteTokenAmount &&
      `${formatCryptoBalance(simulationData.quoteTokenAmount)} ${quoteToken}`,
    swappingFrom: depositAmount && `${formatCryptoBalance(depositAmount)} ${pullToken?.token}`,
    swappingTo: swapData && `${formatCryptoBalance(swapData.minToTokenAmount)} ${quoteToken}`,
    slippageLimit: formatDecimalAsPercent(slippage),
    oasisFee: oasisFee && formatUsdValue(oasisFee),
    totalCost: txDetails?.txCost ? formatUsdValue(txDetails.txCost) : '-',
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('erc-4626.position-page.earn.form-order.total-deposit', { quoteToken }),
          value: formatted.totalDeposit,
          change: formatted.afterTotalDeposit,
          isLoading,
        },
        ...(swapData
          ? [
              {
                label: t('erc-4626.position-page.earn.form-order.swapping'),
                value: formatted.swappingFrom,
                change: formatted.swappingTo,
                isLoading,
              },

              {
                label: t('vault-changes.slippage-limit'),
                value: (
                  <OmniSlippageInfoWithSettings
                    changeSlippage={setSlippageSource}
                    getSlippageFrom={slippageSource}
                    slippage={formatted.slippageLimit}
                    withDefaultSlippage={isStrategyWithDefaultSlippage}
                  />
                ),
                isLoading,
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
          ? oasisFee
            ? [
                {
                  label: t('transaction-fee'),
                  value: (
                    <Flex sx={{ alignItems: 'center', columnGap: 1 }}>
                      <Text>{formatted.oasisFee}</Text>
                      <Text>+</Text>
                      <OmniGasEstimation />
                    </Flex>
                  ),
                  dropdownValues: [
                    {
                      label: t('vault-changes.oasis-fee'),
                      value: formatted.oasisFee,
                    },
                    {
                      label: t('max-gas-fee'),
                      value: <OmniGasEstimation />,
                    },
                  ],
                  isLoading,
                },
              ]
            : [
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
