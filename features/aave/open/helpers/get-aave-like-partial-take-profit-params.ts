import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import type { mapPartialTakeProfitFromLambda } from 'features/aave/manage/helpers/map-partial-take-profit-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { StrategyType } from 'features/aave/types'
import { getSliderPercentageFill } from 'features/automation/protection/stopLoss/helpers'
import { hundred, one, zero } from 'helpers/zero'
import { memoize } from 'lodash'
import { useMemo, useState } from 'react'

type PercentageOptionsType = typeof takeProfitStartingPercentageOptions
type ProfitToTokenType = 'debt' | 'collateral'
type PTPSliderConfig = {
  sliderPercentageFill: BigNumber
  minBoundry: BigNumber
  maxBoundry: BigNumber
  step: number
}
export type AaveLikePartialTakeProfitParams = Pick<ManageAaveStateProps, 'state'> & {
  partialTakeProfitLambdaData: ReturnType<typeof mapPartialTakeProfitFromLambda>
}

export type AaveLikePartialTakeProfitParamsResult = {
  /**
   * Options for the starting percentage of the take profit (+0 for current)
   */
  takeProfitStartingPercentageOptions: PercentageOptionsType
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
}

const takeProfitStartingPercentageOptions = [0, 0.1, 0.2, 0.3, 0.4, 0.5] as const
const defaultTriggelLtvOffset = new BigNumber(5)
const defaultWithdrawalLtv = new BigNumber(5)
const ltvSliderStep = 0.1
const ltvSliderMin = new BigNumber(1) // 1% for both Trigger LTV and Withdrawal LTV

const getTriggerLtvSliderConfig = ({
  triggerLtv,
  maxMultiple,
}: {
  triggerLtv: BigNumber
  maxMultiple: BigNumber
}): PTPSliderConfig => {
  const sliderMax = new BigNumber(
    maxMultiple.div(ltvSliderStep).toFixed(2, BigNumber.ROUND_DOWN),
  ).times(ltvSliderStep)
  const sliderPercentageFill = getSliderPercentageFill({
    min: ltvSliderMin,
    max: sliderMax,
    value: triggerLtv,
  })
  return {
    step: ltvSliderStep,
    sliderPercentageFill,
    minBoundry: ltvSliderMin,
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
    maxMultiple.div(ltvSliderStep).toFixed(2, BigNumber.ROUND_DOWN),
  ).times(ltvSliderStep)
  const sliderPercentageFill = getSliderPercentageFill({
    min: ltvSliderMin,
    max: sliderMax,
    value: withdrawalLtv,
  })
  return {
    step: ltvSliderStep,
    sliderPercentageFill,
    minBoundry: ltvSliderMin,
    maxBoundry: sliderMax,
  }
}

export const getAaveLikePartialTakeProfitParams = {
  manage: memoize(
    ({
      state,
    }: // partialTakeProfitLambdaData,
    AaveLikePartialTakeProfitParams): AaveLikePartialTakeProfitParamsResult => {
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
      const currentLtv = currentPosition?.riskRatio.loanToValue || zero
      const currentMultiple = currentPosition?.riskRatio.multiple || zero
      const maxMultiple = currentPosition?.category.maxLoanToValue || zero
      // user inputs
      const [partialTakeProfitToken, setPartialTakeProfitToken] =
        useState<ProfitToTokenType>('debt')
      const [startingTakeProfitPrice, setStartingTakeProfitPrice] =
        useState<BigNumber>(positionPriceRatio)
      const [customPriceRatioPercentage, setCustomPriceRatioPercentage] = useState<
        PercentageOptionsType[number] | undefined
      >(0)
      const [triggerLtv, setTriggerLtv] = useState<BigNumber>(
        new BigNumber(
          currentLtv
            .times(hundred)
            .minus(defaultTriggelLtvOffset)
            .div(ltvSliderStep)
            .toFixed(0, BigNumber.ROUND_DOWN),
        ).times(ltvSliderStep),
      )
      const [withdrawalLtv, setWithdrawalLtv] = useState<BigNumber>(defaultWithdrawalLtv)

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
        takeProfitStartingPercentageOptions,
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
      }
    },
  ),
}
