import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { areEarnPricesEqual } from 'features/ajna/positions/earn/helpers/areEarnPricesEqual'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn/earnFormReducto.types'
import type { OmniSidebarStep } from 'features/omni-kit/types/common.types'

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
    case 'setup':
    case 'manage':
      switch (action) {
        case 'open-earn':
          return !!depositAmount?.gt(0)
        case 'deposit-earn':
          if (isEmptyPosition) {
            return !!depositAmount?.gt(0)
          }

          return !!depositAmount?.gt(0) || !areEarnPricesEqual(position.price, price)
        case 'withdraw-earn':
          if (isEmptyPosition) {
            return !!withdrawAmount?.gt(0)
          }

          return !!withdrawAmount?.gt(0) || !areEarnPricesEqual(position.price, price)
        case 'claim-earn': {
          return true
        }
        default:
          return false
      }
    default:
      return true
  }
}
