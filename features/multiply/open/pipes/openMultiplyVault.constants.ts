import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { AllowanceOption } from 'features/allowance/allowance.types'
import { zero } from 'helpers/zero'

import type {
  MutableOpenMultiplyVaultState,
  OpenMultiplyVaultStage,
} from './openMultiplyVault.types'

export const defaultMutableOpenMultiplyVaultState: MutableOpenMultiplyVaultState = {
  stage: 'editing' as OpenMultiplyVaultStage,
  selectedAllowanceRadio: AllowanceOption.UNLIMITED,
  allowanceAmount: maxUint256,
  depositAmount: undefined,
  depositAmountUSD: undefined,
  requiredCollRatio: undefined,
  stopLossSkipped: false,
  stopLossLevel: zero,
}
