import { AjnaFlow, AjnaProduct } from 'features/ajna/common/types'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

interface AjnaBorrowHeadlinePropsParams {
  collateralToken?: string
  flow: AjnaFlow
  id?: string
  product?: AjnaProduct
  quoteToken?: string
  strategy: string
}

export function getAjnaHeadlineProps({
  collateralToken,
  flow,
  id,
  product,
  quoteToken,
  strategy,
}: AjnaBorrowHeadlinePropsParams) {
  const { t } = useTranslation()

  return {
    ...(collateralToken &&
      quoteToken && {
        header: t(`ajna.position-page.common.headline.${flow}`, {
          collateralToken,
          id,
          product: upperFirst(product),
          strategy,
          quoteToken,
        }),
        token: [collateralToken, quoteToken],
        label: '/static/img/ajna-product-card-label.svg',
      }),
  }
}
