import type { ItemProps } from 'components/infoSection/Item'
import { useOmniStopLossDataHandler } from 'features/omni-kit/automation/hooks/useOmniStopLossDataHandler'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'

export const useOmniStopLossOrderInformationItems = () => {
  const { t } = useTranslation()

  const {
    environment: { productType, collateralToken, quoteToken },
  } = useOmniGeneralContext()
  const {
    automation: { automationForms },
  } = useOmniProductContext(productType)

  const { savingCompareToLiquidation, isCollateralActive, afterMaxToken } =
    useOmniStopLossDataHandler()

  const closeToToken = isCollateralActive ? collateralToken : quoteToken

  return [
    {
      label: t('protection.stop-loss-ltv'),
      value: automationForms.stopLoss.state.triggerLtv
        ? formatDecimalAsPercent(automationForms.stopLoss.state.triggerLtv)
        : '-',
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
  ] as ItemProps[]
}
