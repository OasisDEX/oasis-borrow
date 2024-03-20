import { useOmniTrailingStopLossDataHandler } from 'features/omni-kit/automation/hooks/useOmniTrailingStopLossDataHandler'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'

export const useOmniTrailingStopLossOrderInformationItems = () => {
  const { t } = useTranslation()

  const {
    environment: { productType, collateralToken, quoteToken, priceFormat },
  } = useOmniGeneralContext()
  const {
    automation: { automationForms },
    dynamicMetadata: {
      values: { automation },
    },
  } = useOmniProductContext(productType)

  const { savingCompareToLiquidation, isCollateralActive, afterMaxToken } =
    useOmniTrailingStopLossDataHandler()

  const closeToToken = isCollateralActive ? collateralToken : quoteToken

  return [
    {
      label: t('protection.trailing-distance'),
      value: automation?.triggers.trailingStopLoss?.decodedMappedParams.trailingDistance
        ? `${formatCryptoBalance(
            automation.triggers.trailingStopLoss.decodedMappedParams.trailingDistance,
          )} ${priceFormat}`
        : '-',
      ...(automationForms.trailingStopLoss.state.trailingDistance && {
        change: `${formatCryptoBalance(
          automationForms.trailingStopLoss.state.trailingDistance,
        )} ${priceFormat}`,
      }),
    },
    {
      label: t('protection.estimated-to-receive'),
      value: afterMaxToken ? `${formatCryptoBalance(afterMaxToken)} ${closeToToken}` : '-',
    },
    {
      label: t('protection.saving-comp-to-liquidation'),
      value: savingCompareToLiquidation
        ? `${formatCryptoBalance(savingCompareToLiquidation)} ${closeToToken}`
        : '-',
    },
  ]
}
