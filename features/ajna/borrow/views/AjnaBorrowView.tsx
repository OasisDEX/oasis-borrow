import { TabBar } from 'components/TabBar'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { getAjnaBorrowHeadlineProps } from 'features/ajna/borrow/helpers'
import { AjnaBorrowOverviewWrapper } from 'features/ajna/borrow/overview/AjnaBorrowOverviewWrapper'
import { AjnaBorrowFormWrapper } from 'features/ajna/borrow/sidebars/AjnaBorrowFormWrapper'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Container, Flex, Grid, Heading, Image, Text } from 'theme-ui'

export function AjnaBorrowView() {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken, flow, product, quotePrice, quoteToken },
    position: { id },
  } = useAjnaBorrowContext()

  return (
    <Container variant="vaultPageContainerStatic">
      <VaultHeadline
        header=""
        {...getAjnaBorrowHeadlineProps({ collateralToken, flow, id, product, quoteToken })}
        {...(flow === 'manage' && { shareButton: true })}
        details={[
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
