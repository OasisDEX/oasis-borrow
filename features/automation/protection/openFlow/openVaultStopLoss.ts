import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import {
  DEFAULT_SL_SLIDER_BOUNDARY,
  MAX_SL_SLIDER_VALUE_OFFSET,
} from 'features/automation/protection/common/consts/automationDefaults'
import { closeVaultOptions } from 'features/automation/protection/common/consts/closeTypeConfig'
import { stopLossSliderBasicConfig } from 'features/automation/protection/common/consts/sliderConfig'
import { getSliderPercentageFill } from 'features/automation/protection/common/helpers'
import { SidebarAdjustStopLossEditingStageProps } from 'features/automation/protection/controls/sidebar/SidebarAdjustStopLossEditingStage'
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'

export type OpenVaultStopLossLevelChange = {
  kind: 'stopLossLevel'
  level: BigNumber
}

export type OpenVaultStopLossCloseTypeChange = {
  kind: 'stopLossCloseType'
  type: 'dai' | 'collateral'
}

export type OpenVaultStopLossChanges =
  | OpenVaultStopLossLevelChange
  | OpenVaultStopLossCloseTypeChange

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
    stopLossLevel: BigNumber
    totalExposure?: BigNumber
    depositAmount?: BigNumber
    generateAmount?: BigNumber
    afterOutstandingDebt?: BigNumber
  },
  feature: 'borrow' | 'multiply',
) {
  const {
    token,
    priceInfo: { currentEthPrice, nextCollateralPrice },
    ilkData,
    balanceInfo: { ethBalance },
    afterCollateralizationRatioAtNextPrice,
    afterCollateralizationRatio,
    afterLiquidationPrice,
    totalExposure,
    depositAmount,

    setStopLossCloseType,
    setStopLossLevel,
    stopLossCloseType,
    stopLossLevel,
    afterOutstandingDebt,
    generateAmount,
  } = props

  const debt = feature === 'multiply' ? afterOutstandingDebt : generateAmount
  const tokenData = getToken(token)

  const sliderPercentageFill = getSliderPercentageFill({
    value: stopLossLevel,
    min: ilkData.liquidationRatio.plus(DEFAULT_SL_SLIDER_BOUNDARY),
    max: afterCollateralizationRatioAtNextPrice.minus(MAX_SL_SLIDER_VALUE_OFFSET),
  })

  const afterNewLiquidationPrice = stopLossLevel
    .dividedBy(100)
    .multipliedBy(nextCollateralPrice)
    .dividedBy(afterCollateralizationRatioAtNextPrice)

  const sidebarProps: SidebarAdjustStopLossEditingStageProps = {
    token,
    closePickerConfig: {
      optionNames: closeVaultOptions,
      onclickHandler: (optionName: string) => setStopLossCloseType(optionName as CloseVaultTo),
      isCollateralActive: stopLossCloseType === 'collateral',
      collateralTokenSymbol: token,
      collateralTokenIconCircle: tokenData.iconCircle,
    },
    slValuePickerConfig: {
      ...stopLossSliderBasicConfig,
      sliderPercentageFill,
      leftBoundry: stopLossLevel,
      rightBoundry: afterNewLiquidationPrice,
      lastValue: stopLossLevel,
      maxBoundry: new BigNumber(
        afterCollateralizationRatioAtNextPrice
          .minus(MAX_SL_SLIDER_VALUE_OFFSET)
          .multipliedBy(100)
          .toFixed(0, BigNumber.ROUND_DOWN),
      ),
      minBoundry: ilkData.liquidationRatio.plus(DEFAULT_SL_SLIDER_BOUNDARY).multipliedBy(100),
      onChange: (level) => setStopLossLevel(level),
    },
    tokenPrice: nextCollateralPrice,
    ethPrice: currentEthPrice,
    vault: {
      liquidationPrice: afterLiquidationPrice,
      lockedCollateral: feature === 'multiply' ? totalExposure : depositAmount,
      debt,
    } as Vault,
    ilkData,
    selectedSLValue: stopLossLevel,
    isEditing: !stopLossLevel.isZero(),
    collateralizationRatioAtNextPrice: afterCollateralizationRatioAtNextPrice,
    ethBalance,
    gasEstimation: null,
    currentCollateralRatio: afterCollateralizationRatio,
    isAutoSellEnabled: false,
    isStopLossEnabled: false,
    warnings: [],
    errors: [],
  }

  return sidebarProps
}

export type StopLossOpenFlowStages =
  | 'stopLossEditing'
  | 'stopLossTxWaitingForConfirmation'
  | 'stopLossTxWaitingForApproval'
  | 'stopLossTxInProgress'
  | 'stopLossTxFailure'
  | 'stopLossTxSuccess'
