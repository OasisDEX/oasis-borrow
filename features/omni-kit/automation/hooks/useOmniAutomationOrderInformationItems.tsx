import type { ItemProps } from 'components/infoSection/Item'
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
import { useTranslation } from 'next-i18next'
import React from 'react'

export const useOmniAutomationOrderInformationItems = (): {
  items: ItemProps[]
  gasItem: ItemProps
} => {
  const { t } = useTranslation()

  const {
    environment: { productType },
    tx: { isTxSuccess, txDetails },
  } = useOmniGeneralContext()
  const {
    automation: { isSimulationLoading },
    dynamicMetadata: {
      values: { automation },
    },
  } = useOmniProductContext(productType)

  const formatted = {
    totalCost: txDetails?.txCost ? formatUsdValue(txDetails.txCost) : '-',
  }

  const isLoading = !isTxSuccess && isSimulationLoading

  const estimationItem = {
    label: t('max-gas-fee'),
    value: <OmniGasEstimation />,
    isLoading,
  }

  const totalCostItem = {
    label: t('system.total-cost'),
    value: formatted.totalCost,
    isLoading,
  }

  const gasItem = isTxSuccess ? totalCostItem : estimationItem

  if (!automation) {
    throw new Error('Automation dynamic metadata not available')
  }

  const { activeUiDropdown } = automation.resolved

  switch (activeUiDropdown) {
    case AutomationFeatures.STOP_LOSS: {
      const stopLossItems = useOmniStopLossOrderInformationItems()
      return {
        items: stopLossItems,
        gasItem,
      }
    }
    case AutomationFeatures.TRAILING_STOP_LOSS: {
      const trailingStopLossItems = useOmniTrailingStopLossOrderInformationItems()
      return {
        items: trailingStopLossItems,
        gasItem,
      }
    }
    case AutomationFeatures.AUTO_BUY:
    case AutomationFeatures.AUTO_SELL: {
      const autoBSItems = useOmniAutoBSOrderInformationItems()
      return {
        items: autoBSItems,
        gasItem,
      }
    }
    case AutomationFeatures.PARTIAL_TAKE_PROFIT:
      const partialTakeProfitItems = useOmniPartialTakeProfitOrderInformationItems()
      return {
        items: partialTakeProfitItems,
        gasItem,
      }

    default:
      return {
        items: [],
        gasItem,
      }
  }
}
