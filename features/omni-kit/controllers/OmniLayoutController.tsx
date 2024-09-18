import { MessageCard } from 'components/MessageCard'
import { TabBar } from 'components/TabBar'
import { DisabledOptimizationControl } from 'components/vault/DisabledOptimizationControl'
import { DisabledProtectionControl } from 'components/vault/DisabledProtectionControl'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { faultyTakeProfitTriggerIdsByNetwork } from 'features/automation/common/consts'
import { VaultOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { OmniAutomationFormController } from 'features/omni-kit/automation/controllers/'
import {
  hasActiveOptimization,
  hasActiveProtection,
  isSupportingAutomation,
} from 'features/omni-kit/automation/helpers'
import { useOmniMinNetAutomationValue } from 'features/omni-kit/automation/hooks'
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
import { OmniProductType, OmniSidebarAutomationStep } from 'features/omni-kit/types'
import { UpgradeToSkyBanner } from 'features/sky/components/UpgradeToSkyBanner'
import { useAppConfig } from 'helpers/config'
import { formatCryptoBalance, formatLtvDecimalAsPercent } from 'helpers/formatters/format'
import { useAccount } from 'helpers/useAccount'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Container, Grid } from 'theme-ui'

export function OmniLayoutController({ txHandler }: { txHandler: () => () => void }) {
  const { ProxyReveal: proxyReveal, LambdaAutomations, SkyUpgrade } = useAppConfig('features')

  const { t } = useTranslation()

  const { contextIsLoaded, walletAddress } = useAccount()

  const {
    environment: {
      collateralIcon,
      collateralToken,
      dpmProxy,
      isOpening,
      isOracless,
      isOwner,
      isShort,
      isYieldLoopWithData,
      network,
      networkId,
      owner,
      poolId,
      positionId,
      priceFormat,
      productType,
      protocol,
      quoteIcon,
      quoteToken,
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

  const { isSupportingOptimization, isSupportingProtection } = isSupportingAutomation({
    collateralToken,
    networkId,
    poolId,
    protocol,
    quoteToken,
    settings,
  })

  const ltv = 'riskRatio' in position ? position.riskRatio.loanToValue : undefined
  const maxLtv = 'maxRiskRatio' in position ? position.maxRiskRatio.loanToValue : undefined
  const netValue = 'netValue' in position ? position.netValue : undefined
  const minNetValue = useOmniMinNetAutomationValue({ protocol, networkId })

  const partialProfitTiggerId = automation?.triggers.partialTakeProfit?.triggerId
  const faultyTakeProfitTriggerIds = faultyTakeProfitTriggerIdsByNetwork[networkId]
  const shouldShowOverrideTakeProfit =
    faultyTakeProfitTriggerIds && partialProfitTiggerId
      ? faultyTakeProfitTriggerIds.includes(Number(partialProfitTiggerId))
      : false

  const showSkyBanner =
    SkyUpgrade &&
    ([quoteToken, collateralToken].includes('DAI') || [quoteToken, collateralToken].includes('MKR'))

  return (
    <Container variant="vaultPageContainerStatic">
      {contextIsLoaded && !isOwner && !isOpening && (
        <VaultOwnershipBanner controller={owner} account={walletAddress} mb={4} />
      )}
      {shouldShowOverrideTakeProfit && (
        <Box mb={4}>
          <MessageCard
            type="warning"
            messages={[t('vault-warnings.partial-take-profit-override')]}
            withBullet={false}
          />
        </Box>
      )}

      {isOwner && showSkyBanner && <UpgradeToSkyBanner />}
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
          maxLtv,
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
                          isShort ? one.div(position.marketPrice) : position.marketPrice,
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
        useDropdownOnMobile
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
                ...(isSupportingProtection
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
                          active: hasActiveProtection({ poolId, positionTriggers, protocol }),
                        },
                        label: t('system.protection'),
                        content:
                          netValue?.gt(minNetValue) || LambdaAutomations.DisableNetValueCheck ? (
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
                ...(isSupportingOptimization
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
                          active: hasActiveOptimization({ poolId, positionTriggers, protocol }),
                        },
                        label: t('system.optimization'),
                        content:
                          netValue?.gt(minNetValue) || LambdaAutomations.DisableNetValueCheck ? (
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
