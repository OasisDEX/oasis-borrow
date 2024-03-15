import type { OmniFormState } from 'features/omni-kit/state/types'
import { OmniEarnFormAction, OmniSidebarStep } from 'features/omni-kit/types'

interface getErc4626EarnIsFormValidParams {
  currentStep: OmniSidebarStep
  state: OmniFormState
}

export const getErc4626EarnIsFormValid = ({
  currentStep,
  state,
}: getErc4626EarnIsFormValidParams) => {
  const { action, depositAmount, withdrawAmount } = state

  switch (currentStep) {
    case OmniSidebarStep.Setup:
    case OmniSidebarStep.Manage:
      switch (action) {
        case OmniEarnFormAction.OpenEarn:
        case OmniEarnFormAction.DepositEarn:
          return !!depositAmount?.gt(0)
        case OmniEarnFormAction.WithdrawEarn:
          return !!withdrawAmount?.gt(0)
        default:
          return false
      }
    default:
      return true
  }
}
