import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { closeVaultOptions } from 'features/automation/protection/common/consts/closeTypeConfig'
import { stopLossSliderBasicConfig } from 'features/automation/protection/common/consts/sliderConfig'
import { SidebarAdjustStopLossEditingStageProps } from 'features/automation/protection/controls/sidebar/SidebarAdjustStopLossEditingStage'
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'

import { OpenVaultChange, OpenVaultState } from './openVault'

export type OpenVaultStopLossLevelChange = {
  kind: 'stopLossLevel'
  level: BigNumber
}

export type OpenVaultStopLossCloseTypeChange = {
  kind: 'stopLossCloseType'
  type: 'dai' | 'collateral'
}

export function applyOpenVaultStopLoss(
  state: OpenVaultState,
  change: OpenVaultChange,
): OpenVaultState {
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

export type OpenVaultStopLossChanges =
  | OpenVaultStopLossLevelChange
  | OpenVaultStopLossCloseTypeChange

export function getDataForStopLoss(props: OpenVaultState) {
  const {
    token,
    priceInfo: { currentEthPrice, nextCollateralPrice },
    ilkData,
    balanceInfo: { ethBalance },
    afterCollateralizationRatioAtNextPrice,
    afterLiquidationPrice,
    depositAmount,
    generateAmount,
    setStopLossCloseType,
    setStopLossLevel,
    stopLossCloseType,
    stopLossLevel,
  } = props

  const tokenData = getToken(token)

  const sliderPercentageFill = stopLossLevel
    .minus(ilkData.liquidationRatio.times(100))
    .div(afterCollateralizationRatioAtNextPrice.minus(ilkData.liquidationRatio))

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
        afterCollateralizationRatioAtNextPrice.multipliedBy(100).toFixed(0, BigNumber.ROUND_DOWN),
      ),
      minBoundry: ilkData.liquidationRatio.multipliedBy(100),
      onChange: (level) => setStopLossLevel(level),
    },
    tokenPrice: nextCollateralPrice,
    ethPrice: currentEthPrice,
    vault: {
      liquidationPrice: afterLiquidationPrice,
      lockedCollateral: depositAmount,
      debt: generateAmount,
    } as Vault,
    ilkData,
    selectedSLValue: stopLossLevel,
    isEditing: !stopLossLevel.isZero(),
    collateralizationRatioAtNextPrice: afterCollateralizationRatioAtNextPrice,
    ethBalance,
    gasEstimation: null,
  }

  return sidebarProps
}
