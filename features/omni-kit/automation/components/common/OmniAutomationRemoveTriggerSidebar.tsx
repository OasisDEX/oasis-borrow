import type { LendingPosition } from '@oasisdex/dma-library'
import { InfoSection } from 'components/infoSection/InfoSection'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import { AutomationFeatures } from 'features/automation/common/types'
import { OmniAutomationCancelNotice } from 'features/omni-kit/automation/components/common/OmniAutomationCancelNotice'
import { OmniGasEstimation } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { AddingStopLossAnimation } from 'theme/animations'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'

export const OmniAutomationRemoveTriggerSidebar: FC = ({ children }) => {
  const { t } = useTranslation()
  const {
    environment: { productType, priceFormat },
    tx: { isTxSuccess, txDetails, isTxInProgress },
  } = useOmniGeneralContext()
  const {
    automation: { isSimulationLoading, commonForm },
    position: {
      currentPosition: { position },
    },
    dynamicMetadata: {
      values: { automation },
    },
  } = useOmniProductContext(productType)

  const castedPosition = position as LendingPosition

  if (!automation) {
    throw new Error('Automation dynamic metadata not available')
  }

  const resolvedActiveUiDropdown =
    commonForm.state.activeTxUiDropdown || automation.resolved.activeUiDropdown

  const formatted = {
    totalCost: txDetails?.txCost ? formatUsdValue(txDetails.txCost) : '-',
    liquidationPrice: `${formatCryptoBalance(castedPosition.liquidationPrice)} ${priceFormat}`,
    stopLossLevel: automation?.triggers.stopLoss?.decodedMappedParams?.executionLtv
      ? formatDecimalAsPercent(automation.triggers.stopLoss.decodedMappedParams.executionLtv)
      : '-',
  }

  const items = {
    [AutomationFeatures.STOP_LOSS]: [
      {
        label: t('cancel-stoploss.liquidation'),
        value: formatted.liquidationPrice,
      },
      {
        label: t('position-history.sl-level'),
        value: formatted.stopLossLevel,
        change: 'n/a',
      },
    ],
    [AutomationFeatures.TRAILING_STOP_LOSS]: [],
    [AutomationFeatures.AUTO_SELL]: [],
    [AutomationFeatures.AUTO_BUY]: [],
    [AutomationFeatures.PARTIAL_TAKE_PROFIT]: [],
    [AutomationFeatures.CONSTANT_MULTIPLE]: [],
    [AutomationFeatures.AUTO_TAKE_PROFIT]: [],
  }[resolvedActiveUiDropdown]

  const notice = {
    [AutomationFeatures.STOP_LOSS]: (
      <OmniAutomationCancelNotice
        content={t('protection.cancel-notice', { ratioParam: t('system.loan-to-value') })}
      />
    ),
    [AutomationFeatures.TRAILING_STOP_LOSS]: (
      <OmniAutomationCancelNotice
        content={t('protection.cancel-notice', { ratioParam: t('system.loan-to-value') })}
      />
    ),
    [AutomationFeatures.AUTO_SELL]: null,
    [AutomationFeatures.AUTO_BUY]: null,
    [AutomationFeatures.PARTIAL_TAKE_PROFIT]: (
      <OmniAutomationCancelNotice content={t('protection.take-profit-cancel-notice')} />
    ),
    [AutomationFeatures.CONSTANT_MULTIPLE]: null,
    [AutomationFeatures.AUTO_TAKE_PROFIT]: null,
  }[resolvedActiveUiDropdown]

  const isLoading = !isTxSuccess && isSimulationLoading

  if (isTxInProgress) {
    return (
      <>
        <AddingStopLossAnimation />
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('automation-creation.remove-content', {
            featureName: t(sidebarAutomationFeatureCopyMap[resolvedActiveUiDropdown]),
          })}
        </Text>
      </>
    )
  }

  if (isTxSuccess) {
    return (
      <>
        <Box>
          <Flex sx={{ justifyContent: 'center', mb: 4 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
          </Flex>
        </Box>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('automation-creation.remove-complete-content', {
            featureName: t(sidebarAutomationFeatureCopyMap[resolvedActiveUiDropdown]),
          })}
        </Text>
        <Box mt={3}>
          <InfoSection
            title={t('vault-changes.order-information')}
            items={[
              {
                label: t('system.total-cost'),
                value: formatted.totalCost,
                isLoading,
              },
            ]}
          />
        </Box>
        <Box>
          <VaultChangesWithADelayCard />
        </Box>
      </>
    )
  }

  return (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.cancel-summary-description', {
          feature: t(sidebarAutomationFeatureCopyMap[resolvedActiveUiDropdown]),
        })}
      </Text>
      {children}
      <InfoSection
        title={t('vault-changes.order-information')}
        items={[
          ...items,
          {
            label: t('max-gas-fee'),
            value: <OmniGasEstimation />,
            isLoading,
          },
        ]}
      />
      {notice}
    </Grid>
  )
}
