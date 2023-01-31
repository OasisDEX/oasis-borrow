import { TriggerType } from '@oasisdex/automation'
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
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { one, zero } from 'helpers/zero'

export const aaveOffsetFromMinAndMax = new BigNumber(0.05)
export const aaveOffsetFromMaxDuringOpenFLow = new BigNumber(0.1)

export function getAaveStopLossMetadata(context: ContextWithoutMetadata): StopLossMetadata {
  const {
    automationTriggersData,
    triggerData: {
      stopLossTriggerData: { isStopLossEnabled, stopLossLevel, triggerId, executionParams },
    },
    positionData: {
      positionRatio,
      liquidationRatio,
      liquidationPrice,
      liquidationPenalty,
      lockedCollateral,
      debt,
      owner,
      debtTokenAddress,
      collateralTokenAddress,
      debtToken,
    },
  } = context

  const collateralDuringLiquidation = getCollateralDuringLiquidation({
    lockedCollateral,
    debt,
    liquidationPrice,
    liquidationPenalty,
  })

  const sliderMin = new BigNumber(
    positionRatio.plus(aaveOffsetFromMinAndMax).times(100).toFixed(0, BigNumber.ROUND_UP),
  )
  const sliderMax = liquidationRatio.minus(aaveOffsetFromMinAndMax).times(100)

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
    stopLossLevel: one.div(stopLossLevel).times(100),
    lockedCollateral,
    liquidationRatio: one.div(liquidationRatio),
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

  const aaveProtectionWriteEnabled = useFeatureToggle('AaveProtectionWrite')

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
          modalDescription: 'manage-multiply-vault.card.stop-loss-ltv-desc',
          belowCurrentPositionRatio: formatPercent(stopLossLevel.minus(positionRatio).times(100), {
            precision: 2,
          }),
        },
      },
    },
    methods: {
      getExecutionPrice: ({ stopLossLevel }) =>
        collateralPriceAtRatio({
          colRatio: stopLossLevel.isZero() ? zero : one.div(stopLossLevel.div(100)),
          collateral: lockedCollateral,
          vaultDebt: debt,
        }),
      getMaxToken: ({ stopLossLevel }) =>
        getMaxToken({
          stopLossLevel: stopLossLevel.isZero() ? zero : one.div(stopLossLevel.div(100)).times(100),
          lockedCollateral,
          liquidationRatio: one.div(liquidationRatio),
          liquidationPrice,
          debt,
        }),
      getSliderPercentageFill: ({ stopLossLevel }) =>
        getSliderPercentageFill({
          value: stopLossLevel,
          max: sliderMax,
          min: sliderMin,
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
          TriggerType.AaveStopLossToDebt,
          collateralActive,
          stopLossLevel,
          debtTokenAddress!,
          collateralTokenAddress!,
        )

        return {
          ...baseTriggerData,
          replacedTriggerIds: [triggerId],
          replacedTriggersData: [executionParams],
          kind: TxMetaKind.addTrigger,
        }
      },
    },
    settings: {
      fixedCloseToToken: debtToken,
      sliderDirection: 'ltr',
      sliderStep: 1,
    },
    translations: {
      ratioParamTranslationKey: 'vault-changes.loan-to-value',
      stopLossLevelCardFootnoteKey: 'system.cards.stop-loss-collateral-ratio.footnote-above',
      bannerStrategiesKey: 'protection.stop-loss',
    },
    validation: {
      getAddErrors: ({ state: { txDetails } }) => ({
        hasInsufficientEthFundsForTx: hasInsufficientEthFundsForTx({
          context,
          txError: txDetails?.txError,
        }),
        hasMoreDebtThanMaxForStopLoss: hasMoreDebtThanMaxForStopLoss({ context }),
      }),
      getAddWarnings: ({ gasEstimationUsd }) => ({
        hasPotentialInsufficientEthFundsForTx: hasPotentialInsufficientEthFundsForTx({
          context,
          gasEstimationUsd,
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
      addTrigger: addAutomationBotTriggerV2,
      removeTrigger: removeAutomationBotTriggerV2,
    },
    stopLossWriteEnabled: aaveProtectionWriteEnabled,
  }
}
