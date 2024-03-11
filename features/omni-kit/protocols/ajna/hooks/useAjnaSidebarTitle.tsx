import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { useOmniSidebarTitle } from 'features/omni-kit/hooks'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'

export const useAjnaSidebarTitle = ({
  isFormFrozen,
  position,
}: {
  isFormFrozen: boolean
  position: AjnaPosition | AjnaEarnPosition
}) => {
  const { t } = useTranslation()

  const {
    environment: { isOracless, productType },
    steps: { currentStep },
  } = useOmniGeneralContext()

  const genericSidebarTitle = useOmniSidebarTitle()

  if (currentStep === 'risk' && isOracless)
    return t('ajna.position-page.common.form.title.risk-oracless')

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      return genericSidebarTitle
    case OmniProductType.Earn: {
      const earnPosition = position as AjnaEarnPosition

      if (isFormFrozen) {
        return t('ajna.position-page.common.form.title.position-frozen')
      }

      if (earnPosition.collateralTokenAmount.gt(zero)) {
        return t('ajna.position-page.common.form.title.claim-collateral')
      }

      return genericSidebarTitle
    }
  }
}
