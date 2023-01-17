import BigNumber from 'bignumber.js'
import {
  addAutomationBotTriggerV2,
  AutomationBotV2RemoveTriggerData,
  removeAutomationBotTriggerV2,
} from 'blockchain/calls/automationBot'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE } from 'features/automation/common/consts'
import { getShouldRemoveAllowance } from 'features/automation/common/helpers'
import {
  hasInsufficientEthFundsForTx,
  hasMoreDebtThanMaxForStopLoss,
  hasPotentialInsufficientEthFundsForTx,
  isStopLossTriggerCloseToAutoSellTrigger,
  isStopLossTriggerCloseToConstantMultipleSellTrigger,
  isStopLossTriggerHigherThanAutoBuyTarget,
} from 'features/automation/common/validation/validators'
import {
  ContextWithoutMetadata,
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
import { prepareStopLossTriggerDataV2 } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { formatPercent } from 'helpers/formatters/format'
import { one } from 'helpers/zero'

export function getAaveStopLossMetadata(context: ContextWithoutMetadata): StopLossMetadata {
  const {
    automationTriggersData,
    triggerData: {
      stopLossTriggerData: { isStopLossEnabled, stopLossLevel, triggerId, executionParams },
    },
    positionData: {
      token,
      positionRatio,
      liquidationRatio,
      liquidationPrice,
      liquidationPenalty,
      lockedCollateral,
      debt,
      owner,
      debtTokenAddress,
      tokenAddress,
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
    collateralActive: false,
    txDetails: {},
  }

  const triggerMaxToken = getMaxToken({
    stopLossLevel: stopLossLevel.times(100),
    lockedCollateral,
    liquidationRatio,
    liquidationPrice,
    debt,
  })

  const dynamicStopLossPrice = getDynamicStopLossPrice({
    liquidationPrice,
    liquidationRatio: one.div(liquidationRatio),
    stopLossLevel: one.div(stopLossLevel).times(100),
  })

  const removeTxData: AutomationBotV2RemoveTriggerData = {
    kind: TxMetaKind.removeTriggers,
    proxyAddress: owner,
    triggersIds: [triggerId.toNumber()],
    triggersData: [executionParams],
    removeAllowance: getShouldRemoveAllowance(automationTriggersData),
  }

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
          belowCurrentPositionRatio: formatPercent(stopLossLevel.minus(positionRatio).times(100), {
            precision: 2,
          }),
        },
      },
    },
    methods: {
      getExecutionPrice: ({ stopLossLevel }) =>
        collateralPriceAtRatio({
          colRatio: one.div(stopLossLevel.div(100)),
          collateral: lockedCollateral,
          vaultDebt: debt,
        }),
      getMaxToken: ({ stopLossLevel }) =>
        getMaxToken({
          stopLossLevel: one.div(stopLossLevel.div(100)).times(100),
          lockedCollateral,
          liquidationRatio: one.div(liquidationRatio),
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
          liquidationRatio: one.div(liquidationRatio),
          stopLossLevel: one.div(stopLossLevel.div(100)).times(100),
        }),
      prepareAddStopLossTriggerData: ({ stopLossLevel, collateralActive }) => {
        const baseTriggerData = prepareStopLossTriggerDataV2(
          owner,
          collateralActive,
          stopLossLevel,
          debtTokenAddress!,
          tokenAddress!,
        )

        return {
          ...baseTriggerData,
          replacedTriggerIds: [triggerId],
          kind: TxMetaKind.addTrigger,
        }
      },
    },
    settings: {
      fixedCloseToToken: token,
      sliderDirection: 'rtl',
      sliderStep: 1,
    },
    translations: {
      ratioParamTranslationKey: 'vault-changes.loan-to-value',
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
      dynamicStopLossPrice,
      removeTxData,
    },
    contracts: {
      addTrigger: addAutomationBotTriggerV2,
      removeTrigger: removeAutomationBotTriggerV2,
    },
  }
}
