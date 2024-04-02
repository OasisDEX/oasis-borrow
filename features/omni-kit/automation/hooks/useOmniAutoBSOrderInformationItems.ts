import BigNumber from 'bignumber.js'
import type { ItemProps } from 'components/infoSection/Item'
import { AutomationFeatures } from 'features/automation/common/types'
import { useOmniAutoBSDataHandler } from 'features/omni-kit/automation/hooks/useOmniAutoBSDataHandler'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'

export const useOmniAutoBSOrderInformationItems = (): ItemProps[] => {
  const { t } = useTranslation()

  const {
    environment: { productType, collateralToken, quoteToken },
  } = useOmniGeneralContext()
  const {
    automation: { isSimulationLoading },
    dynamicMetadata: {
      values: { automation },
    },
  } = useOmniProductContext(productType)

  if (!automation) {
    throw new Error('Automation dynamic metadata not available')
  }

  const type = automation?.resolved.isProtection
    ? AutomationFeatures.AUTO_SELL
    : AutomationFeatures.AUTO_BUY

  const {
    afterTargetMultiply,
    afterTargetLtv,
    afterTriggerLtv,
    deviation,
    collateralAmountAfterExecution,
    debtAmountAfterExecution,
    collateralToBuyOrSellOnExecution,
  } = useOmniAutoBSDataHandler({
    type,
  })

  return [
    {
      label:
        type === AutomationFeatures.AUTO_SELL
          ? t('auto-sell.target-ltv-each-sell')
          : t('auto-buy.target-ltv-each-buy'),
      value: afterTargetLtv ? formatDecimalAsPercent(afterTargetLtv.div(100)) : '-',
    },
    {
      label:
        type === AutomationFeatures.AUTO_SELL
          ? t('auto-sell.target-multiple-each-sell')
          : t('auto-buy.target-multiple-each-buy'),
      value: afterTargetMultiply ? `${afterTargetMultiply.toFixed(2)}x` : '-',
    },
    {
      label:
        type === AutomationFeatures.AUTO_SELL
          ? t('auto-sell.trigger-ltv-to-perform-sell')
          : t('auto-buy.trigger-ltv-to-perform-buy'),
      value: afterTriggerLtv ? formatDecimalAsPercent(afterTriggerLtv.div(100)) : '-',
    },
    {
      label:
        type === AutomationFeatures.AUTO_SELL
          ? t('auto-sell.target-ratio-with-deviation')
          : t('auto-buy.target-ratio-with-deviation'),
      value: deviation
        ? `${formatDecimalAsPercent(
            new BigNumber(deviation[0]).div(10000),
          )} - ${formatDecimalAsPercent(new BigNumber(deviation[1]).div(10000))}`
        : '-',
      isLoading: isSimulationLoading,
    },
    {
      label:
        type === AutomationFeatures.AUTO_SELL
          ? t('auto-sell.collateral-after-next-sell')
          : t('auto-buy.collateral-after-next-buy'),
      value: collateralAmountAfterExecution
        ? `${formatCryptoBalance(collateralAmountAfterExecution)} ${collateralToken}`
        : '-',
      isLoading: isSimulationLoading,
    },
    {
      label:
        type === AutomationFeatures.AUTO_SELL
          ? t('auto-sell.outstanding-debt-after-next-sell')
          : t('auto-buy.outstanding-debt-after-next-buy'),
      value: debtAmountAfterExecution
        ? `${formatCryptoBalance(debtAmountAfterExecution)} ${quoteToken}`
        : '-',
      isLoading: isSimulationLoading,
    },
    {
      label:
        type === AutomationFeatures.AUTO_SELL
          ? t('auto-sell.col-to-be-sold', { token: collateralToken })
          : t('auto-buy.col-to-be-purchased', { token: collateralToken }),
      value: collateralToBuyOrSellOnExecution
        ? `${formatCryptoBalance(collateralToBuyOrSellOnExecution)} ${collateralToken}`
        : '-',
      isLoading: isSimulationLoading,
    },
  ]
}
