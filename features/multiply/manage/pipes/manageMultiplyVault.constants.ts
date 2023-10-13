import type { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { zero } from 'helpers/zero'

import type { MutableManageMultiplyVaultState } from './MutableManageMultiplyVaultState.types'

// works as a const pretty much...
export function defaultMutableManageMultiplyVaultState(
  vaultType: VaultType,
  lockedCollateral?: BigNumber,
): MutableManageMultiplyVaultState {
  const hasZeroCollateral = lockedCollateral?.eq(zero)

  if (vaultType === VaultType.Earn) {
    throw new Error('Wrong vault type, only Borrow and Multiply')
  }

  return {
    stage:
      vaultType === VaultType.Borrow
        ? 'otherActions'
        : hasZeroCollateral
        ? 'otherActions'
        : 'adjustPosition',
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
