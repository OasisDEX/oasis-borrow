import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { AutomationFeatures } from 'features/automation/common/types'
import { OmniPartialTakeProfitOverviewDetailsSectionFooter } from 'features/omni-kit/automation/components/OmniPartialTakeProfitOverviewDetailsSectionFooter'
import { getRealizedProfit, resolveActiveOrder } from 'features/omni-kit/automation/helpers'
import {
  OmniContentCard,
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
import type { FC } from 'react'
import React, { useMemo, useState } from 'react'

interface OmniPartialTakeProfitOverviewDetailsSectionProps {
  active?: boolean
}

export const OmniPartialTakeProfitOverviewDetailsSection: FC<
  OmniPartialTakeProfitOverviewDetailsSectionProps
> = ({ active = false }) => {
  const { t } = useTranslation()
  const [chartView, setChartView] = useState<'price' | 'ltv'>('price')

  const {
    environment: {
      productType,
      collateralPrice,
      quotePrice,
      priceFormat,
      collateralToken,
      quoteToken,
    },
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

  const simpleView = state.uiDropdown !== AutomationFeatures.PARTIAL_TAKE_PROFIT

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
    [collateralToken]: realizedProfit.collateralRealized,
    [quoteToken]: realizedProfit.debtRealized,
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

  return (
    <DetailsSection
      sx={resolveActiveOrder(active)}
      title={t('system.partial-take-profit')}
      badge={isPartialTakeProfitEnabled}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard {...currentProfitAndLossCommonData} />
          <OmniContentCard {...realizedProfitCommonData} />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <OmniPartialTakeProfitOverviewDetailsSectionFooter
          liquidationPrice={castedPosition.liquidationPrice}
          loanToValue={castedPosition.riskRatio.loanToValue}
          multiple={castedPosition.riskRatio.multiple}
          priceFormat={priceFormat}
          simpleView={simpleView}
          chartView={chartView}
          setChartView={setChartView}
        />
      }
    />
  )
}
