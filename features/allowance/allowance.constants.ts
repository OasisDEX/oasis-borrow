import { maxUint256 } from 'blockchain/calls/erc20.constants'

import type { AllowanceState } from './allowance.types'
import { AllowanceOption } from './allowance.types'

export const defaultAllowanceState: AllowanceState = {
  selectedAllowanceRadio: AllowanceOption.UNLIMITED,
  allowanceAmount: maxUint256,
  isAllowanceStage: false,
}
