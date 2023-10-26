import { TabBar } from 'components/TabBar'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import type { HeadlineDetailsProp } from 'components/vault/VaultHeadlineDetails'
import { VaultOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { getOmniHeadlineProps } from 'features/omni-kit/helpers'
import { useAppConfig } from 'helpers/config'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import type { ReactNode } from 'react'
import React from 'react'
import { Box, Container } from 'theme-ui'

interface OmniPositionViewProps {
  headlineDetails?: HeadlineDetailsProp[]
  tabs: {
    position: ReactNode
    history: ReactNode
    info: ReactNode
  }
}

export function OmniPositionView({
  headlineDetails,
  tabs: { position, history, info },
}: OmniPositionViewProps) {
  const { t } = useTranslation()
  const { contextIsLoaded, walletAddress } = useAccount()
  const { ProxyReveal: proxyReveal } = useAppConfig('features')
  const {
    environment: {
      collateralIcon,
      collateralPrice,
      collateralToken,
      dpmProxy,
      isOpening,
      isOracless,
      isShort,
      owner,
      positionId,
      priceFormat,
      productType,
      protocol,
      quoteIcon,
      quotePrice,
      quoteToken,
    },
  } = useOmniGeneralContext()

  return (
    <Container variant="vaultPageContainerStatic">
      {contextIsLoaded && owner !== walletAddress && !isOpening && (
        <Box sx={{ mb: 4 }}>
          <VaultOwnershipBanner controller={owner} account={walletAddress} />
        </Box>
      )}
      <VaultHeadline
        header=""
        {...getOmniHeadlineProps({
          collateralToken,
          positionId,
          productType,
          quoteToken,
          collateralIcon,
          quoteIcon,
          protocol,
        })}
        {...(!isOpening && { shareButton: true })}
        details={[
          ...(headlineDetails || []),
          ...(!isOracless
            ? [
                {
                  // TODO to be converted to omni translation
                  label: t('ajna.position-page.common.headline.current-market-price', {
                    collateralToken,
                  }),
                  value: `${formatCryptoBalance(
                    isShort ? quotePrice.div(collateralPrice) : collateralPrice.div(quotePrice),
                  )} ${priceFormat}`,
                },
              ]
            : []),
        ]}
        handleClick={
          proxyReveal
            ? () => console.info(`DPM proxy: ${dpmProxy?.toLowerCase()}, DPM owner: ${owner}`)
            : undefined
        }
      />
      <TabBar
        variant="underline"
        sections={[
          {
            value: isOpening ? 'setup' : 'overview',
            label: t(isOpening ? 'setup' : 'system.overview'),
            content: <>{position}</>,
          },
          {
            value: 'position-info',
            label: t('system.position-info'),
            content: <>{info}</>,
          },
          ...(!isOpening
            ? [
                {
                  value: 'history',
                  label: t('system.history'),
                  content: <>{history}</>,
                },
              ]
            : []),
        ]}
      />
    </Container>
  )
}
