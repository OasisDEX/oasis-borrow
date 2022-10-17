import { Icon } from '@makerdao/dai-ui-icons'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { AppLink } from 'components/Links'
import { OptimizationDetailsControl } from 'features/automation/optimization/common/controls/OptimizationDetailsControl'
import { OptimizationFormControl } from 'features/automation/optimization/common/controls/OptimizationFormControl'
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
  readOnlyAutoBSEnabled,
  constantMultipleReadOnlyEnabled,
  readOnlyAutoTakeProfitEnabled,
  isVaultDebtZero,
  vaultHasNoActiveBuyTrigger,
  vaultHasNoActiveConstantMultipleTriggers,
  vaultHasNoActiveAutoTakeProfitTrigger,
}: {
  readOnlyAutoBSEnabled: boolean
  constantMultipleReadOnlyEnabled: boolean
  readOnlyAutoTakeProfitEnabled: boolean
  isVaultDebtZero: boolean
  vaultHasNoActiveBuyTrigger?: boolean
  vaultHasNoActiveConstantMultipleTriggers?: boolean
  vaultHasNoActiveAutoTakeProfitTrigger?: boolean
}): ZeroDebtOptimizationBannerProps {
  if (
    !readOnlyAutoBSEnabled &&
    !constantMultipleReadOnlyEnabled &&
    !readOnlyAutoTakeProfitEnabled
  ) {
    if (
      isVaultDebtZero &&
      vaultHasNoActiveBuyTrigger &&
      vaultHasNoActiveConstantMultipleTriggers &&
      vaultHasNoActiveAutoTakeProfitTrigger
    ) {
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
  const { context$, txHelpers$, tokenPriceUSD$, priceInfo$ } = useAppContext()
  const priceInfoObs$ = useMemo(() => priceInfo$(vault.token), [vault.token])
  const [priceInfoData, priceInfoError] = useObservable(priceInfoObs$)
  const [txHelpersData, txHelpersError] = useObservable(txHelpers$)
  const [contextData, contextError] = useObservable(context$)
  const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$(['ETH', vault.token]), [vault.token])
  const [ethAndTokenPricesData, ethAndTokenPricesError] = useObservable(_tokenPriceUSD$)
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const constantMultipleReadOnlyEnabled = useFeatureToggle('ConstantMultipleReadOnly')
  const readOnlyAutoTakeProfitEnabled = useFeatureToggle('ReadOnlyAutoTakeProfit')
  const {
    autoBuyTriggerData,
    constantMultipleTriggerData,
    autoTakeProfitTriggerData,
  } = useAutomationContext()

  const vaultHasActiveAutoBuyTrigger = autoBuyTriggerData.isTriggerEnabled
  const vaultHasActiveConstantMultipleTrigger = constantMultipleTriggerData.isTriggerEnabled
  const vaultHasActiveAutoTakeProfitTrigger = autoTakeProfitTriggerData.isTriggerEnabled

  if (
    (!vaultHasActiveAutoBuyTrigger &&
      !vaultHasActiveConstantMultipleTrigger &&
      !vaultHasActiveAutoTakeProfitTrigger &&
      vault.debt.isZero()) ||
    (!vaultHasActiveAutoBuyTrigger &&
      !vaultHasActiveConstantMultipleTrigger &&
      !vaultHasActiveAutoTakeProfitTrigger &&
      readOnlyAutoBSEnabled &&
      constantMultipleReadOnlyEnabled &&
      readOnlyAutoTakeProfitEnabled)
  ) {
    return (
      <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
        <ZeroDebtOptimizationBanner
          {...getZeroDebtOptimizationBannerProps({
            readOnlyAutoBSEnabled,
            isVaultDebtZero: vault.debt.isZero(),
            vaultHasNoActiveBuyTrigger: !vaultHasActiveAutoBuyTrigger,
            constantMultipleReadOnlyEnabled,
            readOnlyAutoTakeProfitEnabled,
            vaultHasNoActiveConstantMultipleTriggers: !vaultHasActiveConstantMultipleTrigger,
            vaultHasNoActiveAutoTakeProfitTrigger: !vaultHasActiveAutoTakeProfitTrigger,
          })}
        />
      </Container>
    )
  }

  return (
    <WithErrorHandler
      error={[ethAndTokenPricesError, contextError, txHelpersError, priceInfoError]}
    >
      <WithLoadingIndicator
        value={[contextData, ethAndTokenPricesData, priceInfoData]}
        customLoader={<VaultContainerSpinner />}
      >
        {([context, ethAndTokenPrices, priceInfo]) => (
          <DefaultVaultLayout
            detailsViewControl={
              <OptimizationDetailsControl
                vault={vault}
                vaultType={vaultType}
                vaultHistory={vaultHistory}
                ethMarketPrice={ethAndTokenPrices['ETH']}
                tokenMarketPrice={ethAndTokenPrices[vault.token]}
              />
            }
            editForm={
              <OptimizationFormControl
                vault={vault}
                vaultType={vaultType}
                ilkData={ilkData}
                txHelpers={txHelpersData}
                context={context}
                balanceInfo={balanceInfo}
                ethMarketPrice={ethAndTokenPrices['ETH']}
                tokenMarketPrice={ethAndTokenPrices[vault.token]}
                priceInfo={priceInfo}
              />
            }
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
