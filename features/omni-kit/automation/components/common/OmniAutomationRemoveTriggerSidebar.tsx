import type { LendingPosition } from '@oasisdex/dma-library'
import { InfoSection } from 'components/infoSection/InfoSection'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import { AutomationFeatures } from 'features/automation/common/types'
import { OmniAutomationCancelNotice } from 'features/omni-kit/automation/components/common/OmniAutomationCancelNotice'
import { OmniGasEstimation } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { formatCryptoBalance, formatUsdValue } from 'helpers/formatters/format'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export const OmniAutomationRemoveTriggerSidebar: FC = ({ children }) => {
  const { t } = useTranslation()
  const {
    environment: { productType, priceFormat },
    tx: { isTxSuccess, txDetails },
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

  const [hash] = useHash()

  const activeUiDropdown =
    hash === 'protection'
      ? commonForm.state.uiDropdownProtection
      : commonForm.state.uiDropdownOptimization

  if (!activeUiDropdown) {
    return null
  }

  const formatted = {
    totalCost: txDetails?.txCost ? formatUsdValue(txDetails.txCost) : '-',
    liquidationPrice: `${formatCryptoBalance(castedPosition.liquidationPrice)} ${priceFormat}`,
  }

  const items = {
    [AutomationFeatures.STOP_LOSS]: [
      {
        label: t('cancel-stoploss.liquidation'),
        value: formatted.liquidationPrice,
      },
      {
        label: t('position-history.sl-level'),
        value: automation?.triggers.stopLoss?.decodedParams.executionLtv,
        change: 'n/a',
      },
    ],
    [AutomationFeatures.TRAILING_STOP_LOSS]: [],
    [AutomationFeatures.AUTO_SELL]: [],
    [AutomationFeatures.AUTO_BUY]: [],
    [AutomationFeatures.PARTIAL_TAKE_PROFIT]: [],
    [AutomationFeatures.CONSTANT_MULTIPLE]: [],
    [AutomationFeatures.AUTO_TAKE_PROFIT]: [],
  }[activeUiDropdown]

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
  }[activeUiDropdown]

  const isLoading = !isTxSuccess && isSimulationLoading

  return (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.cancel-summary-description', {
          feature: t(sidebarAutomationFeatureCopyMap[activeUiDropdown]),
        })}
      </Text>
      {children}
      <InfoSection
        title={t('vault-changes.order-information')}
        items={[
          ...(isTxSuccess
            ? [
                {
                  label: t('system.total-cost'),
                  value: formatted.totalCost,
                  isLoading,
                },
              ]
            : [
                ...items,
                {
                  label: t('max-gas-fee'),
                  value: <OmniGasEstimation />,
                  isLoading,
                },
              ]),
        ]}
      />
      {notice}
    </Grid>
  )
}
