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
      collateralPrice,
      collateralToken,
      flow,
      id,
      isShort,
      isOracless,
      owner,
      priceFormat,
      product,
      quotePrice,
      quoteToken,
      dpmProxy,
      collateralIcon,
      quoteIcon,
      protocol,
    },
  } = useOmniGeneralContext()

  return (
    <Container variant="vaultPageContainerStatic">
      {contextIsLoaded && owner !== walletAddress && flow === 'manage' && (
        <Box sx={{ mb: 4 }}>
          <VaultOwnershipBanner controller={owner} account={walletAddress} />
        </Box>
      )}
      <VaultHeadline
        header=""
        {...getOmniHeadlineProps({
          collateralToken,
          flow,
          id,
          product,
          quoteToken,
          collateralIcon,
          quoteIcon,
          protocol,
        })}
        {...(flow === 'manage' && { shareButton: true })}
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
            value: flow === 'manage' ? 'overview' : 'setup',
            label: t(flow === 'manage' ? 'system.overview' : 'setup'),
            content: <>{position}</>,
          },
          {
            value: 'position-info',
            label: t('system.position-info'),
            content: <>{info}</>,
          },
          ...(flow === 'manage'
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
