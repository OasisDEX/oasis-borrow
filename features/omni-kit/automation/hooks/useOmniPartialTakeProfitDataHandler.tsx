import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
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
  useOmniCardDataEstToReceive,
  useOmniCardDataNextDynamicTriggerPrice,
  useOmniCardDataRealizedProfit,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  getOmniNetValuePnlData,
  mapBorrowCumulativesToOmniCumulatives,
} from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { nbsp } from 'helpers/nbsp'
import { TriggerAction } from 'helpers/triggers'
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
      collateralPrecision,
      quotePrecision,
    },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation: automationDynamicValues },
    },
    automation: {
      commonForm: { state: commonState },
      positionTriggers,
      automationForms: {
        partialTakeProfit: { state },
      },
      simulationData,
      isSimulationLoading,
    },
    position: {
      currentPosition: { position },
      history,
    },
  } = useOmniProductContext(productType)

  const castedPosition = position as AaveLikePositionV2

  const isCollateralActive = state.resolveTo
    ? state.resolveTo === 'collateral'
    : automationDynamicValues?.triggers.partialTakeProfit?.decodedParams.withdrawToDebt === 'false'

  const simpleView = commonState.uiDropdownOptimization !== AutomationFeatures.PARTIAL_TAKE_PROFIT
  const maxMultiple = castedPosition?.category.maxLoanToValue || zero
  const loanToValue = castedPosition.riskRatio.loanToValue
  const liquidationRatio = castedPosition.category.liquidationThreshold

  const isPartialTakeProfitEnabled = !!automationDynamicValues?.flags.isPartialTakeProfitEnabled

  const resolvedTrigger = automationDynamicValues?.triggers.partialTakeProfit
  const resolvedStopLossTrigger = automationDynamicValues?.triggers.stopLoss
  const resolvedTrailingStopLossTrigger = automationDynamicValues?.triggers.trailingStopLoss

  const resolvedTriggerLtv = resolvedTrigger?.decodedMappedParams.executionLtv

  const startingTakeProfitPriceLong = resolvedTrigger?.decodedMappedParams.executionPrice

  const startingTakeProfitPriceShort = resolvedTrigger?.decodedMappedParams.executionPrice
    ? one.div(resolvedTrigger?.decodedMappedParams.executionPrice)
    : undefined

  const resolvedWithdrawalLtv =
    resolvedTrigger?.decodedMappedParams.ltvStep &&
    resolvedTrigger?.decodedMappedParams.executionLtv
      ? resolvedTrigger.decodedMappedParams.ltvStep.minus(
          resolvedTrigger.decodedMappedParams.executionLtv,
        )
      : undefined

  const partialTakeProfitToken =
    resolvedTrigger?.decodedParams.withdrawToDebt === 'true'
      ? ('quote' as const)
      : ('collateral' as const)

  const selectedPartialTakeProfitToken =
    state.resolveTo || partialTakeProfitToken || partialTakeProfitConstants.defaultResolveTo

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
    triggerLtv: state.triggerLtv || resolvedTriggerLtv?.times(100) || zero,
    maxMultiple: maxMultiple.times(hundred),
  })

  const withdrawalLtvSliderConfig = getWithdrawalLtvSliderConfig({
    withdrawalLtv: state.ltvStep || resolvedWithdrawalLtv?.times(100) || zero,
    maxMultiple: maxMultiple.times(hundred),
    triggerLtv: state.triggerLtv || resolvedTriggerLtv?.times(100) || zero,
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
          resolvedStopLossTrigger.decodedMappedParams.executionLtv ||
            resolvedStopLossTrigger.decodedMappedParams.ltv,
        ),
      )
    }
    return undefined
  }, [resolvedStopLossTrigger])

  const currentTrailingStopLossDistance = useMemo(() => {
    if (resolvedTrailingStopLossTrigger) {
      return resolvedTrailingStopLossTrigger.decodedMappedParams.trailingDistance
    }
    return undefined
  }, [resolvedTrailingStopLossTrigger])

  const stopLossLevelLabel =
    hasStopLoss && currentStopLossLevel ? `${formatDecimalAsPercent(currentStopLossLevel)}` : ''
  const trailingStopLossDistanceLabel =
    hasTrailingStopLoss && currentTrailingStopLossDistance
      ? `${formatCryptoBalance(currentTrailingStopLossDistance.div(10000))}${nbsp}${priceFormat}`
      : ''

  const defaultStopLossLevel = castedPosition.category.maxLoanToValue
    .minus(stopLossConstants.offsets.max)
    .times(100)

  const extraTriggerLtv =
    state.extraTriggerLtv || currentStopLossLevel?.times(100) || defaultStopLossLevel

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

  const startingTakeProfitPrice = isShort
    ? startingTakeProfitPriceShort
    : startingTakeProfitPriceLong

  const nextDynamicTriggerPriceCommonData = useOmniCardDataNextDynamicTriggerPrice({
    priceFormat,
    nextDynamicTriggerPrice: startingTakeProfitPrice,
    afterNextDynamicTriggerPrice: state.price,
    triggerLtv: resolvedTriggerLtv,
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.next-dynamic-trigger-price.title')}
        description={t('omni-kit.content-card.next-dynamic-trigger-price.modal-description')}
      />
    ),
  })

  const resolvedEstimatedToReceiveCollateral = resolvedTrigger?.dynamicParams?.nextProfit
    ? new BigNumber(
        resolvedTrigger.dynamicParams.nextProfit.realizedProfitInCollateral.balance,
      ).shiftedBy(-collateralPrecision)
    : undefined

  const resolvedEstimatedToReceiveDebt = resolvedTrigger?.dynamicParams?.nextProfit
    ? new BigNumber(
        resolvedTrigger.dynamicParams.nextProfit.realizedProfitInDebt.balance,
      ).shiftedBy(-quotePrecision)
    : undefined

  const resolvedEstimatedToReceive = isCollateralActive
    ? resolvedEstimatedToReceiveCollateral
    : resolvedEstimatedToReceiveDebt

  const resolvedEstimatedToReceiveFooter = !isCollateralActive
    ? resolvedEstimatedToReceiveCollateral
    : resolvedEstimatedToReceiveDebt

  const simulatedNextEstimatedToReceive =
    simulationData?.simulation && 'profits' in simulationData?.simulation
      ? simulationData?.simulation?.profits?.[0]
      : undefined

  const isAddOrUpdateAction = state.action !== TriggerAction.Remove

  const afterResolvedEstimatedToReceive =
    simulatedNextEstimatedToReceive && isAddOrUpdateAction
      ? isCollateralActive
        ? new BigNumber(
            simulatedNextEstimatedToReceive.realizedProfitInCollateral.balance,
          ).shiftedBy(-collateralPrecision)
        : new BigNumber(simulatedNextEstimatedToReceive.realizedProfitInDebt.balance).shiftedBy(
            -quotePrecision,
          )
      : undefined

  const estimatedToReceiveCommonData = useOmniCardDataEstToReceive({
    estimatedToReceive: resolvedEstimatedToReceive,
    estimatedToReceiveFooter: resolvedEstimatedToReceiveFooter,
    afterEstimatedToReceive: afterResolvedEstimatedToReceive,
    primaryUnit: isCollateralActive ? collateralToken : quoteToken,
    secondaryUnit: !isCollateralActive ? collateralToken : quoteToken,
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.estimated-to-receive.title')}
        description={t('omni-kit.content-card.estimated-to-receive.modal-description')}
      />
    ),
  })

  const resolveToToken = isCollateralActive ? collateralToken : quoteToken

  return {
    castedPosition,
    loanToValue,
    liquidationPrice: castedPosition.debtAmount.div(
      castedPosition.collateralAmount.times(liquidationRatio),
    ),
    multiple: castedPosition.riskRatio.multiple,
    startingTakeProfitPrice,
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
    nextDynamicTriggerPriceCommonData,
    estimatedToReceiveCommonData,
    isLoading: isSimulationLoading && isAddOrUpdateAction,
    isCollateralActive,
    afterResolvedEstimatedToReceive,
    resolveToToken,
  }
}
