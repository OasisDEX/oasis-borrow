import { maxUint256 } from 'blockchain/calls/erc20'

import type { AllowanceState } from './allowance.types'
import { AllowanceOption } from './allowance.types'

export const ALLOWANCE_STAGES = [
  'allowanceWaitingForConfirmation',
  'allowanceWaitingForApproval',
  'allowanceInProgress',
  'allowanceFailure',
  'allowanceSuccess',
] as const

export const defaultAllowanceState: AllowanceState = {
  selectedAllowanceRadio: AllowanceOption.UNLIMITED,
  allowanceAmount: maxUint256,
  isAllowanceStage: false,
}
