import BigNumber from 'bignumber.js'
import {
  addAutomationBotTriggerV2,
  removeAutomationBotTriggerV2,
} from 'blockchain/calls/automationBot.constants'
import type { AutomationBotV2RemoveTriggerData } from 'blockchain/calls/automationBot.types'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import type { NetworkIds } from 'blockchain/networks'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { supportsAaveStopLoss } from 'features/aave/helpers/supportsAaveStopLoss'
import { DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE } from 'features/automation/common/consts'
import { getShouldRemoveAllowance } from 'features/automation/common/helpers/getShouldRemoveAllowance'
import { isSupportedAaveAutomationTokenPair } from 'features/automation/common/helpers/isSupportedAaveAutomationTokenPair'
import {
  hasInsufficientEthFundsForTx,
  hasMoreDebtThanMaxForStopLoss,
  hasPotentialInsufficientEthFundsForTx,
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
import {
  getAaveLikeCommandContractType,
  getAaveLikeStopLossTriggerType,
} from 'features/automation/protection/stopLoss/openFlow/helpers'
import type { StopLossResetData } from 'features/automation/protection/stopLoss/state/StopLossFormChange.types'
import { prepareStopLossTriggerDataV2 } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { getLocalAppConfig } from 'helpers/config'
import { formatPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import type { LendingProtocol } from 'lendingProtocols'

export const aaveOffsets = {
  open: {
    min: new BigNumber(0.01),
    max: new BigNumber(0.025),
  },
  manage: {
    min: new BigNumber(0.01),
    max: new BigNumber(0.025),
  },
}

export function createGetAaveStopLossMetadata(
  lendingProtocol: LendingProtocol,
  networkId: NetworkIds,
) {
  return function (context: ContextWithoutMetadata): StopLossMetadata {
    const { AaveV3ProtectionWrite } = getLocalAppConfig('features')
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
        token,
      },
    } = context

    const collateralDuringLiquidation = getCollateralDuringLiquidation({
      lockedCollateral,
      debt,
      liquidationPrice,
      liquidationPenalty,
    })

    const sliderMin = new BigNumber(
      positionRatio.plus(aaveOffsets.manage.min).times(100).toFixed(0, BigNumber.ROUND_UP),
    )
    const sliderMax = liquidationRatio.minus(aaveOffsets.manage.max).times(100)

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

    const aaveProtectionWriteEnabled =
      AaveV3ProtectionWrite &&
      supportsAaveStopLoss(lendingProtocol, networkId) &&
      isSupportedAaveAutomationTokenPair(token, debtToken)

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
            belowCurrentPositionRatio: formatPercent(
              stopLossLevel.minus(positionRatio).times(100),
              {
                precision: 2,
              },
            ),
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
            stopLossLevel: stopLossLevel.isZero()
              ? zero
              : one.div(stopLossLevel.div(100)).times(100),
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
            getAaveLikeCommandContractType(lendingProtocol),
            owner,
            getAaveLikeStopLossTriggerType(lendingProtocol),
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
}
