import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { lambdaPercentageDenomination, lambdaPriceDenomination } from 'features/aave/constants'
import {
  hasActiveStopLossFromTriggers,
  hasActiveTrailingStopLossFromTriggers,
} from 'features/aave/manage/state'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  getDynamicStopLossPrice,
  getSliderPercentageFill,
} from 'features/automation/protection/stopLoss/helpers'
import {
  partialTakeProfitConstants,
  stopLossConstants,
} from 'features/omni-kit/automation/constants'
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
import { formatPercent } from 'helpers/formatters/format'
import { nbsp } from 'helpers/nbsp'
import { hundred, one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useMemo, useState } from 'react'

type PTPSliderConfig = {
  sliderPercentageFill: BigNumber
  minBoundry: BigNumber
  maxBoundry: BigNumber
  step: number
}

const getTriggerLtvSliderConfig = ({
  triggerLtv,
  maxMultiple,
}: {
  triggerLtv: BigNumber
  maxMultiple: BigNumber
}): PTPSliderConfig => {
  const sliderMax = new BigNumber(
    maxMultiple.div(partialTakeProfitConstants.ltvSliderStep).toFixed(2, BigNumber.ROUND_DOWN),
  ).times(partialTakeProfitConstants.ltvSliderStep)
  const sliderPercentageFill = getSliderPercentageFill({
    min: partialTakeProfitConstants.ltvSliderMin,
    max: sliderMax,
    value: triggerLtv,
  })
  return {
    step: partialTakeProfitConstants.ltvSliderStep,
    sliderPercentageFill,
    minBoundry: partialTakeProfitConstants.ltvSliderMin,
    maxBoundry: sliderMax,
  }
}

const getWithdrawalLtvSliderConfig = ({
  withdrawalLtv,
  maxMultiple,
}: {
  withdrawalLtv: BigNumber
  maxMultiple: BigNumber
  triggerLtv: BigNumber
}): PTPSliderConfig => {
  const sliderMax = new BigNumber(
    maxMultiple.div(partialTakeProfitConstants.ltvSliderStep).toFixed(2, BigNumber.ROUND_DOWN),
  ).times(partialTakeProfitConstants.ltvSliderStep)
  const sliderPercentageFill = getSliderPercentageFill({
    min: partialTakeProfitConstants.ltvSliderMin,
    max: sliderMax,
    value: withdrawalLtv,
  })
  return {
    step: partialTakeProfitConstants.ltvSliderStep,
    sliderPercentageFill,
    minBoundry: partialTakeProfitConstants.ltvSliderMin,
    maxBoundry: sliderMax,
  }
}

export const useOmniPartialTakeProfitDataHandler = () => {
  const { t } = useTranslation()
  const [chartView, setChartView] = useState<'price' | 'ltv'>('price')
  const {
    environment: {
      productType,
      collateralPrice,
      quotePrice,
      collateralToken,
      quoteToken,
      isShort,
      protocol,
      priceFormat,
    },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation: automationDynamicValues },
    },
    automation: {
      commonForm: { state: commonState },
      positionTriggers,
      automationForms: { partialTakeProfit: { state} },
    },
    position: {
      currentPosition: { position },
      history,
    },
  } = useOmniProductContext(productType)

  const castedPosition = position as AaveLikePositionV2

  const simpleView =
    commonState.uiDropdownOptimization !== AutomationFeatures.PARTIAL_TAKE_PROFIT
  const maxMultiple = castedPosition?.category.maxLoanToValue || zero
  const loanToValue = castedPosition.riskRatio.loanToValue
  const liquidationRatio = castedPosition.category.liquidationThreshold

  const isPartialTakeProfitEnabled = !!automationDynamicValues?.flags.isPartialTakeProfitEnabled

  const resolvedTrigger = automationDynamicValues?.triggers.partialTakeProfit
  const resolvedStopLossTrigger = automationDynamicValues?.triggers.stopLoss
  const resolvedTrailingStopLossTrigger = automationDynamicValues?.triggers.trailingStopLoss

  const resolvedTriggerLtv = resolvedTrigger?.decodedParams.executionLtv
    ? new BigNumber(Number(resolvedTrigger.decodedParams.executionLtv)).div(
        lambdaPercentageDenomination,
      )
    : undefined

  const startingTakeProfitPriceLong = resolvedTrigger?.decodedParams.executionPrice
    ? new BigNumber(Number(resolvedTrigger.decodedParams.executionPrice)).div(
        lambdaPriceDenomination,
      )
    : undefined

  const startingTakeProfitPriceShort = resolvedTrigger?.decodedParams.executionPrice
    ? new BigNumber(lambdaPriceDenomination).div(
        new BigNumber(Number(resolvedTrigger.decodedParams.executionPrice)),
      )
    : undefined

  const resolvedWithdrawalLtv =
    resolvedTrigger?.decodedParams.targetLtv && resolvedTrigger?.decodedParams.executionLtv
      ? new BigNumber(Number(resolvedTrigger.decodedParams.targetLtv))
          .minus(new BigNumber(Number(resolvedTrigger?.decodedParams.executionLtv)))
          .div(lambdaPercentageDenomination)
      : undefined

  const partialTakeProfitToken =
    resolvedTrigger?.decodedParams.withdrawToDebt === 'true'
      ? ('quote' as const)
      : ('collateral' as const)

  const selectedPartialTakeProfitToken =
    state.resolveTo ||
    partialTakeProfitToken ||
    partialTakeProfitConstants.defaultResolveTo

  const partialTakeProfitTokenData = getToken(
    selectedPartialTakeProfitToken === 'quote' ? quoteToken : collateralToken,
  )
  const partialTakeProfitSecondTokenData = getToken(
    selectedPartialTakeProfitToken === 'quote' ? collateralToken : quoteToken,
  )

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

  const positionPriceRatio = useMemo(() => {
    return isShort ? quotePrice.div(collateralPrice) : collateralPrice.div(quotePrice)
  }, [collateralPrice, isShort, quotePrice])

  const triggerLtvSliderConfig = getTriggerLtvSliderConfig({
    triggerLtv: state.triggerLtv || resolvedTriggerLtv || zero,
    maxMultiple: maxMultiple.times(hundred),
  })

  const withdrawalLtvSliderConfig = getWithdrawalLtvSliderConfig({
    withdrawalLtv: state.targetLtv || resolvedWithdrawalLtv || zero,
    maxMultiple: maxMultiple.times(hundred),
    triggerLtv: state.triggerLtv || resolvedTriggerLtv || zero,
  })

  const hasStopLoss = hasActiveStopLossFromTriggers({
    triggers: positionTriggers.triggers,
    protocol,
  })
  const hasTrailingStopLoss = hasActiveTrailingStopLossFromTriggers({
    triggers: positionTriggers.triggers,
    protocol,
  })

  const currentStopLossLevel = useMemo(() => {
    if (resolvedStopLossTrigger) {
      return new BigNumber(
        Number(
          resolvedStopLossTrigger.decodedParams.executionLtv ||
            resolvedStopLossTrigger.decodedParams.ltv,
        ),
      ).div(lambdaPercentageDenomination)
    }
    return undefined
  }, [resolvedStopLossTrigger])

  const currentTrailingStopLossDistance = useMemo(() => {
    if (resolvedTrailingStopLossTrigger) {
      return new BigNumber(
        Number(resolvedTrailingStopLossTrigger.decodedParams.trailingDistance),
      ).div(lambdaPriceDenomination)
    }
    return undefined
  }, [resolvedTrailingStopLossTrigger])

  const stopLossLevelLabel =
    hasStopLoss && currentStopLossLevel ? `${formatPercent(currentStopLossLevel)}` : ''
  const trailingStopLossDistanceLabel = hasTrailingStopLoss
    ? `${currentTrailingStopLossDistance}${nbsp}${priceFormat}`
    : ''

  const defaultStopLossLevel = castedPosition.category.liquidationThreshold
    .minus(stopLossConstants.offsets.max)
    .times(100)

  const extraTriggerLtv =
    state.extraTriggerLtv || currentStopLossLevel || defaultStopLossLevel

  const dynamicStopLossPrice = getDynamicStopLossPrice({
    liquidationPrice: castedPosition.debtAmount.div(
      castedPosition.collateralAmount.times(liquidationRatio),
    ),
    liquidationRatio: one.div(liquidationRatio),
    stopLossLevel: one.div(extraTriggerLtv.div(100)).times(100),
  })

  const newStopLossSliderConfig = useMemo(() => {
    const sliderMin = new BigNumber(
      loanToValue.plus(stopLossConstants.offsets.min).times(100).toFixed(0, BigNumber.ROUND_UP),
    )
    const sliderMax = liquidationRatio.minus(stopLossConstants.offsets.max).times(100)
    const sliderPercentageFill = getSliderPercentageFill({
      min: sliderMin,
      max: sliderMax,
      value: extraTriggerLtv,
    })
    return {
      sliderPercentageFill,
      minBoundry: sliderMin,
      maxBoundry: sliderMax,
      step: 0.1,
    }
  }, [extraTriggerLtv, liquidationRatio, loanToValue])

  return {
    castedPosition,
    loanToValue,
    liquidationPrice: castedPosition.debtAmount.div(
      castedPosition.collateralAmount.times(liquidationRatio),
    ),
    multiple: castedPosition.riskRatio.multiple,
    startingTakeProfitPrice: isShort ? startingTakeProfitPriceShort : startingTakeProfitPriceLong,
    resolvedWithdrawalLtv,
    resolvedTriggerLtv,
    positionPriceRatio,
    simpleView,
    isPartialTakeProfitEnabled,
    partialTakeProfitSecondTokenData,
    partialTakeProfitTokenData,
    partialTakeProfitToken,
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
    triggerLtvSliderConfig,
    withdrawalLtvSliderConfig,
    hasStopLoss,
    hasTrailingStopLoss,
    dynamicStopLossPrice,
    selectedPartialTakeProfitToken,
    newStopLossSliderConfig,
    extraTriggerLtv,
    stopLossLevelLabel,
    defaultStopLossLevel,
    currentStopLossLevel,
    currentTrailingStopLossDistance,
    trailingStopLossDistanceLabel,
  }
}
