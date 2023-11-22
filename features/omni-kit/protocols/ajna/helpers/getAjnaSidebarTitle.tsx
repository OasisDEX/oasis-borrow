import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type { OmniSidebarStep } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

export const getAjnaSidebarTitle = ({
  currentStep,
  isFormFrozen,
  isOracless,
  position,
  productType,
}: {
  currentStep: OmniSidebarStep
  isFormFrozen: boolean
  isOracless: boolean
  position: AjnaPosition | AjnaEarnPosition
  productType: OmniProductType
}) => {
  const { t } = useTranslation()

  const defaultTitle =
    currentStep === 'risk' && isOracless
      ? t('ajna.position-page.common.form.title.risk-oracless')
      : t(`ajna.position-page.common.form.title.${currentStep}`, {
          productType: upperFirst(productType),
        })

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      return defaultTitle
    case OmniProductType.Earn: {
      const earnPosition = position as AjnaEarnPosition

      if (isFormFrozen) {
        return t('ajna.position-page.common.form.title.position-frozen')
      }

      if (earnPosition.collateralTokenAmount.gt(zero)) {
        return t('ajna.position-page.common.form.title.claim-collateral')
      }

      return defaultTitle
    }
    default:
      return defaultTitle
  }
}
