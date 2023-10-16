import { PositionHistory } from 'components/history/PositionHistory'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Flex, Grid, Heading, Image, Text } from 'theme-ui'

export function AjnaPositionViewInfoPlaceholder() {
  return (
    <Grid variant="vaultContainer">
      <Card variant="faq">FAQ</Card>
    </Grid>
  )
}

export function AjnaPositionHistoryController() {
  const { t } = useTranslation()
  const {
    environment: { isOracless, product, isShort, priceFormat, collateralToken, quoteToken },
  } = useProtocolGeneralContext()
  const {
    position: { history },
  } = useGenericProductContext(product)

  const { chainId } = useWalletManagement()

  return history.length ? (
    <Grid variant="vaultContainer">
      <PositionHistory
        collateralToken={collateralToken}
        historyEvents={history}
        isOracless={isOracless}
        isShort={isShort}
        priceFormat={priceFormat}
        quoteToken={quoteToken}
        networkId={chainId}
      />
    </Grid>
  ) : (
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
  )
}
