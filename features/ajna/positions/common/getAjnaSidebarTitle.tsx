import { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import { AjnaProduct, AjnaSidebarStep } from 'features/ajna/common/types'
import { AjnaMultiplyPosition } from 'features/ajna/positions/multiply/temp'
import { zero } from 'helpers/zero'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

export const getAjnaSidebarTitle = ({
  currentStep,
  product,
  isFormFrozen,
  position,
}: {
  currentStep: AjnaSidebarStep
  product: AjnaProduct
  isFormFrozen: boolean
  position: AjnaPosition | AjnaMultiplyPosition | AjnaEarnPosition
}) => {
  const { t } = useTranslation()

  const defaultTitle = t(`ajna.position-page.common.form.title.${currentStep}`, {
    product: upperFirst(product),
  })

  switch (product) {
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
