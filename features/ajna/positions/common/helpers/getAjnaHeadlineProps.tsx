import { NetworkNames } from 'blockchain/networks'
import { AjnaFlow, AjnaProduct } from 'features/ajna/common/types'
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
  collateralTokenIcon?: string
  quoteTokenIcon?: string
}

export function getAjnaHeadlineProps({
  collateralToken,
  flow,
  id,
  product,
  quoteToken,
  collateralTokenIcon,
  quoteTokenIcon,
}: AjnaBorrowHeadlinePropsParams) {
  const { t } = useTranslation()

  return {
    ...(collateralToken &&
      quoteToken &&
      collateralTokenIcon &&
      quoteTokenIcon && {
        header: t(`ajna.position-page.common.headline.${flow}`, {
          collateralToken,
          id,
          product: upperFirst(product),
          quoteToken,
        }),
        tokens: [collateralTokenIcon, quoteTokenIcon],
        protocol: {
          network: NetworkNames.ethereumMainnet,
          protocol: LendingProtocol.Ajna,
        },
      }),
  }
}
