import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { AjnaOmniEarnFormContentAdjust } from 'features/omni-kit/metadata/ajna/AjnaOmniEanFormContentAdjust'
import { AjnaOmniEarnFormContentClaimCollateral } from 'features/omni-kit/metadata/ajna/AjnaOmniEarnFormContentClaimCollateral'
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
  } = useOmniProductContext('earn')

  return (
    <>
      {uiDropdown === 'adjust' && (
        <AjnaOmniEarnFormContentAdjust isFormValid={isFormValid} isFormFrozen={isFormFrozen} />
      )}
      {uiDropdown === 'claim-collateral' && <AjnaOmniEarnFormContentClaimCollateral />}
    </>
  )
}