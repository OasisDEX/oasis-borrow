import { OmniSafetyOnMessage, OmniValidationWithLink } from 'features/omni-kit/components'
import type {
  AjnaBorrowishPositionAuction,
  AjnaPositionAuction,
} from 'features/omni-kit/protocols/ajna/observables'
import type { OmniFormState } from 'features/omni-kit/state/types'
import type {
  OmniGenericPosition,
  OmniPartialValidations,
  OmniValidationItem,
} from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import type { LendingProtocol } from 'lendingProtocols'
import { LendingProtocolLabel } from 'lendingProtocols'
import React from 'react'

export function getAjnaValidation({
  safetySwitchOn,
  isOpening,
  position,
  positionAuction,
  productType,
  protocol,
  state,
}: {
  safetySwitchOn: boolean
  isOpening: boolean
  position: OmniGenericPosition
  productType: OmniProductType
  protocol: LendingProtocol
  state: OmniFormState
  positionAuction: AjnaPositionAuction
}): OmniPartialValidations {
  const localErrors: OmniValidationItem[] = []
  const localWarnings: OmniValidationItem[] = []

  const protocolLabel = LendingProtocolLabel.ajna

  if (
    safetySwitchOn &&
    !isOpening &&
    productType === OmniProductType.Earn &&
    'quoteTokenAmount' in position &&
    position.quoteTokenAmount?.isZero() &&
    'depositAmount' in state &&
    state.depositAmount?.gt(zero)
  ) {
    localErrors.push({
      message: { component: <OmniSafetyOnMessage protocolLabel={protocolLabel} /> },
    })
  }

  if (productType !== OmniProductType.Earn) {
    const borrowishAuction = positionAuction as AjnaBorrowishPositionAuction

    if (borrowishAuction.isBeingLiquidated) {
      localWarnings.push({
        message: {
          component: <OmniValidationWithLink name="is-being-liquidated" protocol={protocol} />,
        },
      })
    }
  }

  return {
    localErrors,
    localWarnings,
  }
}
