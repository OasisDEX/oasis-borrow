import { TabBar } from 'components/TabBar'
import { DisabledOptimizationControl } from 'components/vault/DisabledOptimizationControl'
import { DisabledProtectionControl } from 'components/vault/DisabledProtectionControl'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { VaultOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { OmniAutomationFormController } from 'features/omni-kit/automation/controllers/'
import { hasActiveOptimization, hasActiveProtection } from 'features/omni-kit/automation/helpers'
import { useOmniMinNetAutomationValue } from 'features/omni-kit/automation/hooks'
import {
  omniOptimizationLikeAutomationFeatures,
  omniProtectionLikeAutomationFeatures,
} from 'features/omni-kit/constants'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  OmniFaqController,
  OmniHistoryController,
  OmniOptimizationOverviewController,
  OmniOverviewController,
  OmniProtectionOverviewController,
} from 'features/omni-kit/controllers'
import { OmniBorrowFormController } from 'features/omni-kit/controllers/borrow'
import { OmniEarnFormController } from 'features/omni-kit/controllers/earn'
import { OmniMultiplyFormController } from 'features/omni-kit/controllers/multiply'
import { getOmniHeadlineProps } from 'features/omni-kit/helpers'
import { isPoolSupportingMultiply } from 'features/omni-kit/protocols/ajna/helpers'
import { OmniProductType, OmniSidebarAutomationStep } from 'features/omni-kit/types'
import { useAppConfig } from 'helpers/config'
import { formatCryptoBalance, formatLtvDecimalAsPercent } from 'helpers/formatters/format'
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
      isYieldLoop,
      settings,
    },
    tx: { isTxInProgress },
    automationSteps,
  } = useOmniGeneralContext()
  const {
    position: {
      currentPosition: { position },
    },
    dynamicMetadata: {
      elements: { faq, positionBanner },
      values: { headline, headlineDetails, isHeadlineDetailsLoading, automation },
    },
    automation: {
      positionTriggers,
      commonForm: {
        state: { uiDropdownProtection, uiDropdownOptimization },
        dispatch: commonFormStateDispatch,
      },
    },
  } = useOmniProductContext(productType)

  const automationFormStateDispatch = automation?.resolved.activeForm.dispatch

  const isMultiplySupported = isPoolSupportingMultiply({
    collateralToken,
    quoteToken,
    supportedTokens: settings.supportedMultiplyTokens[networkId],
  })
  const automationFeatures =
    isMultiplySupported && !isYieldLoop ? settings.availableAutomations?.[networkId] || [] : []

  const ltv = 'riskRatio' in position ? position.riskRatio.loanToValue : undefined
  const netValue = 'netValue' in position ? position.netValue : undefined
  const minNetValue = useOmniMinNetAutomationValue({ protocol, networkId })

  return (
    <Container variant="vaultPageContainerStatic">
      {contextIsLoaded && owner !== walletAddress && !isOpening && (
        <Box sx={{ mb: 4 }}>
          <VaultOwnershipBanner controller={owner} account={walletAddress} />
        </Box>
      )}
      {positionBanner && <Box sx={{ mb: 4 }}>{positionBanner}</Box>}
      <VaultHeadline
        loading={isHeadlineDetailsLoading}
        {...getOmniHeadlineProps({
          collateralIcon,
          collateralToken,
          headline,
          isYieldLoopWithData,
          networkName: network.name,
          positionId,
          productType,
          protocol,
          quoteIcon,
          quoteToken,
        })}
        details={[
          ...(headlineDetails || []),
          ...(!isOracless && !isYieldLoopWithData
            ? [
                ...(ltv && !isOpening
                  ? [
                      {
                        label: t('omni-kit.headline.details.current-ltv'),
                        value: formatLtvDecimalAsPercent(ltv),
                      },
                    ]
                  : []),
                ...(collateralToken !== quoteToken
                  ? [
                      {
                        label: t('omni-kit.headline.details.current-market-price'),
                        value: `${formatCryptoBalance(
                          isShort
                            ? quotePrice.div(collateralPrice)
                            : collateralPrice.div(quotePrice),
                        )} ${priceFormat}`,
                      },
                    ]
                  : []),
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
                        callback: !isTxInProgress
                          ? () => {
                              automationSteps.setStep(OmniSidebarAutomationStep.Manage)
                              commonFormStateDispatch({ type: 'reset' })
                              automationFormStateDispatch?.({ type: 'reset' })
                            }
                          : undefined,
                        tag: {
                          include: true,
                          active: hasActiveProtection(positionTriggers, protocol),
                        },
                        label: t('system.protection'),
                        content: netValue?.gt(minNetValue) ? (
                          <Grid variant="vaultContainer">
                            <OmniProtectionOverviewController />
                            {uiDropdownProtection && <OmniAutomationFormController />}
                          </Grid>
                        ) : (
                          <DisabledProtectionControl minNetValue={minNetValue} />
                        ),
                      },
                    ]
                  : []),
                ...(hasCommonElement(automationFeatures, omniOptimizationLikeAutomationFeatures)
                  ? [
                      {
                        value: 'optimization',
                        callback: !isTxInProgress
                          ? () => {
                              automationSteps.setStep(OmniSidebarAutomationStep.Manage)
                              commonFormStateDispatch({ type: 'reset' })
                              automationFormStateDispatch?.({ type: 'reset' })
                            }
                          : undefined,
                        tag: {
                          include: true,
                          active: hasActiveOptimization(positionTriggers, protocol),
                        },
                        label: t('system.optimization'),
                        content: netValue?.gt(minNetValue) ? (
                          <Grid variant="vaultContainer">
                            <OmniOptimizationOverviewController />
                            {uiDropdownOptimization && <OmniAutomationFormController />}
                          </Grid>
                        ) : (
                          <DisabledOptimizationControl minNetValue={minNetValue} />
                        ),
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
