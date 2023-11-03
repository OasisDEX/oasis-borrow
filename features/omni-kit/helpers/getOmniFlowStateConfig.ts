import type BigNumber from 'bignumber.js'
import { getMaxIncreasedValue } from 'features/ajna/positions/common/helpers/getMaxIncreasedValue'
import {
  OmniBorrowFormAction,
  OmniEarnFormAction,
  type OmniFormState,
  OmniMultiplyFormAction,
  OmniSidebarEarnPanel,
} from 'features/omni-kit/types'
import type { UseFlowStateProps } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'

interface GetOmniFlowStateConfigParams {
  collateralToken: string
  fee: BigNumber
  isOpening: boolean
  quoteToken: string
  state: OmniFormState
}

export function getOmniFlowStateConfig({
  collateralToken,
  fee,
  isOpening,
  quoteToken,
  state,
}: GetOmniFlowStateConfigParams): {
  amount: UseFlowStateProps['amount']
  token: UseFlowStateProps['token']
} {
  const { action } = state

  switch (action) {
    case OmniEarnFormAction.DepositEarn:
    case OmniEarnFormAction.OpenEarn:
      // THIS CONDITION IS ADDED TO BYPASS DPM & ALLOWANCE FLOW
      // WHILE IN AJNA EARN ADJUST MANAGE VIEW
      if (state.uiDropdown === OmniSidebarEarnPanel.Adjust && !isOpening) {
        return {
          amount: zero,
          token: 'ETH',
        }
      }
      return {
        amount: state.depositAmount || zero,
        token: quoteToken,
      }

    case OmniEarnFormAction.ClaimEarn:
    case OmniEarnFormAction.WithdrawEarn:
    case OmniMultiplyFormAction.AdjustMultiply:
    case OmniMultiplyFormAction.CloseMultiply:
      return {
        amount: zero,
        token: 'ETH',
      }
    case OmniBorrowFormAction.DepositBorrow:
    case OmniBorrowFormAction.GenerateBorrow:
    case OmniBorrowFormAction.OpenBorrow:
    case OmniMultiplyFormAction.DepositCollateralMultiply:
    case OmniMultiplyFormAction.GenerateMultiply:
    case OmniMultiplyFormAction.OpenMultiply:
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
    case OmniBorrowFormAction.PaybackBorrow:
    case OmniBorrowFormAction.WithdrawBorrow:
    case OmniMultiplyFormAction.PaybackMultiply:
    case OmniMultiplyFormAction.WithdrawMultiply:
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
    case OmniMultiplyFormAction.DepositQuoteMultiply:
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
