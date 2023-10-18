import { NetworkNames } from 'blockchain/networks'
import type { OmniFlow, OmniProduct } from 'features/omni-kit/types/common.types'
import type { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

interface OmniHeadlinePropsParams {
  collateralToken?: string
  flow: OmniFlow
  id?: string
  product?: OmniProduct
  quoteToken?: string
  collateralAddress?: string
  quoteAddress?: string
  collateralIcon?: string
  quoteIcon?: string
  protocol: LendingProtocol
  headlineKey: string
}

export function getOmniHeadlineProps({
  collateralToken,
  flow,
  id,
  product,
  quoteToken,
  collateralIcon,
  quoteIcon,
  headlineKey,
  protocol,
}: OmniHeadlinePropsParams) {
  const { t } = useTranslation()

  return {
    ...(collateralToken &&
      quoteToken &&
      collateralIcon &&
      quoteIcon && {
        header: t(`${headlineKey}.${flow}`, {
          collateralToken,
          id,
          product: upperFirst(product),
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
