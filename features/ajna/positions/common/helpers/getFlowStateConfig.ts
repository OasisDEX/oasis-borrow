import BigNumber from 'bignumber.js'
import { AjnaFlow, AjnaFormState } from 'features/ajna/common/types'
import { UseFlowStateProps } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'

interface GetFlowStateConfigParams {
  collateralToken: string
  fee: BigNumber
  flow: AjnaFlow
  quoteToken: string
  state: AjnaFormState
}

export function getFlowStateConfig({
  collateralToken,
  fee,
  flow,
  quoteToken,
  state,
}: GetFlowStateConfigParams): {
  amount: UseFlowStateProps['amount']
  token: UseFlowStateProps['token']
} {
  const { action } = state

  switch (action) {
    case 'open-earn':
    case 'deposit-earn':
      // THIS CONDITION IS ADDED TO BYPASS DPM & ALLOWANCE FLOW
      // WHILE IN AJNA EARN ADJUST MANAGE VIEW
      if (state.uiDropdown === 'adjust' && flow === 'manage') {
        return {
          amount: zero,
          token: 'ETH',
        }
      }
      return {
        amount: state.depositAmount || zero,
        token: quoteToken,
      }
    case 'withdraw-earn':
    case 'claim-earn':
    case 'adjust':
    case 'close-multiply':
      return {
        amount: zero,
        token: 'ETH',
      }
    case 'open-borrow':
    case 'deposit-borrow':
    case 'generate-borrow':
    case 'generate-multiply':
    case 'open-multiply':
    case 'deposit-collateral-multiply':
      if (!state.depositAmount) {
        return {
          amount: zero,
          token: 'ETH',
        }
      }

      return {
        amount: state.depositAmount,
        token: collateralToken,
      }
    case 'payback-borrow':
    case 'withdraw-borrow':
    case 'withdraw-multiply':
    case 'payback-multiply':
      if (!state.paybackAmount) {
        return {
          amount: zero,
          token: 'ETH',
        }
      }

      return {
        // payback amount increased by 1% of borrow rate so it leaves a wiggle room for constantly increasing debt
        amount: state.paybackAmount.plus(state.paybackAmount.times(fee.div(100))),
        token: quoteToken,
      }
    case 'deposit-quote-multiply':
      if (!state.depositAmount) {
        return {
          amount: zero,
          token: 'ETH',
        }
      }
      return {
        amount: state.depositAmount,
        token: quoteToken,
      }
    default:
      return {
        amount: zero,
        token: collateralToken,
      }
  }
}
