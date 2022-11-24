import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE } from 'features/automation/common/consts'
import {
  hasInsufficientEthFundsForTx,
  hasMoreDebtThanMaxForStopLoss,
  hasPotentialInsufficientEthFundsForTx,
  isStopLossTriggerCloseToAutoSellTrigger,
  isStopLossTriggerCloseToConstantMultipleSellTrigger,
  isStopLossTriggerHigherThanAutoBuyTarget,
} from 'features/automation/common/validation/validators'
import { GetStopLossMetadata, StopLossDetailCards } from 'features/automation/metadata/types'
import {
  getCollateralDuringLiquidation,
  getDynamicStopLossPrice,
  getMaxToken,
  getSliderPercentageFill,
  getStartingSlRatio,
} from 'features/automation/protection/stopLoss/helpers'
import {
  StopLossFormChange,
  StopLossResetData,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { formatPercent } from 'helpers/formatters/format'
import { one } from 'helpers/zero'

// eslint-disable-next-line func-style
export const aaveStopLossMetaData: GetStopLossMetadata = (context) => {
  const {
    stopLossTriggerData,
    positionData: {
      token,
      positionRatio,
      liquidationRatio,
      liquidationPrice,
      liquidationPenalty,
      lockedCollateral,
      debt,
    },
  } = context

  // FOR NOW ASSUMED OFFSET OF 1% FROM MIN
  const sliderMin = new BigNumber(
    positionRatio.multipliedBy(100).plus(one).toFixed(0, BigNumber.ROUND_DOWN),
  )
  // FOR NOW ASSUMED OFFSET OF 1% FROM MAX
  const sliderMax = liquidationRatio.minus(one.div(100)).times(100)

  const selectedStopLossCollRatioIfTriggerDoesntExist = sliderMax.minus(
    new BigNumber(DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE).times(100),
  )
  const initialSlRatioWhenTriggerDoesntExist = getStartingSlRatio({
    stopLossLevel: stopLossTriggerData.stopLossLevel,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    initialStopLossSelected: selectedStopLossCollRatioIfTriggerDoesntExist.div(100),
  })
    .times(100)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)

  const resetData: StopLossResetData = {
    stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
    collateralActive: true,
    txDetails: {},
  }

  const collateralDuringLiquidation = getCollateralDuringLiquidation({
    lockedCollateral,
    debt,
    liquidationPrice,
    liquidationPenalty,
  })

  const belowCurrentPositionRatio = formatPercent(
    positionRatio.minus(stopLossTriggerData.stopLossLevel).times(100),
    { precision: 2 },
  )

  // TODO calculation methods in general to be updated when correct manage aave multiply state will be available
  return {
    validation: {
      getAddErrors: ({ state: { stopLossLevel, txDetails } }) => ({
        hasInsufficientEthFundsForTx: hasInsufficientEthFundsForTx({
          context,
          txError: txDetails?.txError,
        }),
        hasMoreDebtThanMaxForStopLoss: hasMoreDebtThanMaxForStopLoss({ context }),
        isStopLossTriggerHigherThanAutoBuyTarget: isStopLossTriggerHigherThanAutoBuyTarget({
          context,
          stopLossLevel,
        }),
      }),
      getAddWarnings: ({ gasEstimationUsd, state: { stopLossLevel } }) => ({
        hasPotentialInsufficientEthFundsForTx: hasPotentialInsufficientEthFundsForTx({
          context,
          gasEstimationUsd,
        }),
        isStopLossTriggerCloseToAutoSellTrigger: isStopLossTriggerCloseToAutoSellTrigger({
          context,
          sliderMax,
          stopLossLevel,
        }),
        isStopLossTriggerCloseToConstantMultipleSellTrigger: isStopLossTriggerCloseToConstantMultipleSellTrigger(
          {
            context,
            sliderMax,
            stopLossLevel,
          },
        ),
      }),
      cancelErrors: ['hasInsufficientEthFundsForTx'],
      cancelWarnings: ['hasPotentialInsufficientEthFundsForTx'],
    },
    getExecutionPrice: ({ state }: { state: StopLossFormChange }) =>
      collateralPriceAtRatio({
        colRatio: state.stopLossLevel.div(100),
        collateral: lockedCollateral,
        vaultDebt: debt,
      }),
    getSliderPercentageFill: ({ state }: { state: StopLossFormChange }) =>
      getSliderPercentageFill({
        value: state.stopLossLevel,
        max: sliderMin,
        min: sliderMax,
      }),
    getRightBoundary: ({ state }: { state: StopLossFormChange }) =>
      getDynamicStopLossPrice({
        liquidationPrice,
        liquidationRatio,
        stopLossLevel: state.stopLossLevel,
      }),

    getMaxToken: ({ state }: { state: StopLossFormChange }) =>
      getMaxToken({
        stopLossLevel: state.stopLossLevel,
        lockedCollateral,
        liquidationRatio,
        liquidationPrice,
        debt,
      }),
    triggerMaxToken: getMaxToken({
      stopLossLevel: stopLossTriggerData.stopLossLevel.times(100),
      lockedCollateral,
      liquidationRatio,
      liquidationPrice,
      debt,
    }),
    collateralDuringLiquidation,
    sliderMax,
    sliderMin,
    resetData,
    sliderStep: 1,
    initialSlRatioWhenTriggerDoesntExist,
    detailCards: {
      cardsSet: [
        StopLossDetailCards.STOP_LOSS_LEVEL,
        StopLossDetailCards.LOAN_TO_VALUE,
        StopLossDetailCards.DYNAMIC_STOP_PRICE,
        StopLossDetailCards.ESTIMATED_TOKEN_ON_TRIGGER,
      ],
      cardsConfig: {
        // most likely it won't be needed when we switch to LTV in maker
        stopLossLevelCard: {
          // TODO copy to be udpated
          modalDescription: 'manage-multiply-vault.card.stop-loss-coll-ratio-desc',
          belowCurrentPositionRatio,
        },
      },
    },
    ratioParam: 'vault-changes.loan-to-value',
    fixedCloseToToken: token,
    sliderDirection: 'rtl',
  }
}
