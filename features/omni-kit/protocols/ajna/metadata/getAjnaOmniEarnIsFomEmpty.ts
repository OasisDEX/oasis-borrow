import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type { TxStatus } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import { areEarnPricesEqual } from 'features/omni-kit/protocols/ajna/helpers'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn/earnFormReducto.types'
import { OmniSidebarStep } from 'features/omni-kit/types'

export const getAjnaOmniEarnIsFomEmpty = ({
  position,
  currentStep,
  state,
  txStatus,
  price,
}: {
  position: AjnaEarnPosition
  currentStep: OmniSidebarStep
  state: OmniEarnFormState
  txStatus?: TxStatus
  price?: BigNumber
}) => {
  const { depositAmount, withdrawAmount } = state as OmniEarnFormState

  switch (currentStep) {
    case OmniSidebarStep.Setup:
      return !depositAmount && !withdrawAmount
    case OmniSidebarStep.Dpm:
    case OmniSidebarStep.Transaction:
      return txStatus === 'Success'
    case OmniSidebarStep.Manage:
      if ((position as AjnaEarnPosition).quoteTokenAmount.isZero()) {
        return !depositAmount && !withdrawAmount
      }

      return (
        !depositAmount &&
        !withdrawAmount &&
        !!areEarnPricesEqual((position as AjnaEarnPosition).price, price)
      )
    default:
      return true
  }
}
