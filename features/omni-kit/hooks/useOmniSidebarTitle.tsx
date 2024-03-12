import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { LendingProtocolLabel } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

export const useOmniSidebarTitle = () => {
  const { t } = useTranslation()

  const {
    environment: { label, productType, protocol },
    steps: { currentStep },
  } = useOmniGeneralContext()

  return t(`omni-kit.form.title.${currentStep}`, {
    productType: upperFirst(productType),
    protocol: label ?? LendingProtocolLabel[protocol],
  })
}
