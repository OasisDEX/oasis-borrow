import { NetworkNames } from 'blockchain/networks'
import type { OmniFlow, OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

interface OmniHeadlinePropsParams {
  collateralAddress?: string
  collateralIcon?: string
  collateralToken?: string
  flow: OmniFlow
  positionId?: string
  productType?: OmniProductType
  protocol: LendingProtocol
  quoteAddress?: string
  quoteIcon?: string
  quoteToken?: string
}

export function getOmniHeadlineProps({
  collateralIcon,
  collateralToken,
  flow,
  positionId,
  productType,
  protocol,
  quoteIcon,
  quoteToken,
}: OmniHeadlinePropsParams) {
  const { t } = useTranslation()

  return {
    ...(collateralToken &&
      quoteToken &&
      collateralIcon &&
      quoteIcon && {
        header: t(`ajna.position-page.common.headline.${flow}`, {
          collateralToken,
          positionId,
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
