import { TabBar } from 'components/TabBar'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { AjnaBorrowOverviewWrapper } from 'features/ajna/borrow/overview/AjnaBorrowOverviewWrapper'
import { AjnaBorrowFormWrapper } from 'features/ajna/borrow/sidebars/AjnaBorrowFormWrapper'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Card, Container, Grid } from 'theme-ui'

export function AjnaOpenBorrowView() {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken, quotePrice, quoteToken },
  } = useAjnaProductContext()

  return (
    <Container variant="vaultPageContainer">
      <VaultHeadline
        header={t('ajna.borrow.open.headline.header', { collateralToken, quoteToken })}
        token={[collateralToken, quoteToken]}
        outline={{ size: 1, color: ajnaExtensionTheme.colors.interactive100 }}
        label="/static/img/ajna-product-card-label.svg"
        details={[
          {
            label: t('ajna.borrow.open.headline.current-market-price', { collateralToken }),
            value: `${formatCryptoBalance(
              collateralPrice.dividedBy(quotePrice),
            )} ${collateralToken}/${quoteToken}`,
          },
        ]}
      />
      <TabBar
        variant="underline"
        sections={[
          {
            value: 'setup',
            label: t('setup'),
            content: (
              <Grid variant="vaultContainer">
                <AjnaBorrowOverviewWrapper />
                <AjnaBorrowFormWrapper />
              </Grid>
            ),
          },
          {
            value: 'position-info',
            label: t('system.position-info'),
            content: (
              <Grid variant="vaultContainer">
                <Card variant="faq">FAQ</Card>
              </Grid>
            ),
          },
        ]}
      />
    </Container>
  )
}
