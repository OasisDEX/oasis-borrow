import { useOmniProductContext } from 'features/omni-kit/contexts'
import {
  AjnaOmniEarnFormContentAdjust,
  AjnaOmniEarnFormContentClaimCollateral,
} from 'features/omni-kit/protocols/ajna/metadata'
import { OmniProductType, OmniSidebarEarnPanel } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

interface AjnaOmniExtraDropdownUiContentProps {
  isFormValid: boolean
  isFormFrozen: boolean
}

export const AjnaOmniExtraDropdownUiContent: FC<AjnaOmniExtraDropdownUiContentProps> = ({
  isFormValid,
  isFormFrozen,
}) => {
  const {
    form: {
      state: { uiDropdown },
    },
  } = useOmniProductContext(OmniProductType.Earn)

  return (
    <>
      {uiDropdown === OmniSidebarEarnPanel.Adjust && (
        <AjnaOmniEarnFormContentAdjust isFormValid={isFormValid} isFormFrozen={isFormFrozen} />
      )}
      {uiDropdown === OmniSidebarEarnPanel.ClaimCollateral && (
        <AjnaOmniEarnFormContentClaimCollateral />
      )}
    </>
  )
}
