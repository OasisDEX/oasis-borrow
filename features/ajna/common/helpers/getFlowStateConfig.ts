import { AjnaFormState } from 'features/ajna/common/types'
import { UseFlowStateProps } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'

export function getFlowStateConfig({
  collateralToken,
  quoteToken,
  state,
}: {
  collateralToken: string
  quoteToken: string
  state: AjnaFormState
}): { amount: UseFlowStateProps['amount']; token: UseFlowStateProps['token'] } {
  const { action } = state

  switch (action) {
    case 'open-borrow':
    case 'deposit-borrow':
    case 'deposit-earn':
      return {
        amount: state.depositAmount,
        token: collateralToken,
      }
    case 'payback-borrow':
      return {
        amount: state.paybackAmount,
        token: quoteToken,
      }
    default:
      return {
        amount: zero,
        token: collateralToken,
      }
  }
}
