import { AjnaFlow, AjnaProduct } from 'features/ajna/common/types'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

interface AjnaBorrowHeadlinePropsParams {
  collateralToken?: string
  flow: AjnaFlow
  isShort: boolean
  id?: string
  product?: AjnaProduct
  quoteToken?: string
}

export function getAjnaHeadlineProps({
  collateralToken,
  flow,
  id,
  isShort,
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
          strategy: t(isShort ? 'short' : 'long'),
          quoteToken,
        }),
        token: [collateralToken, quoteToken],
        label: '/static/img/ajna-product-card-label.svg',
      }),
  }
}
