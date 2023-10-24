import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type { AjnaProduct, AjnaSidebarStep } from 'features/ajna/common/types'
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
  currentStep: AjnaSidebarStep
  isFormFrozen: boolean
  isOracless: boolean
  position: AjnaPosition | AjnaEarnPosition
  productType: AjnaProduct
}) => {
  const { t } = useTranslation()

  const defaultTitle =
    currentStep === 'risk' && isOracless
      ? t('ajna.position-page.common.form.title.risk-oracless')
      : t(`ajna.position-page.common.form.title.${currentStep}`, {
          product: upperFirst(productType),
        })

  switch (productType) {
    case 'borrow':
    case 'multiply':
      return defaultTitle
    case 'earn': {
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
