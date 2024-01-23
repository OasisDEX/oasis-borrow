import { SimulateTitle } from 'components/SimulateTitle'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'
import { useTranslation } from 'react-i18next'

export function SimpleEarnHeader() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken },
  } = useOmniGeneralContext()
  const {
    position: { resolvedId },
    form: {
      state: { depositAmount },
    },
  } = useOmniProductContext(OmniProductType.Earn)
  return (
    <SimulateTitle
      token={collateralToken}
      depositAmount={depositAmount}
      description={`${t('in-this-position')}${resolvedId ? `(ID : ${resolvedId})` : ''}`}
    />
  )
}
