import BigNumber from 'bignumber.js'
import { SidebarSliderAdjustMultiply } from 'components/vault/sidebar/SidebarSliders'
import { MAX_COLL_RATIO } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations.constants'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import React from 'react'

export type SliderAdjustMultiplyParams = ManageMultiplyVaultState & {
  collapsed?: boolean
  disabled?: boolean
}

export function SliderAdjustMultiply({
  collapsed,
  disabled,
  ...props
}: SliderAdjustMultiplyParams) {
  const {
    hasToDepositCollateralOnEmptyVault,
    ilkData: { liquidationRatio },
    maxCollRatio,
    minCollRatio,
    requiredCollRatio,
    updateRequiredCollRatio,
    vault: { collateralizationRatio },
  } = props

  const sliderMax = maxCollRatio || MAX_COLL_RATIO
  const sliderMin = minCollRatio || liquidationRatio

  return (
    <SidebarSliderAdjustMultiply
      state={props}
      min={sliderMin}
      max={sliderMax}
      value={requiredCollRatio || collateralizationRatio}
      onChange={(e) => {
        updateRequiredCollRatio!(new BigNumber(e.target.value))
      }}
      collapsed={collapsed}
      disabled={hasToDepositCollateralOnEmptyVault || disabled}
    />
  )
}
