import type BigNumber from 'bignumber.js'
import { omniAutomationTranslationKeyMap } from 'features/omni-kit/automation/constants'
import { getMappedAutomationMetadataValues } from 'features/omni-kit/automation/helpers'
import { OmniSafetyOnMessage } from 'features/omni-kit/components'
import type {
  OmniFormState,
  OmniGenericPosition,
  OmniPartialValidations,
  OmniValidationItem,
} from 'features/omni-kit/types'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { zero } from 'helpers/zero'
import type { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface GetOmniValidationsParams {
  isOpening: boolean
  poolId?: string
  position: OmniGenericPosition
  positionTriggers: GetTriggersResponse
  protocolLabel: LendingProtocolLabel
  quoteBalance: BigNumber
  safetySwitchOn: boolean
  simulation?: OmniGenericPosition
  state: OmniFormState
}

export function useOmniLendingValidations({
  isOpening,
  poolId,
  position,
  positionTriggers,
  protocolLabel,
  quoteBalance,
  safetySwitchOn,
  simulation,
  state,
}: GetOmniValidationsParams): OmniPartialValidations {
  const localErrors: OmniValidationItem[] = []
  const { t } = useTranslation()

  const {
    triggers: { stopLoss, autoSell, autoBuy },
  } = getMappedAutomationMetadataValues({ poolId, positionTriggers })

  const isCloseAction = state.uiDropdown === 'close'

  if (simulation && 'riskRatio' in simulation && !isCloseAction) {
    const resolvedTriggerLtv =
      stopLoss?.decodedMappedParams.ltv || stopLoss?.decodedMappedParams.executionLtv

    if (resolvedTriggerLtv?.lt(simulation.riskRatio.loanToValue))
      localErrors.push({
        message: {
          translationKey: 'after-ltv-ratio-above-or-below-trigger-ltv',
          params: {
            aboveOrBelow: 'above',
            automationFeature: t(omniAutomationTranslationKeyMap.stopLoss),
          },
        },
      })

    if (autoSell?.decodedMappedParams.executionLtv.lt(simulation.riskRatio.loanToValue))
      localErrors.push({
        message: {
          translationKey: 'after-ltv-ratio-above-or-below-trigger-ltv',
          params: {
            aboveOrBelow: 'above',
            automationFeature: t(omniAutomationTranslationKeyMap.autoSell),
          },
        },
      })

    if (autoBuy?.decodedMappedParams.executionLtv.gt(simulation.riskRatio.loanToValue))
      localErrors.push({
        message: {
          translationKey: 'after-ltv-ratio-above-or-below-trigger-ltv',
          params: {
            aboveOrBelow: 'below',
            automationFeature: t(omniAutomationTranslationKeyMap.autoBuy),
          },
        },
      })
  }

  if ('paybackAmount' in state && state.paybackAmount?.gt(quoteBalance)) {
    localErrors.push({ message: { translationKey: 'payback-amount-exceeds-debt-token-balance' } })
  }

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
