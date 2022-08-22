import { Icon } from '@makerdao/dai-ui-icons'
import { TriggerType } from '@oasisdex/automation'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import { extractConstantMultipleData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { OptimizationDetailsControl } from 'features/automation/optimization/controls/OptimizationDetailsControl'
import { OptimizationFormControl } from 'features/automation/optimization/controls/OptimizationFormControl'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultNotice } from 'features/notices/VaultsNoticesView'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Container } from 'theme-ui'

import { DefaultVaultLayout } from './DefaultVaultLayout'

interface ZeroDebtOptimizationBannerProps {
  useTranslationKeys?: boolean
  header: string
  description: string
  showLink?: boolean
}

function ZeroDebtOptimizationBanner({
  useTranslationKeys = true,
  header,
  description,
  showLink = true,
}: ZeroDebtOptimizationBannerProps) {
  const { t } = useTranslation()

  return (
    <VaultNotice
      status={<Icon size="34px" name="warning" />}
      withClose={false}
      header={useTranslationKeys ? t(header) : header}
      subheader={
        <>
          {useTranslationKeys ? t(description) : description}
          {showLink && (
            <>
              {', '}
              <AppLink href="https://kb.oasis.app/help" sx={{ fontSize: 3 }}>
                {t('here')}.
              </AppLink>
            </>
          )}
        </>
      }
      color="primary100"
    />
  )
}
function getZeroDebtOptimizationBannerProps({
  readOnlyBasicBSEnabled,
  constantMultipleReadOnlyEnabled,
  isVaultDebtZero,
  vaultHasNoActiveBuyTrigger,
  vaultHasNoActiveConstantMultipleTriggers,
}: {
  readOnlyBasicBSEnabled: boolean
  constantMultipleReadOnlyEnabled: boolean
  isVaultDebtZero: boolean
  vaultHasNoActiveBuyTrigger?: boolean
  vaultHasNoActiveConstantMultipleTriggers?: boolean
}): ZeroDebtOptimizationBannerProps {
  if (!readOnlyBasicBSEnabled && !constantMultipleReadOnlyEnabled) {
    if (isVaultDebtZero && vaultHasNoActiveBuyTrigger && vaultHasNoActiveConstantMultipleTriggers) {
      return {
        header: 'optimization.zero-debt-heading',
        description: 'optimization.zero-debt-description',
      }
    } else
      return {
        header: 'optimization.unable-to-access-optimization',
        description: 'please-try-again-later',
        showLink: false,
      }
  } else {
    return {
      showLink: false,
      header: 'optimization.adding-new-triggers-disabled',
      description: 'optimization.adding-new-triggers-disabled-description',
    }
  }
}

interface OptimizationControlProps {
  vault: Vault
  vaultType: VaultType
  ilkData: IlkData
  balanceInfo: BalanceInfo
  vaultHistory: VaultHistoryEvent[]
}

export function OptimizationControl({
  vault,
  vaultType,
  ilkData,
  balanceInfo,
  vaultHistory,
}: OptimizationControlProps) {
  const { automationTriggersData$, context$, txHelpers$, tokenPriceUSD$ } = useAppContext()
  const [txHelpersData, txHelpersError] = useObservable(txHelpers$)
  const [contextData, contextError] = useObservable(context$)
  const autoTriggersData$ = automationTriggersData$(vault.id)
  const [automationTriggersData, automationTriggersError] = useObservable(autoTriggersData$)
  const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$(['ETH', vault.token]), [vault.token])
  const [ethAndTokenPricesData, ethAndTokenPricesError] = useObservable(_tokenPriceUSD$)
  const readOnlyBasicBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const constantMultipleReadOnlyEnabled = useFeatureToggle('ConstantMultipleReadOnly')

  const basicBuyData = automationTriggersData
    ? extractBasicBSData({
        triggersData: automationTriggersData,
        triggerType: TriggerType.BasicBuy,
      })
    : undefined
  const constantMultipleTriggerData = automationTriggersData
    ? extractConstantMultipleData(automationTriggersData)
    : undefined

  const vaultHasActiveAutoBuyTrigger = basicBuyData?.isTriggerEnabled
  const vaultHasActiveConstantMultipleTrigger = constantMultipleTriggerData?.isTriggerEnabled

  if (
    (!vaultHasActiveAutoBuyTrigger &&
      !vaultHasActiveConstantMultipleTrigger &&
      vault.debt.isZero()) ||
    (!vaultHasActiveAutoBuyTrigger &&
      !vaultHasActiveConstantMultipleTrigger &&
      readOnlyBasicBSEnabled &&
      constantMultipleReadOnlyEnabled)
  ) {
    return (
      <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
        <ZeroDebtOptimizationBanner
          {...getZeroDebtOptimizationBannerProps({
            readOnlyBasicBSEnabled,
            isVaultDebtZero: vault.debt.isZero(),
            vaultHasNoActiveBuyTrigger: !vaultHasActiveAutoBuyTrigger,
            constantMultipleReadOnlyEnabled,
            vaultHasNoActiveConstantMultipleTriggers: !vaultHasActiveConstantMultipleTrigger,
          })}
        />
      </Container>
    )
  }

  return (
    <WithErrorHandler
      error={[automationTriggersError, ethAndTokenPricesError, contextError, txHelpersError]}
    >
      <WithLoadingIndicator
        value={[automationTriggersData, contextData, ethAndTokenPricesData]}
        customLoader={<VaultContainerSpinner />}
      >
        {([automationTriggers, context, ethAndTokenPrices]) => (
          <DefaultVaultLayout
            detailsViewControl={
              <OptimizationDetailsControl
                vault={vault}
                vaultType={vaultType}
                vaultHistory={vaultHistory}
                automationTriggersData={automationTriggers}
                tokenMarketPrice={ethAndTokenPrices[vault.token]}
              />
            }
            editForm={
              <OptimizationFormControl
                vault={vault}
                automationTriggersData={automationTriggers}
                ilkData={ilkData}
                txHelpers={txHelpersData}
                context={context}
                balanceInfo={balanceInfo}
                ethMarketPrice={ethAndTokenPrices['ETH']}
              />
            }
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
