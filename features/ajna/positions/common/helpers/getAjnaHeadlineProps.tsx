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
}

export function getAjnaHeadlineProps({
  collateralToken,
  flow,
  id,
  product,
  quoteToken,
}: AjnaBorrowHeadlinePropsParams) {
  const { t } = useTranslation()

  return {
    ...(collateralToken &&
      quoteToken && {
        header: t(`ajna.position-page.common.headline.${flow}`, {
          collateralToken,
          id,
          product: upperFirst(product),
          quoteToken,
        }),
        tokens: [collateralToken, quoteToken],
        protocol: {
          network: NetworkNames.ethereumMainnet,
          protocol: LendingProtocol.Ajna,
        },
      }),
  }
}
