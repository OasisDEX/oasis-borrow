import type { OmniProduct, OmniSidebarStep } from 'features/omni-kit/types'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

export const getMorphoSidebarTitle = ({
  currentStep,
  product,
}: {
  currentStep: OmniSidebarStep
  product: OmniProduct
}) => {
  const { t } = useTranslation()

  return t(`morpho.position-page.common.form.title.${currentStep}`, {
    product: upperFirst(product),
  })
}
