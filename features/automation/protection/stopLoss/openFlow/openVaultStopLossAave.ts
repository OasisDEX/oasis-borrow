import BigNumber from 'bignumber.js'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import type { AutomationPositionData } from 'components/context/AutomationContextProvider'
import type { OpenAaveContext, OpenAaveEvent } from 'features/aave/open/state'
import type { AutomationAddTriggerData } from 'features/automation/common/txDefinitions.types'
import { aaveOffsets } from 'features/automation/metadata/aave/stopLossMetadata'
import type { StopLossMetadata } from 'features/automation/metadata/types'
import {
  getCollateralDuringLiquidation,
  getDynamicStopLossPrice,
  getMaxToken,
  getSliderPercentageFill,
} from 'features/automation/protection/stopLoss/helpers'
import {
  extractStopLossDataInput,
  getAaveLikeCommandContractType,
  getAaveLikeStopLossTriggerType,
} from 'features/automation/protection/stopLoss/openFlow/helpers'
import {
  notRequiredAaveTranslations,
  notRequiredAutomationContext,
  notRequiredContracts,
  notRequiredMethods,
  notRequiredPositionData,
  notRequiredStopLossMetadata,
  notRequiredValidations,
  notRequiredValues,
} from 'features/automation/protection/stopLoss/openFlow/notRequiredProperties'
import type { SidebarAdjustStopLossEditingStageProps } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import type { StopLossFormChange } from 'features/automation/protection/stopLoss/state/StopLossFormChange.types'
import { prepareStopLossTriggerDataV2 } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { defaultStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.constants'
import { one, zero } from 'helpers/zero'
import type { Sender } from 'xstate'

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
    const commandContractType = getAaveLikeCommandContractType(context.strategyConfig.protocol)
    return {
      ...prepareStopLossTriggerDataV2(
        commandContractType,
        proxyAddress!,
        getAaveLikeStopLossTriggerType(context.strategyConfig.protocol),
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
    positionRatio.plus(aaveOffsets.open.min).times(100).toFixed(0, BigNumber.ROUND_UP),
  )
  const sliderMax = liquidationRatio.minus(aaveOffsets.open.max).times(100)

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
        triggerMaxToken: maxToken,
        dynamicStopLossPrice: executionPrice,
        ...notRequiredValues,
      },
      contracts: notRequiredContracts,
      ...notRequiredStopLossMetadata,
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
    networkId: context.strategyConfig.networkId,
    ...notRequiredAutomationContext,
  }

  return { stopLossSidebarProps, automationContextProps }
}
