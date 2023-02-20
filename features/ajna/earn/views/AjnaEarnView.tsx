import BigNumber from 'bignumber.js'
import { TabBar } from 'components/TabBar'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { getAjnaHeadlineProps } from 'features/ajna/common/helpers'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { AjnaEarnOverviewWrapper } from 'features/ajna/earn/controls/AjnaEarnOverviewController'
import { AjnaEarnFormWrapper } from 'features/ajna/earn/sidebars/AjnaEarnFormWrapper'
import { VaultOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

export function AjnaEarnView() {
  const { t } = useTranslation()
  const { contextIsLoaded, walletAddress } = useAccount()
  const {
    position: { resolvedId },
  } = useAjnaBorrowContext()
  const {
    environment: { collateralPrice, collateralToken, flow, owner, product, quotePrice, quoteToken },
  } = useAjnaGeneralContext()

  return (
    <Container variant="vaultPageContainerStatic">
      {contextIsLoaded && owner !== walletAddress && flow === 'manage' && (
        <Box sx={{ mb: 4 }}>
          <VaultOwnershipBanner controller={owner} account={walletAddress} />
        </Box>
      )}
      <VaultHeadline
        header=""
        {...getAjnaHeadlineProps({
          collateralToken,
          flow,
          id: resolvedId,
          product,
          quoteToken,
        })}
        {...(flow === 'manage' && { shareButton: true })}
        details={[
          {
            label: t('ajna.earn.common.headline.current-yield', { collateralToken }),
            value: formatPercent(new BigNumber(12.23), { precision: 2 }),
          },
          {
            label: t('ajna.earn.common.headline.90-day-avg', { collateralToken }),
            value: 8.92,
          },
          {
            label: t('ajna.earn.common.headline.current-market-price', { collateralToken }),
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
            value: flow === 'manage' ? 'overview' : 'setup',
            label: t(flow === 'manage' ? 'system.overview' : 'build-your-position'),
            content: (
              <Grid variant="vaultContainer">
                <AjnaEarnOverviewWrapper />
                <AjnaEarnFormWrapper />
              </Grid>
            ),
          },
          {
            value: 'ajna-faq',
            label: t('ajna.earn.common.ajna-faq'),
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
