import { PositionHistory } from 'components/history/PositionHistory'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Heading, Image, Text } from 'theme-ui'

export function OmniHistoryController() {
  const { t } = useTranslation()
  const {
    environment: {
      collateralToken,
      isOracless,
      isShort,
      networkId,
      priceFormat,
      productType,
      protocol,
      quoteToken,
    },
  } = useOmniGeneralContext()
  const {
    position: { history },
  } = useOmniProductContext(productType)

  return history.length ? (
    <Grid variant="vaultContainer">
      <PositionHistory
        collateralToken={collateralToken}
        historyEvents={history}
        isOracless={isOracless}
        isShort={isShort}
        priceFormat={priceFormat}
        quoteToken={quoteToken}
        networkId={networkId}
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
        {t('omni-kit.history.title')}
      </Heading>
      <Text as="p" variant="paragraph2" sx={{ m: 0, color: 'neutral80' }}>
        {t('omni-kit.history.notice', { protocol: LendingProtocolLabel[protocol] })}
      </Text>
    </Flex>
  )
}
