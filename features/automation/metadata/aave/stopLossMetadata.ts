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
import {
  GetAutomationMetadata,
  StopLossDetailCards,
  StopLossMetadata,
} from 'features/automation/metadata/types'
import {
  getCollateralDuringLiquidation,
  getDynamicStopLossPrice,
  getMaxToken,
  getSliderPercentageFill,
  getStartingSlRatio,
} from 'features/automation/protection/stopLoss/helpers'
import { StopLossResetData } from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { formatPercent } from 'helpers/formatters/format'
import { one } from 'helpers/zero'

// eslint-disable-next-line func-style
export const aaveStopLossMetaData: GetAutomationMetadata<StopLossMetadata> = (context) => {
  const {
    stopLossTriggerData: { isStopLossEnabled, stopLossLevel },
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

  const collateralDuringLiquidation = getCollateralDuringLiquidation({
    lockedCollateral,
    debt,
    liquidationPrice,
    liquidationPenalty,
  })

  // FOR NOW ASSUMED OFFSET OF 1% FROM MIN
  const sliderMin = new BigNumber(
    positionRatio.multipliedBy(100).plus(one).toFixed(0, BigNumber.ROUND_DOWN),
  )
  // FOR NOW ASSUMED OFFSET OF 1% FROM MAX
  const sliderMax = liquidationRatio.minus(one.div(100)).times(100)

  const initialSlRatioWhenTriggerDoesntExist = getStartingSlRatio({
    stopLossLevel: stopLossLevel,
    isStopLossEnabled: isStopLossEnabled,
    initialStopLossSelected: sliderMax
      .minus(new BigNumber(DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE).times(100))
      .div(100),
  })
    .times(100)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)

  const resetData: StopLossResetData = {
    stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
    collateralActive: true,
    txDetails: {},
  }

  const triggerMaxToken = getMaxToken({
    stopLossLevel: stopLossLevel.times(100),
    lockedCollateral,
    liquidationRatio,
    liquidationPrice,
    debt,
  })

  // TODO calculation methods in general to be updated when correct manage aave multiply state will be available
  return {
    callbacks: {},
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
          belowCurrentPositionRatio: formatPercent(positionRatio.minus(stopLossLevel).times(100), {
            precision: 2,
          }),
        },
      },
    },
    methods: {
      getExecutionPrice: ({ stopLossLevel }) =>
        collateralPriceAtRatio({
          colRatio: stopLossLevel.div(100),
          collateral: lockedCollateral,
          vaultDebt: debt,
        }),
      getMaxToken: ({ stopLossLevel }) =>
        getMaxToken({
          stopLossLevel,
          lockedCollateral,
          liquidationRatio,
          liquidationPrice,
          debt,
        }),
      getSliderPercentageFill: ({ stopLossLevel }) =>
        getSliderPercentageFill({
          value: stopLossLevel,
          max: sliderMin,
          min: sliderMax,
        }),
      getRightBoundary: ({ stopLossLevel }) =>
        getDynamicStopLossPrice({
          liquidationPrice,
          liquidationRatio,
          stopLossLevel,
        }),
    },
    settings: {
      fixedCloseToToken: token,
      sliderDirection: 'rtl',
      sliderStep: 1,
    },
    translations: {
      ratioParam: 'vault-changes.loan-to-value',
    },
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
    values: {
      collateralDuringLiquidation,
      initialSlRatioWhenTriggerDoesntExist,
      resetData,
      sliderMax,
      sliderMin,
      triggerMaxToken,
    },
  }
}
