import { NetworkNames } from 'blockchain/networks'
import type { OmniFlow, OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

interface OmniHeadlinePropsParams {
  collateralToken?: string
  flow: OmniFlow
  id?: string
  productType?: OmniProductType
  quoteToken?: string
  collateralAddress?: string
  quoteAddress?: string
  collateralIcon?: string
  quoteIcon?: string
  protocol: LendingProtocol
}

export function getOmniHeadlineProps({
  collateralToken,
  flow,
  id,
  productType,
  quoteToken,
  collateralIcon,
  quoteIcon,
  protocol,
}: OmniHeadlinePropsParams) {
  const { t } = useTranslation()

  return {
    ...(collateralToken &&
      quoteToken &&
      collateralIcon &&
      quoteIcon && {
        header: t(`ajna.position-page.common.headline.${flow}`, {
          collateralToken,
          id,
          productType: upperFirst(productType),
          quoteToken,
        }),
        tokens: [collateralIcon, quoteIcon],
        protocol: {
          network: NetworkNames.ethereumMainnet,
          protocol,
        },
      }),
  }
}
