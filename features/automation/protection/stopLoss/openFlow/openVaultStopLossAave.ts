import { TriggerType } from '@oasisdex/automation'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { addAutomationBotTrigger } from 'blockchain/calls/automationBot'
import {
  AutomationBotRemoveTriggersData,
  removeAutomationBotAggregatorTriggers,
} from 'blockchain/calls/automationBotAggregator'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { AutomationPositionData } from 'components/AutomationContextProvider'
import { OpenAaveContext, OpenAaveEvent } from 'features/aave/open/state'
import { AutomationAddTriggerData } from 'features/automation/common/txDefinitions'
import { aaveOffsetFromMinAndMax } from 'features/automation/metadata/aave/stopLossMetadata'
import { StopLossMetadata } from 'features/automation/metadata/types'
import {
  getCollateralDuringLiquidation,
  getDynamicStopLossPrice,
  getMaxToken,
  getSliderPercentageFill,
} from 'features/automation/protection/stopLoss/helpers'
import { SidebarAdjustStopLossEditingStageProps } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import {
  StopLossFormChange,
  StopLossResetData,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import {
  defaultStopLossData,
  prepareStopLossTriggerDataV2,
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import { one, zero } from 'helpers/zero'
import { Sender } from 'xstate'

export function extractStopLossDataInput(context: OpenAaveContext) {
  const collateralToken = context.tokens.collateral
  const debtToken = context.tokens.debt

  return {
    collateralToken,
    debtToken,
    proxyAddress: context.connectedProxyAddress,
    positionRatio: context.strategy?.simulation.position.riskRatio.loanToValue || zero,
    lockedCollateral: amountFromWei(
      context.strategy?.simulation.position.collateral.amount || zero,
      context.strategy?.simulation.position.collateral.precision,
    ),
    debt: amountFromWei(
      context.strategy?.simulation.position.debt.amount || zero,
      context.strategy?.simulation.position.debt.precision,
    ),
    liquidationPrice: context.strategy?.simulation.position.liquidationPrice || zero,
    nextCollateralPrice: context.collateralPrice || zero,
    liquidationPenalty: context.strategyInfo?.liquidationBonus || zero,
    liquidationRatio: context?.strategy?.simulation.position.category.liquidationThreshold || zero,
    debtFloor: context?.strategy?.simulation.position.category.dustLimit || zero,
    debtTokenAddress: context.web3Context!.tokens[debtToken].address,
    collateralTokenAddress: context.web3Context!.tokens[collateralToken].address,
    // TODO these two below will need to be on context
    stopLossLevel: context.stopLossLevel,
    collateralActive: context.collateralActive,
  }
}

export function getAaveStopLossData(
  context: OpenAaveContext,
  send: Sender<OpenAaveEvent>,
  feature: 'borrow' | 'multiply',
) {
  const {
    collateralToken,
    debtToken,
    positionRatio,
    liquidationPrice,
    debt,
    lockedCollateral,
    proxyAddress,
    nextCollateralPrice,
    liquidationPenalty,
    liquidationRatio,
    debtFloor,
    debtTokenAddress,
    collateralTokenAddress,
    stopLossLevel,
    collateralActive,
  } = extractStopLossDataInput(context)

  const preparedAddStopLossTriggerData = {
    ...prepareStopLossTriggerDataV2(
      proxyAddress!,
      TriggerType.AaveStopLossToDebt,
      collateralActive,
      stopLossLevel,
      debtTokenAddress!,
      collateralTokenAddress!,
    ),
    replacedTriggerIds: [0],
    replacedTriggersData: ['0x'],
    kind: TxMetaKind.addTrigger,
  } as AutomationAddTriggerData

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

  const afterNewLiquidationPrice = getDynamicStopLossPrice({
    liquidationPrice,
    liquidationRatio: one.div(liquidationRatio),
    stopLossLevel: one.div(stopLossLevel.div(100)).times(100),
  })

  const executionPrice = collateralPriceAtRatio({
    colRatio: stopLossLevel.isZero() ? zero : one.div(stopLossLevel.div(100)),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })

  const sliderPercentageFill = getSliderPercentageFill({
    value: stopLossLevel,
    min: sliderMax,
    max: sliderMin,
  })

  const stopLossSidebarProps: SidebarAdjustStopLossEditingStageProps = {
    executionPrice,
    errors: [],
    warnings: [],
    stopLossState: {
      stopLossLevel,
      collateralActive,
      currentForm: 'add',
    } as StopLossFormChange,
    isEditing: true,
    isOpenFlow: true,
  }

  const maxToken = getMaxToken({
    stopLossLevel: stopLossLevel.isZero() ? zero : one.div(stopLossLevel.div(100)).times(100),
    lockedCollateral,
    liquidationRatio: one.div(liquidationRatio),
    liquidationPrice,
    debt,
  })

  function getOpenVaultStopLossMetadata(): StopLossMetadata {
    return {
      callbacks: {
        onCloseToChange: ({ optionName }) => {
          send({ type: 'SET_COLLATERAL_ACTIVE', collateralActive: optionName === 'collateral' })
          send({ type: 'SET_STOP_LOSS_TX_DATA', stopLossTxData: preparedAddStopLossTriggerData })
        },
        onSliderChange: ({ value }) => {
          send({ type: 'SET_STOP_LOSS_LEVEL', stopLossLevel: value })
          send({ type: 'SET_STOP_LOSS_TX_DATA', stopLossTxData: preparedAddStopLossTriggerData })
        },
      },
      methods: {
        getExecutionPrice: () => executionPrice,
        getMaxToken: () => maxToken,
        getRightBoundary: () => afterNewLiquidationPrice,
        getSliderPercentageFill: () => sliderPercentageFill,
        prepareAddStopLossTriggerData: () => preparedAddStopLossTriggerData,
      },
      settings: {
        fixedCloseToToken: debtToken,
        sliderDirection: 'rtl',
        sliderStep: 1,
      },
      translations: {
        ratioParamTranslationKey: 'vault-changes.loan-to-value',
        stopLossLevelCardFootnoteKey: 'system.cards.stop-loss-collateral-ratio.footnote-above',
        bannerStrategiesKey: 'protection.stop-loss',
      },
      validation: {
        getAddErrors: () => ({}),
        getAddWarnings: () => ({}),
        cancelErrors: [],
        cancelWarnings: [],
      },
      values: {
        collateralDuringLiquidation,
        initialSlRatioWhenTriggerDoesntExist: zero,
        resetData: {} as StopLossResetData,
        sliderMax,
        sliderMin,
        triggerMaxToken: zero,
        dynamicStopLossPrice: zero,
        removeTxData: {} as AutomationBotRemoveTriggersData,
      },
      contracts: {
        addTrigger: addAutomationBotTrigger,
        removeTrigger: removeAutomationBotAggregatorTriggers,
      },
    }
  }

  const defaultStopLossTriggerData = {
    ...defaultStopLossData,
    isToCollateral: false,
  }

  const automationContextProps = {
    positionData: {
      token: collateralToken,
      debtToken: debtToken,
      owner: proxyAddress,
      positionRatio: positionRatio,
      nextPositionRatio: positionRatio,
      debt,
      debtFloor,
      debtOffset: zero,
      id: zero,
      ilk: collateralToken,
      liquidationPenalty,
      liquidationPrice,
      liquidationRatio,
      lockedCollateral,
      vaultType: feature,
    } as AutomationPositionData,
    commonData: {
      controller: proxyAddress,
      nextCollateralPrice,
      token: collateralToken,
    },
    protocol: VaultProtocol.Aave,
    metadata: {
      stopLoss: getOpenVaultStopLossMetadata,
    },
    overwriteTriggersDefaults: {
      stopLossTriggerData: defaultStopLossTriggerData,
    },
  }

  return { stopLossSidebarProps, automationContextProps }
}
