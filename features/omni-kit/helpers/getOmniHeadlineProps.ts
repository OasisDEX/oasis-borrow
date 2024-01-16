import type { NetworkNames } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

interface OmniHeadlinePropsParams {
  collateralAddress?: string
  collateralIcon?: string
  collateralToken?: string
  positionId?: string
  productType?: OmniProductType
  protocol: LendingProtocol
  networkName: NetworkNames
  quoteAddress?: string
  quoteIcon?: string
  quoteToken?: string
  singleToken?: boolean
}

export function getOmniHeadlineProps({
  collateralIcon,
  collateralToken,
  positionId,
  productType,
  protocol,
  quoteIcon,
  quoteToken,
  networkName,
  singleToken = false,
}: OmniHeadlinePropsParams) {
  const { t } = useTranslation()

  const title = t(singleToken ? 'omni-kit.headline.title-single' : 'omni-kit.headline.title', {
    collateralToken,
    productType: upperFirst(productType),
    quoteToken: singleToken ? quoteToken : undefined,
  })
  const id = positionId ? ` #${positionId}` : ''

  return {
    ...(collateralToken && quoteToken && collateralIcon && quoteIcon
      ? {
          header: `${title}${id}`,
          tokens: singleToken ? [quoteIcon] : [collateralIcon, quoteIcon],
          protocol: {
            network: networkName,
            protocol,
          },
        }
      : {}),
  }
}
