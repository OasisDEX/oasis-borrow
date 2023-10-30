import { NetworkNames } from 'blockchain/networks'
import type { AjnaFlow, AjnaProduct } from 'features/ajna/common/types'
import { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

interface AjnaBorrowHeadlinePropsParams {
  collateralToken?: string
  flow: AjnaFlow
  id?: string
  product?: AjnaProduct
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
          positionId: id,
          productType: upperFirst(product),
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
