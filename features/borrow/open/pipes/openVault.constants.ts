import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { AllowanceOption } from 'features/allowance/allowance.types'
import { zero } from 'helpers/zero'

import type { MutableOpenVaultState, OpenVaultStage } from './openVault.types'

export const defaultMutableOpenVaultState: MutableOpenVaultState = {
  stage: 'editing' as OpenVaultStage,
  showGenerateOption: false,
  selectedAllowanceRadio: AllowanceOption.UNLIMITED,
  allowanceAmount: maxUint256,
  depositAmount: undefined,
  depositAmountUSD: undefined,
  generateAmount: undefined,
  stopLossSkipped: false,
  stopLossLevel: zero,
  visitedStopLossStep: false,
}
