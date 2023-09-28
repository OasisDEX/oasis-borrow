import BigNumber from 'bignumber.js'
import { addAutomationBotTrigger } from 'blockchain/calls/automationBot.constants'
import { removeAutomationBotAggregatorTriggers } from 'blockchain/calls/automationBotAggregator.constants'
import type { AutomationBotRemoveTriggersData } from 'blockchain/calls/automationBotAggregator.types'
import type { IlkData } from 'blockchain/ilks.types'
import type { Context } from 'blockchain/network.types'
import { emptyNetworkConfig } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import type { AutomationPositionData } from 'components/context/AutomationContextProvider'
import {
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
  NEXT_COLL_RATIO_OFFSET,
} from 'features/automation/common/consts'
import type { StopLossMetadata } from 'features/automation/metadata/types'
import {
  getCollateralDuringLiquidation,
  getMaxToken,
  getSliderPercentageFill,
} from 'features/automation/protection/stopLoss/helpers'
import { notRequiredStopLossMetadata } from 'features/automation/protection/stopLoss/openFlow/notRequiredProperties'
import type { SidebarAdjustStopLossEditingStageProps } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import type {
  StopLossFormChange,
  StopLossResetData,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange.types'
import { prepareAddStopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import type { CloseVaultTo } from 'features/multiply/manage/pipes/CloseVaultTo.types'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import { zero } from 'helpers/zero'

import type { OpenVaultStopLossChanges } from './openVaultStopLoss.types'

export function applyOpenVaultStopLoss<S>(state: S, change: OpenVaultStopLossChanges) {
  if (change.kind === 'stopLossLevel') {
    return {
      ...state,
      stopLossLevel: change.level,
    }
  }

  if (change.kind === 'stopLossCloseType') {
    return {
      ...state,
      stopLossCloseType: change.type,
    }
  }

  return state
}

export function getDataForStopLoss(
  props: {
    id?: BigNumber
    token: string
    priceInfo: PriceInfo
    ilkData: IlkData
    balanceInfo: BalanceInfo
    afterCollateralizationRatioAtNextPrice: BigNumber
    afterCollateralizationRatio: BigNumber
    afterLiquidationPrice: BigNumber
    setStopLossCloseType: (type: CloseVaultTo) => void
    setStopLossLevel: (level: BigNumber) => void
    stopLossCloseType: CloseVaultTo
    proxyAddress?: string
    stopLossLevel: BigNumber
    totalExposure?: BigNumber
    depositAmount?: BigNumber
    generateAmount?: BigNumber
    afterOutstandingDebt?: BigNumber
  },
  feature: 'borrow' | 'multiply',
) {
  const {
    id,
    token,
    priceInfo: { nextCollateralPrice, currentEthPrice, currentCollateralPrice },
    ilkData,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    afterLiquidationPrice,
    totalExposure,
    depositAmount,
    ilkData: { ilk, liquidationPenalty, liquidationRatio, debtFloor },
    balanceInfo: { ethBalance },
    setStopLossCloseType,
    setStopLossLevel,
    stopLossCloseType,
    stopLossLevel,
    afterOutstandingDebt,
    generateAmount,
    proxyAddress,
  } = props

  const debt = feature === 'multiply' ? afterOutstandingDebt : generateAmount
  const lockedCollateral = feature === 'multiply' ? totalExposure : depositAmount

  const collateralDuringLiquidation =
    !lockedCollateral || !debt
      ? zero
      : getCollateralDuringLiquidation({
          lockedCollateral,
          debt,
          liquidationPrice: afterLiquidationPrice,
          liquidationPenalty,
        })

  const sliderMin = ilkData.liquidationRatio
    .multipliedBy(100)
    .plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET)
  const sliderMax = new BigNumber(
    afterCollateralizationRatioAtNextPrice
      .minus(NEXT_COLL_RATIO_OFFSET.div(100))
      .multipliedBy(100)
      .toFixed(0, BigNumber.ROUND_DOWN),
  )

  const afterNewLiquidationPrice = stopLossLevel
    .dividedBy(100)
    .multipliedBy(nextCollateralPrice)
    .dividedBy(afterCollateralizationRatioAtNextPrice)

  const executionPrice = collateralPriceAtRatio({
    colRatio: stopLossLevel.div(100),
    collateral: lockedCollateral || zero,
    vaultDebt: debt || zero,
  })

  const sliderPercentageFill = getSliderPercentageFill({
    value: stopLossLevel,
    min: sliderMin,
    max: sliderMax,
  })

  const collateralActive = stopLossCloseType === 'collateral'

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
    stopLossLevel,
    lockedCollateral: lockedCollateral || zero,
    liquidationRatio,
    liquidationPrice: afterLiquidationPrice,
    debt: debt || zero,
  })

  const preparedAddStopLossTriggerData = prepareAddStopLossTriggerData({
    id: id || zero,
    owner: proxyAddress!,
    isCloseToCollateral: collateralActive,
    stopLossLevel,
    replacedTriggerId: 0,
  })

  function getOpenVaultStopLossMetadata(): StopLossMetadata {
    return {
      callbacks: {
        onCloseToChange: ({ optionName }) => setStopLossCloseType(optionName as CloseVaultTo),
        onSliderChange: ({ value }) => setStopLossLevel(value),
      },
      methods: {
        getExecutionPrice: () => executionPrice,
        getMaxToken: () => maxToken,
        getRightBoundary: () => afterNewLiquidationPrice,
        getSliderPercentageFill: () => sliderPercentageFill,
        prepareAddStopLossTriggerData: () => preparedAddStopLossTriggerData,
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
      ...notRequiredStopLossMetadata,
    }
  }

  const automationContextProps = {
    ethBalance,
    // this is just a simple workaround to make the AutomationContextProvider
    // work, it needs to check the 'context.account' and compare it with
    // 'commonData.controller' (which is 0x0 hardcoded in here)
    context: {
      ...emptyNetworkConfig,
      status: 'connected',
      account: '0x0',
      etherscan: { url: '' },
    } as any as Context,
    ethAndTokenPricesData: { ETH: currentEthPrice, [token]: currentCollateralPrice } as Tickers,
    positionData: {
      positionRatio: afterCollateralizationRatio,
      nextPositionRatio: afterCollateralizationRatioAtNextPrice,
      debt,
      debtFloor,
      debtOffset: zero,
      id: zero,
      ilk,
      liquidationPenalty,
      liquidationPrice: afterLiquidationPrice,
      liquidationRatio,
      lockedCollateral,
      owner: proxyAddress,
      token,
      vaultType: feature,
      debtToken: 'DAI',
    } as AutomationPositionData,
    commonData: {
      controller: '0x0',
      nextCollateralPrice,
      token,
    },
    protocol: VaultProtocol.Maker,
    metadata: {
      stopLoss: getOpenVaultStopLossMetadata,
    },
  }

  return { stopLossSidebarProps, automationContextProps }
}
