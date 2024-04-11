import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import { LendingProtocol, LendingProtocolLabel } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

export const useOmniSidebarTitle = () => {
  const { t } = useTranslation()

  const {
    environment: { label, productType, protocol, isYieldLoopWithData },
    steps: { currentStep },
  } = useOmniGeneralContext()
  const isAaveLike = [
    LendingProtocol.AaveV2,
    LendingProtocol.AaveV3,
    LendingProtocol.SparkV3,
  ].includes(protocol)

  return t(`omni-kit.form.title.${currentStep}`, {
    productType: upperFirst(
      isAaveLike ? (isYieldLoopWithData ? OmniProductType.Earn : productType) : productType,
    ),
    protocol: label ?? LendingProtocolLabel[protocol],
  })
}
