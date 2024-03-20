import { AutomationFeatures } from 'features/automation/common/types'
import {
  useOmniAutoBSOrderInformationItems,
  useOmniPartialTakeProfitOrderInformationItems,
  useOmniStopLossOrderInformationItems,
  useOmniTrailingStopLossOrderInformationItems,
} from 'features/omni-kit/automation/hooks'
import { OmniGasEstimation } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { formatUsdValue } from 'helpers/formatters/format'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const useOmniAutomationOrderInformationItems = () => {
  const { t } = useTranslation()

  const {
    environment: { productType },
    tx: { isTxSuccess, txDetails },
  } = useOmniGeneralContext()
  const {
    automation: { isSimulationLoading, commonForm },
  } = useOmniProductContext(productType)

  const formatted = {
    totalCost: txDetails?.txCost ? formatUsdValue(txDetails.txCost) : '-',
  }

  const isLoading = !isTxSuccess && isSimulationLoading

  const [hash] = useHash()

  const isProtection = hash === 'protection'

  const activeUiDropdown = isProtection
    ? commonForm.state.uiDropdownProtection || AutomationFeatures.TRAILING_STOP_LOSS
    : commonForm.state.uiDropdownOptimization || AutomationFeatures.PARTIAL_TAKE_PROFIT

  const common = [
    ...(isTxSuccess
      ? [
          {
            label: t('system.total-cost'),
            value: formatted.totalCost,
            isLoading,
          },
        ]
      : [
          {
            label: t('max-gas-fee'),
            value: <OmniGasEstimation />,
            isLoading,
          },
        ]),
  ]

  switch (activeUiDropdown) {
    case AutomationFeatures.STOP_LOSS: {
      const stopLossItems = useOmniStopLossOrderInformationItems()
      return [...stopLossItems, ...common]
    }
    case AutomationFeatures.TRAILING_STOP_LOSS: {
      const trailingStopLossItems = useOmniTrailingStopLossOrderInformationItems()
      return [...trailingStopLossItems, ...common]
    }
    case AutomationFeatures.AUTO_BUY:
    case AutomationFeatures.AUTO_SELL: {
      const autoBSItems = useOmniAutoBSOrderInformationItems()
      return [...autoBSItems, ...common]
    }
    case AutomationFeatures.PARTIAL_TAKE_PROFIT:
      const partialTakeProfitItems = useOmniPartialTakeProfitOrderInformationItems()
      return [...partialTakeProfitItems, ...common]
    default:
      return common
  }
}
