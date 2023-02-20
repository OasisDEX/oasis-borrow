import { TabBar } from 'components/TabBar'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { AjnaBorrowOverviewWrapper } from 'features/ajna/borrow/overview/AjnaBorrowOverviewWrapper'
import { AjnaBorrowFormWrapper } from 'features/ajna/borrow/sidebars/AjnaBorrowFormWrapper'
import { getAjnaHeadlineProps } from 'features/ajna/common/helpers'
import { useAjnaGeneralContext } from 'features/ajna/contexts/AjnaGeneralContext'
import { VaultOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Flex, Grid, Heading, Image, Text } from 'theme-ui'

export function AjnaPositionView() {
  const { t } = useTranslation()
  const { contextIsLoaded, walletAddress } = useAccount()
  const {
    environment: {
      collateralPrice,
      collateralToken,
      flow,
      id,
      owner,
      product,
      quotePrice,
      quoteToken,
    },
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
        {...getAjnaHeadlineProps({ collateralToken, flow, id, product, quoteToken })}
        {...(flow === 'manage' && { shareButton: true })}
        details={[
          ...(product === 'earn'
            ? // TODO: replace with data from library
              [
                {
                  label: t('ajna.earn.common.headline.current-yield', { collateralToken }),
                  value: '21.37',
                },
                {
                  label: t('ajna.earn.common.headline.90-day-avg', { collateralToken }),
                  value: '11.50',
                },
              ]
            : []),
          {
            label: t('ajna.borrow.common.headline.current-market-price', { collateralToken }),
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
            label: t(flow === 'manage' ? 'system.overview' : 'setup'),
            content: (
              <Grid variant="vaultContainer">
                {product === 'borrow' && (
                  <>
                    <AjnaBorrowOverviewWrapper />
                    <AjnaBorrowFormWrapper />
                  </>
                )}
                {product === 'earn' && 'EARN UI'}
                {product === 'multiply' && 'MULITPLY UI'}
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
          ...(flow === 'manage'
            ? [
                {
                  value: 'history',
                  label: t('system.history'),
                  content: (
                    <Flex
                      sx={{
                        maxWidth: '600px',
                        flexDirection: 'column',
                        alignItems: ['flex-start', 'center'],
                        mx: 'auto',
                        pt: 5,
                        textAlign: ['left', 'center'],
                      }}
                    >
                      <Image
                        src={staticFilesRuntimeUrl('/static/img/no-positions.svg')}
                        sx={{ alignSelf: 'center' }}
                      />
                      <Heading variant="boldParagraph2" sx={{ mt: 4, mb: 1 }}>
                        {t('ajna.history.title')}
                      </Heading>
                      <Text as="p" variant="paragraph2" sx={{ m: 0, color: 'neutral80' }}>
                        {t('ajna.history.notice')}
                      </Text>
                    </Flex>
                  ),
                },
              ]
            : []),
        ]}
      />
    </Container>
  )
}
