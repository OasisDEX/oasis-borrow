import { TriggerType } from '@oasisdex/automation'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
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
import {
  notRequiredAaveTranslations,
  notRequiredAutomationContext,
  notRequiredContracts,
  notRequiredMethods,
  notRequiredPositionData,
  notRequiredValidations,
  notRequiredValues,
} from 'features/automation/protection/stopLoss/openFlow/notRequiredProperties'
import { SidebarAdjustStopLossEditingStageProps } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import { StopLossFormChange } from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import {
  defaultStopLossData,
  prepareStopLossTriggerDataV2,
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { one, zero } from 'helpers/zero'
import { Sender } from 'xstate'

export function extractStopLossDataInput(context: OpenAaveContext) {
  const collateralToken = context.tokens.collateral
  const debtToken = context.tokens.debt

  const debt = amountFromWei(
    context.strategy?.simulation.position.debt.amount || zero,
    context.strategy?.simulation.position.debt.precision,
  )

  const lockedCollateral = amountFromWei(
    context.strategy?.simulation.position.collateral.amount || zero,
    context.strategy?.simulation.position.collateral.precision,
  )
  const liquidationRatio =
    context?.strategy?.simulation.position.category.liquidationThreshold || zero
  const liquidationPrice = debt.div(lockedCollateral.times(liquidationRatio)) || zero

  return {
    collateralToken,
    debtToken,
    proxyAddress: context.effectiveProxyAddress,
    positionRatio: context.strategy?.simulation.position.riskRatio.loanToValue || zero,
    lockedCollateral,
    debt,
    liquidationPrice,
    liquidationPenalty: context.strategyInfo?.liquidationBonus || zero,
    liquidationRatio,
    debtTokenAddress: context.web3Context!.tokens[debtToken].address,
    collateralTokenAddress: context.web3Context!.tokens[collateralToken].address,
    stopLossLevel: context.stopLossLevel || zero,
    collateralActive: context.collateralActive || false,
  }
}

export function getAaveStopLossData(context: OpenAaveContext, send: Sender<OpenAaveEvent>) {
  const {
    collateralToken,
    debtToken,
    positionRatio,
    liquidationPrice,
    debt,
    lockedCollateral,
    proxyAddress,
    liquidationPenalty,
    liquidationRatio,
    debtTokenAddress,
    collateralTokenAddress,
    stopLossLevel,
    collateralActive,
  } = extractStopLossDataInput(context)

  function preparedAddStopLossTriggerData(stopLossValue: BigNumber) {
    return {
      ...prepareStopLossTriggerDataV2(
        proxyAddress!,
        TriggerType.AaveStopLossToDebt,
        collateralActive,
        stopLossValue,
        debtTokenAddress!,
        collateralTokenAddress!,
      ),
      replacedTriggerIds: [0],
      replacedTriggersData: ['0x'],
      kind: TxMetaKind.addTrigger,
    } as AutomationAddTriggerData
  }

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
    min: sliderMin,
    max: sliderMax,
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
          send({
            type: 'SET_STOP_LOSS_TX_DATA',
            stopLossTxData: preparedAddStopLossTriggerData(stopLossLevel),
          })
        },
        onSliderChange: ({ value }) => {
          send({ type: 'SET_STOP_LOSS_LEVEL', stopLossLevel: value })
          send({
            type: 'SET_STOP_LOSS_TX_DATA',
            stopLossTxData: preparedAddStopLossTriggerData(value),
          })
        },
      },
      methods: {
        getMaxToken: () => maxToken,
        getRightBoundary: () => afterNewLiquidationPrice,
        getSliderPercentageFill: () => sliderPercentageFill,
        ...notRequiredMethods,
      },
      settings: {
        fixedCloseToToken: debtToken,
        sliderDirection: 'ltr',
        sliderStep: 1,
      },
      translations: {
        ratioParamTranslationKey: 'vault-changes.loan-to-value',
        ...notRequiredAaveTranslations,
      },
      validation: notRequiredValidations,
      values: {
        collateralDuringLiquidation,
        sliderMax,
        sliderMin,
        ...notRequiredValues,
      },
      contracts: notRequiredContracts,
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
      positionRatio: positionRatio,
      debt,
      id: zero,
      ilk: collateralToken,
      ...notRequiredPositionData,
    } as AutomationPositionData,
    metadata: {
      stopLoss: getOpenVaultStopLossMetadata,
    },
    overwriteTriggersDefaults: {
      stopLossTriggerData: defaultStopLossTriggerData,
    },
    ...notRequiredAutomationContext,
  }

  return { stopLossSidebarProps, automationContextProps }
}
