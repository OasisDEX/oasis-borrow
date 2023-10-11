import type BigNumber from 'bignumber.js'
import type { ProtocolFlow } from 'features/ajna/common/types'
import type { AjnaFormState } from 'features/ajna/common/types/AjnaFormState.types'
import { getMaxIncreasedValue } from 'features/ajna/positions/common/helpers/getMaxIncreasedValue'
import type { UseFlowStateProps } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'

interface GetFlowStateConfigParams {
  collateralToken: string
  fee: BigNumber
  flow: ProtocolFlow
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
        amount: getMaxIncreasedValue(state.paybackAmount, fee),
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
