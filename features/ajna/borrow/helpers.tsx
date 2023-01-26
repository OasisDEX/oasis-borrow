import { useTranslation } from 'next-i18next'

export function getAjnaBorrowHeadlineProps(collateralToken: string, quoteToken: string) {
  const { t } = useTranslation()

  return {
    header: t('ajna.borrow.open.headline.header', { collateralToken, quoteToken }),
    token: [collateralToken, quoteToken],
    label: '/static/img/ajna-product-card-label.svg',
  }
}
