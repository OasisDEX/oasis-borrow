import { TabBar } from 'components/TabBar'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { VaultOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { hasActiveOptimization, hasActiveProtection } from 'features/omni-kit/automation/helpers'
import {
  omniOptimizationLikeAutomationFeatures,
  omniProtectionLikeAutomationFeatures,
} from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  OmniFaqController,
  OmniHistoryController,
  OmniOptimizationController,
  OmniOverviewController,
  OmniProtectionController,
} from 'features/omni-kit/controllers'
import { OmniBorrowFormController } from 'features/omni-kit/controllers/borrow'
import { OmniEarnFormController } from 'features/omni-kit/controllers/earn'
import { OmniMultiplyFormController } from 'features/omni-kit/controllers/multiply'
import { getOmniHeadlineProps } from 'features/omni-kit/helpers'
import { isPoolSupportingMultiply } from 'features/omni-kit/protocols/ajna/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { useAppConfig } from 'helpers/config'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { hasCommonElement } from 'helpers/hasCommonElement'
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
      networkId,
      isYieldLoopWithData,
      settings,
    },
  } = useOmniGeneralContext()
  const {
    position: {
      currentPosition: { position },
    },
    dynamicMetadata: {
      elements: { faq },
      values: { headlineDetails, isHeadlineDetailsLoading },
    },
    automation: { positionTriggers },
  } = useOmniProductContext(productType)

  const isMultiplySupported = isPoolSupportingMultiply({
    collateralToken,
    quoteToken,
    supportedTokens: settings.supportedMultiplyTokens[networkId],
  })
  const automationFeatures = isMultiplySupported
    ? settings.availableAutomations?.[networkId] || []
    : []

  const ltv = 'riskRatio' in position ? position.riskRatio.loanToValue : undefined

  return (
    <Container variant="vaultPageContainerStatic">
      {contextIsLoaded && owner !== walletAddress && !isOpening && (
        <Box sx={{ mb: 4 }}>
          <VaultOwnershipBanner controller={owner} account={walletAddress} />
        </Box>
      )}
      <VaultHeadline
        loading={isHeadlineDetailsLoading}
        {...getOmniHeadlineProps({
          collateralIcon,
          collateralToken,
          positionId,
          productType,
          protocol,
          quoteIcon,
          quoteToken,
          networkName: network.name,
          isYieldLoopWithData,
        })}
        details={[
          ...(headlineDetails || []),
          ...(!isOracless && !isYieldLoopWithData
            ? [
                ...(ltv && !isOpening
                  ? [
                      {
                        label: t('omni-kit.headline.details.current-ltv'),
                        value: formatDecimalAsPercent(ltv),
                      },
                    ]
                  : []),
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
                ...(hasCommonElement(automationFeatures, omniProtectionLikeAutomationFeatures)
                  ? [
                      {
                        value: 'protection',
                        tag: {
                          include: true,
                          active: hasActiveProtection(positionTriggers, protocol),
                        },
                        label: t('system.protection'),
                        content: <OmniProtectionController />,
                      },
                    ]
                  : []),
                ...(hasCommonElement(automationFeatures, omniOptimizationLikeAutomationFeatures)
                  ? [
                      {
                        value: 'optimization',
                        tag: {
                          include: true,
                          active: hasActiveOptimization(positionTriggers),
                        },
                        label: t('system.optimization'),
                        content: <OmniOptimizationController />,
                      },
                    ]
                  : []),
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
