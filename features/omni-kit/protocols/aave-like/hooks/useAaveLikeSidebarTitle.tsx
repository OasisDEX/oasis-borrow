import type { OmniProductType, OmniSidebarStep } from 'features/omni-kit/types'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

export const useAaveLikeSidebarTitle = ({
  currentStep,
  productType,
}: {
  currentStep: OmniSidebarStep
  productType: OmniProductType
}) => {
  const { t } = useTranslation()

  return t(`aave.position-page.common.form.title.${currentStep}`, {
    productType: upperFirst(productType),
  })
}
