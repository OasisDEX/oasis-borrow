import { TabBar } from 'components/TabBar'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { VaultOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  OmniFaqController,
  OmniHistoryController,
  OmniOverviewController,
} from 'features/omni-kit/controllers'
import { OmniBorrowFormController } from 'features/omni-kit/controllers/borrow'
import { OmniEarnFormController } from 'features/omni-kit/controllers/earn'
import { OmniMultiplyFormController } from 'features/omni-kit/controllers/multiply'
import { getOmniHeadlineProps } from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { useAppConfig } from 'helpers/config'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Container, Grid } from 'theme-ui'

export function OmniLayoutController({ txHandler }: { txHandler: () => () => void }) {
  const { ProxyReveal: proxyReveal } = useAppConfig('features')

  const { t } = useTranslation()

  const { contextIsLoaded, walletAddress } = useAccount()

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
      network,
      isYieldLoop,
    },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      elements: { faq },
      values: { headlineDetails },
    },
  } = useOmniProductContext(productType)

  return (
    <Container variant="vaultPageContainerStatic">
      {contextIsLoaded && owner !== walletAddress && !isOpening && (
        <Box sx={{ mb: 4 }}>
          <VaultOwnershipBanner controller={owner} account={walletAddress} />
        </Box>
      )}
      <VaultHeadline
        {...getOmniHeadlineProps({
          collateralIcon,
          collateralToken,
          positionId,
          productType,
          protocol,
          quoteIcon,
          quoteToken,
          networkName: network.name,
          isYieldLoop,
        })}
        details={[
          ...(headlineDetails || []),
          ...(!isOracless
            ? [
                {
                  label: t('omni-kit.headline.details.current-market-price'),
                  value: `${formatCryptoBalance(
                    isShort ? quotePrice.div(collateralPrice) : collateralPrice.div(quotePrice),
                  )} ${priceFormat}`,
                },
              ]
            : []),
        ]}
        handleClick={() => {
          if (proxyReveal)
            console.info(`DPM proxy: ${dpmProxy?.toLowerCase()}, DPM owner: ${owner.toLowerCase()}`)
        }}
      />
      <TabBar
        variant="underline"
        sections={[
          {
            value: isOpening ? 'setup' : 'overview',
            label: t(isOpening ? 'setup' : 'system.overview'),
            content: (
              <Grid variant="vaultContainer">
                <OmniOverviewController />
                {
                  {
                    [OmniProductType.Borrow]: <OmniBorrowFormController txHandler={txHandler} />,
                    [OmniProductType.Earn]: <OmniEarnFormController txHandler={txHandler} />,
                    [OmniProductType.Multiply]: (
                      <OmniMultiplyFormController txHandler={txHandler} />
                    ),
                  }[productType]
                }
              </Grid>
            ),
          },
          {
            value: 'position-info',
            label: t('system.position-info'),
            content: <OmniFaqController content={{ en: faq }} />,
          },
          ...(!isOpening
            ? [
                {
                  value: 'history',
                  label: t('system.history'),
                  content: <OmniHistoryController />,
                },
              ]
            : []),
        ]}
      />
    </Container>
  )
}
