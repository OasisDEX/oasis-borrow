import { AjnaFlow, AjnaProduct } from 'features/ajna/common/types'
import { useTranslation } from 'next-i18next'

interface AjnaBorrowHeadlinePropsParams {
  collateralToken?: string
  flow: AjnaFlow
  id?: string
  product?: AjnaProduct
  quoteToken?: string
}

export function getAjnaBorrowHeadlineProps({
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
        header: t(`ajna.${product}.${flow}.headline.header`, { collateralToken, id, quoteToken }),
        token: [collateralToken, quoteToken],
        label: '/static/img/ajna-product-card-label.svg',
      }),
  }
}
