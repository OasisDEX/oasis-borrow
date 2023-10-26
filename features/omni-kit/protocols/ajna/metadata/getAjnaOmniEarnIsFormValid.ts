import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { areEarnPricesEqual } from 'features/ajna/positions/earn/helpers/areEarnPricesEqual'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn/earnFormReducto.types'
import { OmniEarnFormAction, OmniSidebarStep } from 'features/omni-kit/types'

export const getAjnaOmniEarnIsFormValid = ({
  position,
  currentStep,
  state,
  price,
}: {
  position: AjnaEarnPosition
  currentStep: OmniSidebarStep
  state: OmniEarnFormState
  price?: BigNumber
}) => {
  const { action, depositAmount, withdrawAmount } = state

  const isEmptyPosition = position.quoteTokenAmount.isZero() && position.price.isZero()

  switch (currentStep) {
    case OmniSidebarStep.Setup:
    case OmniSidebarStep.Manage:
      switch (action) {
        case OmniEarnFormAction.OpenEarn:
          return !!depositAmount?.gt(0)
        case OmniEarnFormAction.DepositEarn:
          if (isEmptyPosition) {
            return !!depositAmount?.gt(0)
          }

          return !!depositAmount?.gt(0) || !areEarnPricesEqual(position.price, price)
        case OmniEarnFormAction.WithdrawEarn:
          if (isEmptyPosition) {
            return !!withdrawAmount?.gt(0)
          }

          return !!withdrawAmount?.gt(0) || !areEarnPricesEqual(position.price, price)
        case OmniEarnFormAction.ClaimEarn: {
          return true
        }
        default:
          return false
      }
    default:
      return true
  }
}
