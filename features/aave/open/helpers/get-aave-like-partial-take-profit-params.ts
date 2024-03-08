import type { AaveLikeReserveConfigurationData } from '@oasisdex/dma-library'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import type { mapPartialTakeProfitFromLambda } from 'features/aave/manage/helpers/map-partial-take-profit-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { StrategyType } from 'features/aave/types'
import { aaveOffsets } from 'features/automation/metadata/aave/stopLossMetadata'
import {
  getDynamicStopLossPrice,
  getSliderPercentageFill,
} from 'features/automation/protection/stopLoss/helpers'
import type { ProfitsSimulationMapped } from 'helpers/triggers'
import { hundred, one, zero } from 'helpers/zero'
import { memoize } from 'lodash'
import { useMemo, useState } from 'react'

const partialTakeProfitConfig = {
  takeProfitStartingPercentageOptions: [0, 0.1, 0.2, 0.3, 0.4, 0.5] as const,
  defaultTriggelLtvOffset: new BigNumber(5),
  defaultWithdrawalLtv: new BigNumber(5),
  ltvSliderStep: 0.1,
  ltvSliderMin: new BigNumber(1), // 1% for both Trigger LTV and Withdrawal LTV
  realizedProfitRangeVisible: 3,
}

type PercentageOptionsType = typeof partialTakeProfitConfig.takeProfitStartingPercentageOptions
type ProfitToTokenType = 'debt' | 'collateral'
type PTPSliderConfig = {
  sliderPercentageFill: BigNumber
  minBoundry: BigNumber
  maxBoundry: BigNumber
  step: number
}
export type AaveLikePartialTakeProfitParams = Pick<ManageAaveStateProps, 'state'> & {
  aaveLikePartialTakeProfitLambdaData: ReturnType<typeof mapPartialTakeProfitFromLambda>
  aaveReserveState: AaveLikeReserveConfigurationData
}

export type AaveLikePartialTakeProfitParamsResult = {
  /**
   * Token data for the partial take profit token (from getToken)
   */
  partialTakeProfitTokenData: ReturnType<typeof getToken>
  /**
   * Token data for the opposite of selected token (so 'debt' if user selected 'collateral') (from getToken)
   */
  partialTakeProfitSecondTokenData: ReturnType<typeof getToken>
  /**
   * Price format for the position eg. `ETH/USDC`
   */
  priceFormat: string
  /**
   * Denomination token for the price eg. `USDC`, depending on the strategy type
   */
  priceDenominationToken: string
  collateralTokenPrice: BigNumber
  debtTokenPrice: BigNumber
  /**
   * Position price ratio (collateral/debt or debt/collateral, depending on the strategy type)
   */
  positionPriceRatio: BigNumber
  liquidationPrice: BigNumber
  currentLtv: BigNumber
  currentMultiple: BigNumber
  partialTakeProfitToken: ProfitToTokenType
  setPartialTakeProfitToken: (token: ProfitToTokenType) => void
  startingTakeProfitPrice: BigNumber
  setStartingTakeProfitPrice: (price: BigNumber) => void
  customPriceRatioPercentage: PercentageOptionsType[number] | undefined
  setCustomPriceRatioPercentage: (percentage: PercentageOptionsType[number] | undefined) => void
  triggerLtv: BigNumber
  setTriggerLtv: (ltv: BigNumber) => void
  triggerLtvSliderConfig: PTPSliderConfig
  withdrawalLtv: BigNumber
  setWithdrawalLtv: (ltv: BigNumber) => void
  withdrawalLtvSliderConfig: PTPSliderConfig
  partialTakeProfitConfig: typeof partialTakeProfitConfig
  partialTakeProfitProfits: ProfitsSimulationMapped[] | undefined
  partialTakeProfitFirstProfit: ProfitsSimulationMapped | undefined
  dynamicStopLossPriceForView: BigNumber
  newStopLossLtv: BigNumber
  setNewStopLossLtv: (ltv: BigNumber) => void
  newStopLossSliderConfig: PTPSliderConfig
}

const getTriggerLtvSliderConfig = ({
  triggerLtv,
  maxMultiple,
}: {
  triggerLtv: BigNumber
  maxMultiple: BigNumber
}): PTPSliderConfig => {
  const sliderMax = new BigNumber(
    maxMultiple.div(partialTakeProfitConfig.ltvSliderStep).toFixed(2, BigNumber.ROUND_DOWN),
  ).times(partialTakeProfitConfig.ltvSliderStep)
  const sliderPercentageFill = getSliderPercentageFill({
    min: partialTakeProfitConfig.ltvSliderMin,
    max: sliderMax,
    value: triggerLtv,
  })
  return {
    step: partialTakeProfitConfig.ltvSliderStep,
    sliderPercentageFill,
    minBoundry: partialTakeProfitConfig.ltvSliderMin,
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
    maxMultiple.div(partialTakeProfitConfig.ltvSliderStep).toFixed(2, BigNumber.ROUND_DOWN),
  ).times(partialTakeProfitConfig.ltvSliderStep)
  const sliderPercentageFill = getSliderPercentageFill({
    min: partialTakeProfitConfig.ltvSliderMin,
    max: sliderMax,
    value: withdrawalLtv,
  })
  return {
    step: partialTakeProfitConfig.ltvSliderStep,
    sliderPercentageFill,
    minBoundry: partialTakeProfitConfig.ltvSliderMin,
    maxBoundry: sliderMax,
  }
}

export const getAaveLikePartialTakeProfitParams = {
  manage: memoize(
    ({
      state,
      aaveLikePartialTakeProfitLambdaData,
      aaveReserveState,
    }: AaveLikePartialTakeProfitParams): AaveLikePartialTakeProfitParamsResult => {
      const {
        strategyConfig,
        strategyConfig: { tokens },
        strategyInfo,
        currentPosition,
      } = state.context

      // basics
      const collateralTokenPrice = strategyInfo?.oracleAssetPrice.collateral || one
      const debtTokenPrice = strategyInfo?.oracleAssetPrice.debt || one
      const isLong = strategyConfig.strategyType === StrategyType.Long
      const positionPriceRatio = isLong
        ? collateralTokenPrice.div(debtTokenPrice)
        : debtTokenPrice.div(collateralTokenPrice)
      const positionRiskRatio = state.context.currentPosition?.riskRatio.loanToValue || zero
      const currentLtv = currentPosition?.riskRatio.loanToValue || zero
      const currentMultiple = currentPosition?.riskRatio.multiple || zero
      const maxMultiple = currentPosition?.category.maxLoanToValue || zero
      const liquidationRatio = state.context?.currentPosition?.category.liquidationThreshold || zero
      const debt = amountFromWei(
        currentPosition?.debt.amount || zero,
        currentPosition?.debt.precision,
      )

      const lockedCollateral = amountFromWei(
        currentPosition?.collateral.amount || zero,
        currentPosition?.collateral.precision,
      )

      const liquidationPrice = debt.div(lockedCollateral.times(liquidationRatio)) || zero
      // user inputs
      const [partialTakeProfitToken, setPartialTakeProfitToken] = useState<ProfitToTokenType>(
        aaveLikePartialTakeProfitLambdaData.partialTakeProfitToken || 'debt',
      )
      const [startingTakeProfitPrice, setStartingTakeProfitPrice] = useState<BigNumber>(
        aaveLikePartialTakeProfitLambdaData.startingTakeProfitPrice || positionPriceRatio,
      )
      const [customPriceRatioPercentage, setCustomPriceRatioPercentage] = useState<
        PercentageOptionsType[number] | undefined
      >(0)
      const [triggerLtv, setTriggerLtv] = useState<BigNumber>(
        BigNumber.max(
          one,
          new BigNumber(
            currentLtv
              .times(hundred)
              .minus(partialTakeProfitConfig.defaultTriggelLtvOffset)
              .div(partialTakeProfitConfig.ltvSliderStep)
              .toFixed(0, BigNumber.ROUND_DOWN),
          ).times(partialTakeProfitConfig.ltvSliderStep),
        ),
      )
      const [withdrawalLtv, setWithdrawalLtv] = useState<BigNumber>(
        partialTakeProfitConfig.defaultWithdrawalLtv,
      )
      const [newStopLossLtv, setNewStopLossLtv] = useState<BigNumber>(
        aaveReserveState.liquidationThreshold.minus(aaveOffsets.manage.max).times(100),
      )
      const dynamicStopLossPrice = getDynamicStopLossPrice({
        liquidationPrice,
        liquidationRatio: one.div(liquidationRatio),
        stopLossLevel: one.div(newStopLossLtv.div(100)).times(100),
      })
      const dynamicStopLossPriceForView =
        state.context.strategyConfig.strategyType === StrategyType.Short
          ? one.div(dynamicStopLossPrice)
          : dynamicStopLossPrice

      const newStopLossSliderConfig = useMemo(() => {
        const sliderMin = new BigNumber(
          positionRiskRatio.plus(aaveOffsets.manage.min).times(100).toFixed(0, BigNumber.ROUND_UP),
        )
        const sliderMax = liquidationRatio.minus(aaveOffsets.manage.max).times(100)
        const sliderPercentageFill = getSliderPercentageFill({
          min: sliderMin,
          max: sliderMax,
          value: newStopLossLtv,
        })
        return {
          sliderPercentageFill,
          minBoundry: sliderMin,
          maxBoundry: sliderMax,
          step: 0.1,
        }
      }, [liquidationRatio, positionRiskRatio, newStopLossLtv])

      // calcs
      const partialTakeProfitTokenData = useMemo(
        () => getToken(tokens[partialTakeProfitToken]),
        [partialTakeProfitToken, tokens],
      )
      const partialTakeProfitSecondTokenData = useMemo(
        () => getToken(tokens[partialTakeProfitToken === 'debt' ? 'collateral' : 'debt']),
        [partialTakeProfitToken, tokens],
      )
      const priceFormat = isLong
        ? `${tokens.collateral}/${tokens.debt}`
        : `${tokens.debt}/${tokens.collateral}`
      const priceDenominationToken = isLong ? tokens.debt : tokens.collateral
      const triggerLtvSliderConfig = getTriggerLtvSliderConfig({
        triggerLtv,
        maxMultiple: maxMultiple.times(hundred),
      })
      const withdrawalLtvSliderConfig = getWithdrawalLtvSliderConfig({
        withdrawalLtv,
        maxMultiple: maxMultiple.times(hundred),
        triggerLtv,
      })
      return {
        partialTakeProfitConfig,
        partialTakeProfitTokenData,
        partialTakeProfitSecondTokenData,
        priceFormat,
        priceDenominationToken,
        collateralTokenPrice,
        debtTokenPrice,
        positionPriceRatio,
        liquidationPrice,
        currentLtv,
        currentMultiple,
        partialTakeProfitToken,
        setPartialTakeProfitToken,
        startingTakeProfitPrice,
        setStartingTakeProfitPrice,
        customPriceRatioPercentage,
        setCustomPriceRatioPercentage,
        triggerLtv,
        setTriggerLtv,
        triggerLtvSliderConfig,
        withdrawalLtv,
        setWithdrawalLtv,
        withdrawalLtvSliderConfig,
        partialTakeProfitProfits: state.context.partialTakeProfitProfits,
        partialTakeProfitFirstProfit: state.context.partialTakeProfitFirstProfit,
        newStopLossLtv,
        setNewStopLossLtv,
        newStopLossSliderConfig,
        dynamicStopLossPriceForView,
      }
    },
  ),
}
