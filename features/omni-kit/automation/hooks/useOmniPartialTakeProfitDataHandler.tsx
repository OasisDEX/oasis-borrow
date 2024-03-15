import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { AutomationFeatures } from 'features/automation/common/types'
import { getRealizedProfit } from 'features/omni-kit/automation/helpers'
import {
  useOmniCardDataCurrentProfitAndLoss,
  useOmniCardDataRealizedProfit,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  getOmniNetValuePnlData,
  mapBorrowCumulativesToOmniCumulatives,
} from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { useTranslation } from 'next-i18next'
import React, { useMemo, useState } from 'react'

export const useOmniPartialTakeProfitDataHandler = () => {
  const { t } = useTranslation()
  const [chartView, setChartView] = useState<'price' | 'ltv'>('price')
  const {
    environment: { productType, collateralPrice, quotePrice, collateralToken, quoteToken },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      automationForm: { state },
    },
    position: {
      currentPosition: { position },
      history,
    },
  } = useOmniProductContext(productType)

  const castedPosition = position as AaveLikePositionV2

  const simpleView = state.uiDropdownOptimization !== AutomationFeatures.PARTIAL_TAKE_PROFIT

  const isPartialTakeProfitEnabled = !!automation?.flags.isPartialTakeProfitEnabled

  // const resolvedTrigger = automation?.triggers.partialTakeProfit
  // const triggerLtv = resolvedTrigger?.decodedParams.executionLtv
  // const resolvedTriggerLtv = triggerLtv ? new BigNumber(triggerLtv) : undefined

  // MOCKED FOR NOW
  const partialTakeProfitSecondTokenData = {
    symbol: collateralToken,
  }
  const partialTakeProfitTokenData = {
    symbol: quoteToken,
  }
  // MOCKED FOR NOW

  const realizedProfit = useMemo(() => {
    return getRealizedProfit(history)
  }, [history])

  const realizedProfitMap = {
    [collateralToken]: realizedProfit.collateralToken,
    [quoteToken]: realizedProfit.debtToken,
  }

  const primaryRealizedProfit = realizedProfitMap[partialTakeProfitTokenData.symbol]
  const secondaryRealizedProfit = realizedProfitMap[partialTakeProfitSecondTokenData.symbol]

  const pnlConfig = {
    cumulatives: mapBorrowCumulativesToOmniCumulatives(castedPosition.pnl.cumulatives),
    productType: OmniProductType.Multiply,
    collateralTokenPrice: collateralPrice,
    debtTokenPrice: quotePrice,
    netValueInCollateralToken: castedPosition.netValue.div(collateralPrice),
    netValueInDebtToken: castedPosition.netValue.div(quotePrice),
    collateralToken,
    debtToken: quoteToken,
  }

  const netValuePnlDataMap = {
    [collateralToken]: getOmniNetValuePnlData(pnlConfig).pnl?.inToken,
    [quoteToken]: getOmniNetValuePnlData({
      ...pnlConfig,
      useDebtTokenAsPnL: true,
    }).pnl?.inToken,
  }

  const primaryPnlValue = netValuePnlDataMap[partialTakeProfitTokenData.symbol]
  const secondaryPnLValue = netValuePnlDataMap[partialTakeProfitSecondTokenData.symbol]

  const currentProfitAndLossCommonData = useOmniCardDataCurrentProfitAndLoss({
    primaryPnlValue: isPartialTakeProfitEnabled ? primaryPnlValue : undefined,
    secondaryPnLValue: isPartialTakeProfitEnabled ? secondaryPnLValue : undefined,
    primaryUnit: partialTakeProfitTokenData.symbol,
    secondaryUnit: partialTakeProfitSecondTokenData.symbol,
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.current-pnl.title')}
        description={t('omni-kit.content-card.current-pnl.modal-description')}
      />
    ),
  })

  const realizedProfitCommonData = useOmniCardDataRealizedProfit({
    primaryRealizedProfit: isPartialTakeProfitEnabled ? primaryRealizedProfit : undefined,
    secondaryRealizedProfit: isPartialTakeProfitEnabled ? secondaryRealizedProfit : undefined,
    primaryUnit: partialTakeProfitTokenData.symbol,
    secondaryUnit: partialTakeProfitSecondTokenData.symbol,
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.realized-profit.title')}
        description={t('omni-kit.content-card.realized-profit.modal-description')}
      />
    ),
  })

  return {
    castedPosition,
    liquidationPrice: castedPosition.liquidationPrice,
    loanToValue: castedPosition.riskRatio.loanToValue,
    multiple: castedPosition.riskRatio.multiple,
    simpleView,
    isPartialTakeProfitEnabled,
    partialTakeProfitSecondTokenData,
    partialTakeProfitTokenData,
    realizedProfit,
    realizedProfitMap,
    primaryRealizedProfit,
    secondaryRealizedProfit,
    pnlConfig,
    netValuePnlDataMap,
    primaryPnlValue,
    secondaryPnLValue,
    currentProfitAndLossCommonData,
    realizedProfitCommonData,
    chartView,
    setChartView,
  }
}
