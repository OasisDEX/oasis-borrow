import type { OmniSidebarStep } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

export const getAaveLikeSidebarTitle = ({
  currentStep,
  productType,
}: {
  currentStep: OmniSidebarStep
  productType: OmniProductType
}) => {
  const { t } = useTranslation()

  const defaultTitle = t(`aave-like.position-page.common.form.title.${currentStep}`, {
    productType: upperFirst(productType),
  })

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      return defaultTitle
    case OmniProductType.Earn: {
      return defaultTitle
    }
    default:
      return defaultTitle
  }
}
