import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import { LendingProtocolLabel } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

export const useOmniSidebarTitle = () => {
  const { t } = useTranslation()

  const {
    environment: { label, productType, protocol, isYieldLoopWithData },
    steps: { currentStep },
  } = useOmniGeneralContext()

  return t(`omni-kit.form.title.${currentStep}`, {
    productType: upperFirst(isYieldLoopWithData ? OmniProductType.Earn : productType),
    protocol: label ?? LendingProtocolLabel[protocol],
  })
}
