import { useTranslation } from 'next-i18next'
import { ajnaExtensionTheme } from 'theme'

export function getAjnaBorrowHeadlineProps(collateralToken: string, quoteToken: string) {
  const { t } = useTranslation()

  return {
    header: t('ajna.borrow.open.headline.header', { collateralToken, quoteToken }),
    token: [collateralToken, quoteToken],
    outline: { size: 1, color: ajnaExtensionTheme.colors.interactive100 },
    label: '/static/img/ajna-product-card-label.svg',
  }
}
