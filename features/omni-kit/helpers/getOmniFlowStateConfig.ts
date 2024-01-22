import type BigNumber from 'bignumber.js'
import { paybackAllAmountAllowanceMaxMultiplier } from 'features/omni-kit/constants'
import { getMaxIncreasedOrDecreasedValue } from 'features/omni-kit/protocols/ajna/helpers'
import {
  OmniBorrowFormAction,
  OmniEarnFormAction,
  type OmniFormState,
  OmniMultiplyFormAction,
  OmniSidebarEarnPanel,
} from 'features/omni-kit/types'
import type { UseFlowStateProps } from 'helpers/useFlowState'
import { zero } from 'helpers/zero'
import type { LendingProtocol } from 'lendingProtocols'

interface GetOmniFlowStateConfigParams {
  collateralToken: string
  fee: BigNumber
  isOpening: boolean
  quoteToken: string
  quotePrecision: number
  state: OmniFormState
  protocol: LendingProtocol
}

export function getOmniFlowStateConfig({
  collateralToken,
  fee,
  isOpening,
  quoteToken,
  quotePrecision,
  state,
  protocol,
}: GetOmniFlowStateConfigParams): {
  amount: UseFlowStateProps['amount']
  allowanceAmount?: UseFlowStateProps['amount']
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
    case OmniMultiplyFormAction.PaybackMultiply:
      if (!state.paybackAmount) {
        return {
          amount: zero,
          token: 'ETH',
        }
      }

      const allowanceMultiplier = paybackAllAmountAllowanceMaxMultiplier[protocol]

      const increasedAmount = getMaxIncreasedOrDecreasedValue({
        value: state.paybackAmount,
        apy: fee,
        precision: quotePrecision,
      })

      return {
        amount: increasedAmount,
        allowanceAmount: increasedAmount.times(allowanceMultiplier).dp(quotePrecision),
        token: quoteToken,
      }
    case OmniBorrowFormAction.WithdrawBorrow:
    case OmniMultiplyFormAction.WithdrawMultiply:
      if (!state.paybackAmount) {
        return {
          amount: zero,
          token: 'ETH',
        }
      }

      return {
        amount: getMaxIncreasedOrDecreasedValue({
          value: state.paybackAmount,
          apy: fee,
          precision: quotePrecision,
        }),
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
