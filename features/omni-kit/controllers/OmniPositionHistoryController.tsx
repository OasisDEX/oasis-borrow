import { PositionHistory } from 'components/history/PositionHistory'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Heading, Image, Text } from 'theme-ui'

export function OmniPositionHistoryController() {
  const { t } = useTranslation()
  const {
    environment: { isOracless, product, isShort, priceFormat, collateralToken, quoteToken },
  } = useOmniGeneralContext()
  const {
    position: { history },
  } = useOmniProductContext(product)

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
