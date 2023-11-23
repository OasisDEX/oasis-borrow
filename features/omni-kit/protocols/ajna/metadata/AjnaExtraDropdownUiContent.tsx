import { useOmniProductContext } from 'features/omni-kit/contexts'
import {
  AjnaEarnFormContentAdjust,
  AjnaEarnFormContentClaimCollateral,
} from 'features/omni-kit/protocols/ajna/metadata'
import { OmniProductType, OmniSidebarEarnPanel } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

interface AjnaExtraDropdownUiContentProps {
  isFormValid: boolean
  isFormFrozen: boolean
}

export const AjnaExtraDropdownUiContent: FC<AjnaExtraDropdownUiContentProps> = ({
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
        <AjnaEarnFormContentAdjust isFormValid={isFormValid} isFormFrozen={isFormFrozen} />
      )}
      {uiDropdown === OmniSidebarEarnPanel.ClaimCollateral && (
        <AjnaEarnFormContentClaimCollateral />
      )}
    </>
  )
}
