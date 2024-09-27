/* eslint-disable func-style */
import BigNumber from 'bignumber.js'
import { addAutomationBotTrigger } from 'blockchain/calls/automationBot.constants'
import { removeAutomationBotAggregatorTriggers } from 'blockchain/calls/automationBotAggregator.constants'
import type { AutomationBotRemoveTriggersData } from 'blockchain/calls/automationBotAggregator.types'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import {
  DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
  NEXT_COLL_RATIO_OFFSET,
} from 'features/automation/common/consts'
import { getShouldRemoveAllowance } from 'features/automation/common/helpers/getShouldRemoveAllowance'
import {
  hasInsufficientEthFundsForTx,
  hasMoreDebtThanMaxForStopLoss,
  hasPotentialInsufficientEthFundsForTx,
  isStopLossTriggerCloseToAutoSellTrigger,
  isStopLossTriggerHigherThanAutoBuyTarget,
} from 'features/automation/common/validation/validators'
import type { ContextWithoutMetadata, StopLossMetadata } from 'features/automation/metadata/types'
import { StopLossDetailCards } from 'features/automation/metadata/types'
import {
  getCollateralDuringLiquidation,
  getDynamicStopLossPrice,
  getMaxToken,
  getSliderPercentageFill,
  getStartingSlRatio,
} from 'features/automation/protection/stopLoss/helpers'
import type { StopLossResetData } from 'features/automation/protection/stopLoss/state/StopLossFormChange.types'
import { prepareAddStopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { getLocalAppConfig } from 'helpers/config'
import { formatPercent } from 'helpers/formatters/format'

export function getMakerStopLossMetadata(context: ContextWithoutMetadata): StopLossMetadata {
  const {
    automationTriggersData,
    triggerData: {
      autoSellTriggerData,
      stopLossTriggerData: { isStopLossEnabled, isToCollateral, stopLossLevel, triggerId },
    },
    positionData: {
      positionRatio,
      nextPositionRatio,
      liquidationRatio,
      liquidationPrice,
      liquidationPenalty,
      lockedCollateral,
      debt,
      id,
      owner,
    },
  } = context

  const collateralDuringLiquidation = getCollateralDuringLiquidation({
    lockedCollateral,
    debt,
    liquidationPrice,
    liquidationPenalty,
  })

  const sliderMin = liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100)).times(100)
  const sliderMax = new BigNumber(
    (autoSellTriggerData.isTriggerEnabled
      ? autoSellTriggerData.execCollRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET).div(100)
      : nextPositionRatio.minus(NEXT_COLL_RATIO_OFFSET.div(100))
    )
      .multipliedBy(100)
      .toFixed(0, BigNumber.ROUND_DOWN),
  )

  const initialSlRatioWhenTriggerDoesntExist = getStartingSlRatio({
    stopLossLevel,
    isStopLossEnabled,
    initialStopLossSelected: sliderMin
      .plus(DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE.times(100))
      .div(100),
  })
    .times(100)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)

  const resetData: StopLossResetData = {
    stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
    collateralActive: isToCollateral,
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
    liquidationRatio,
    stopLossLevel: stopLossLevel.times(100),
  })

  const removeTxData: AutomationBotRemoveTriggersData = {
    removeAllowance: getShouldRemoveAllowance(automationTriggersData),
    proxyAddress: owner,
    triggersId: [triggerId.toNumber()],
    kind: TxMetaKind.removeTriggers,
  }
  const { StopLossWrite: stopLossWriteEnabled } = getLocalAppConfig('features')

  return {
    callbacks: {},
    detailCards: {
      cardsSet: [
        StopLossDetailCards.STOP_LOSS_LEVEL,
        StopLossDetailCards.COLLATERIZATION_RATIO,
        StopLossDetailCards.DYNAMIC_STOP_PRICE,
        StopLossDetailCards.ESTIMATED_TOKEN_ON_TRIGGER,
      ],
      cardsConfig: {
        // most likely it won't be needed when we switch to LTV in maker
        stopLossLevelCard: {
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
      getRightBoundary: ({ stopLossLevel }) =>
        stopLossLevel
          .dividedBy(100)
          .multipliedBy(context.environmentData.nextCollateralPrice)
          .dividedBy(nextPositionRatio),
      getSliderPercentageFill: ({ stopLossLevel }) =>
        getSliderPercentageFill({
          value: stopLossLevel,
          min: sliderMin,
          max: sliderMax,
        }),
      prepareAddStopLossTriggerData: ({ stopLossLevel, collateralActive }) => {
        return prepareAddStopLossTriggerData({
          id,
          owner,
          isCloseToCollateral: collateralActive,
          stopLossLevel: stopLossLevel,
          replacedTriggerId: triggerId.toNumber(),
        })
      },
    },
    settings: {
      sliderStep: 1,
    },
    translations: {
      ratioParamTranslationKey: 'system.collateral-ratio',
      stopLossLevelCardFootnoteKey: 'system.cards.stop-loss-collateral-ratio.footnote-below',
      bannerStrategiesKey: 'protection.stop-loss-or-auto-sell',
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
      addTrigger: addAutomationBotTrigger,
      removeTrigger: removeAutomationBotAggregatorTriggers,
    },
    stopLossWriteEnabled,
  }
}
