import type { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { zero } from 'helpers/zero'

import type { MutableManageMultiplyVaultState } from './MutableManageMultiplyVaultState.types'

// works as a const pretty much...
export function defaultMutableManageMultiplyVaultState(
  lockedCollateral?: BigNumber,
): MutableManageMultiplyVaultState {
  const hasZeroCollateral = lockedCollateral?.eq(zero)

  return {
    stage: hasZeroCollateral ? 'otherActions' : 'adjustPosition',
    originalEditingStage: hasZeroCollateral ? 'otherActions' : 'adjustPosition',
    collateralAllowanceAmount: maxUint256,
    daiAllowanceAmount: maxUint256,
    selectedCollateralAllowanceRadio: 'unlimited',
    selectedDaiAllowanceRadio: 'unlimited',
    showSliderController: false,
    closeVaultTo: 'collateral',
    mainAction: 'buy',
    otherAction: 'depositCollateral',
  }
}
