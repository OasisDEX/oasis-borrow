import { useOmniPartialTakeProfitDataHandler } from 'features/omni-kit/automation/hooks/useOmniPartialTakeProfitDataHandler'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'

export const useOmniPartialTakeProfitOrderInformationItems = () => {
  const { t } = useTranslation()

  const {
    environment: { productType, priceFormat },
  } = useOmniGeneralContext()
  const {
    automation: { automationForms },
  } = useOmniProductContext(productType)

  const { afterResolvedEstimatedToReceive, resolveToToken } = useOmniPartialTakeProfitDataHandler()

  return [
    {
      label: t('partial-take-profit.next-trigger-price'),
      value: automationForms.partialTakeProfit.state.price
        ? `${formatCryptoBalance(automationForms.partialTakeProfit.state.price)} ${priceFormat}`
        : '-',
    },
    {
      label: t('partial-take-profit.next-realized-profit'),
      value: afterResolvedEstimatedToReceive
        ? `${formatCryptoBalance(afterResolvedEstimatedToReceive)} ${resolveToToken}`
        : '-',
    },
    {
      label: t('partial-take-profit.trigger-ltv'),
      value: automationForms.partialTakeProfit.state.triggerLtv
        ? formatDecimalAsPercent(automationForms.partialTakeProfit.state.triggerLtv.div(100))
        : '-',
    },
    {
      label: t('partial-take-profit.ltv-withdrawal-step'),
      value: automationForms.partialTakeProfit.state.ltvStep
        ? formatDecimalAsPercent(automationForms.partialTakeProfit.state.ltvStep.div(100))
        : '-',
    },
    ...(automationForms.partialTakeProfit.state.extraTriggerLtv
      ? [
          {
            label: t('protection.stop-loss-ltv'),
            value: formatDecimalAsPercent(
              automationForms.partialTakeProfit.state.extraTriggerLtv.div(100),
            ),
          },
        ]
      : []),
  ]
}
