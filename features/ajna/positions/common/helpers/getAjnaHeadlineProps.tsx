import { NetworkNames } from 'blockchain/networks'
import type { ProtocolFlow, ProtocolProduct } from 'features/unifiedProtocol/types'
import { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

interface AjnaBorrowHeadlinePropsParams {
  collateralToken?: string
  flow: ProtocolFlow
  id?: string
  product?: ProtocolProduct
  quoteToken?: string
  collateralAddress?: string
  quoteAddress?: string
  collateralIcon?: string
  quoteIcon?: string
}

export function getAjnaHeadlineProps({
  collateralToken,
  flow,
  id,
  product,
  quoteToken,
  collateralIcon,
  quoteIcon,
}: AjnaBorrowHeadlinePropsParams) {
  const { t } = useTranslation()

  return {
    ...(collateralToken &&
      quoteToken &&
      collateralIcon &&
      quoteIcon && {
        header: t(`ajna.position-page.common.headline.${flow}`, {
          collateralToken,
          id,
          product: upperFirst(product),
          quoteToken,
        }),
        tokens: [collateralIcon, quoteIcon],
        protocol: {
          network: NetworkNames.ethereumMainnet,
          protocol: LendingProtocol.Ajna,
        },
      }),
  }
}
