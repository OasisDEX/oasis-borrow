import BigNumber from 'bignumber.js'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import { ajnaExtensionTheme } from 'theme'
import { Container } from 'theme-ui'

interface AjnaOpenBorrowViewProps {
  collateralToken: string
  quoteToken: string
}

export function AjnaOpenBorrowView({ collateralToken, quoteToken }: AjnaOpenBorrowViewProps) {
  const { t } = useTranslation()

  return (
    <Container variant="vaultPageContainer">
      <VaultHeadline
        header={t('ajna.borrow.open.headline.header', { collateralToken, quoteToken })}
        token={[collateralToken, quoteToken]}
        outline={{ size: 1, color: ajnaExtensionTheme.colors.interactive100 }}
        label="/static/img/ajna-product-card-label.svg"
        details={[
          {
            label: t('ajna.borrow.open.headline.current-collateral-price', { collateralToken }),
            value: `$${formatAmount(new BigNumber(1400), 'USD')}`,
          },
          {
            label: t('ajna.borrow.open.headline.current-quote-price', { quoteToken }),
            value: `$${formatAmount(new BigNumber(1), 'USD')}`,
          },
        ]}
      />
    </Container>
  )
}
