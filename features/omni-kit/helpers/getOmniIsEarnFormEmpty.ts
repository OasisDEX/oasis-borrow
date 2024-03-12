import type { TxStatus } from '@oasisdex/transactions'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn/earnFormReducto.types'
import { OmniSidebarStep } from 'features/omni-kit/types'

interface GetOmniIsEarnFormEmptyParams {
  currentStep: OmniSidebarStep
  state: OmniEarnFormState
  txStatus?: TxStatus
}

export const getOmniIsEarnFormEmpty = ({
  currentStep,
  state,
  txStatus,
}: GetOmniIsEarnFormEmptyParams) => {
  const { depositAmount, withdrawAmount } = state as OmniEarnFormState

  switch (currentStep) {
    case OmniSidebarStep.Setup:
    case OmniSidebarStep.Manage:
      return !depositAmount && !withdrawAmount
    case OmniSidebarStep.Dpm:
    case OmniSidebarStep.Transaction:
      return txStatus === 'Success'
    default:
      return true
  }
}
