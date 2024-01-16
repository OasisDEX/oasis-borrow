import type BigNumber from 'bignumber.js'
import { OmniSafetyOnMessage } from 'features/omni-kit/components'
import type {
  OmniFormState,
  OmniGenericPosition,
  OmniPartialValidations,
  OmniValidationItem,
} from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import type { LendingProtocolLabel } from 'lendingProtocols'
import React from 'react'

interface GetOmniValidationsParams {
  safetySwitchOn: boolean
  isOpening: boolean
  position: OmniGenericPosition
  quoteBalance: BigNumber
  state: OmniFormState
  protocolLabel: LendingProtocolLabel
}

export function getOmniLendingValidations({
  safetySwitchOn,
  isOpening,
  position,
  quoteBalance,
  state,
  protocolLabel,
}: GetOmniValidationsParams): OmniPartialValidations {
  const localErrors: OmniValidationItem[] = []

  if ('paybackAmount' in state && state.paybackAmount?.gt(quoteBalance)) {
    localErrors.push({ message: { translationKey: 'payback-amount-exceeds-debt-token-balance' } })
  }

  if (
    safetySwitchOn &&
    !isOpening &&
    'debtAmount' in position &&
    position.debtAmount?.isZero() &&
    (('loanToValue' in state && state.loanToValue?.gt(zero)) ||
      ('depositAmount' in state && state.depositAmount?.gt(zero)) ||
      ('paybackAmount' in state && state.paybackAmount?.gt(zero)) ||
      ('generateAmount' in state && state.generateAmount?.gt(zero)))
  ) {
    localErrors.push({
      message: { component: <OmniSafetyOnMessage protocolLabel={protocolLabel} /> },
    })
  }

  return {
    localErrors,
    localWarnings: [],
  }
}
