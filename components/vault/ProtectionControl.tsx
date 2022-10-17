import { Icon } from '@makerdao/dai-ui-icons'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { ProtectionDetailsControl } from 'features/automation/protection/common/controls/ProtectionDetailsControl'
import { ProtectionFormControl } from 'features/automation/protection/common/controls/ProtectionFormControl'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultNotice } from 'features/notices/VaultsNoticesView'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Container } from 'theme-ui'

import { useAppContext } from '../AppContextProvider'
import { AppLink } from '../Links'
import { DefaultVaultLayout } from './DefaultVaultLayout'

interface ZeroDebtProtectionBannerProps {
  useTranslationKeys?: boolean
  header: string
  description: string
  showLink?: boolean
}

function ZeroDebtProtectionBanner({
  useTranslationKeys = true,
  header,
  description,
  showLink = true,
}: ZeroDebtProtectionBannerProps) {
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
              <AppLink href="https://kb.oasis.app/help/stop-loss-protection" sx={{ fontSize: 3 }}>
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

interface ProtectionControlProps {
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  vaultType: VaultType
}

function getZeroDebtProtectionBannerProps({
  stopLossWriteEnabled,
  isVaultDebtZero,
  isVaultDebtBelowDustLumit,
  vaultHasNoProtection,
}: {
  stopLossWriteEnabled: boolean
  isVaultDebtZero: boolean
  isVaultDebtBelowDustLumit: boolean
  vaultHasNoProtection?: boolean
}): ZeroDebtProtectionBannerProps {
  if (stopLossWriteEnabled) {
    if (isVaultDebtZero && vaultHasNoProtection) {
      return {
        header: 'protection.zero-debt-heading',
        description: 'protection.zero-debt-description',
      }
    } else if (isVaultDebtBelowDustLumit) {
      return {
        header: 'protection.below-dust-limit-heading',
        description: 'protection.zero-debt-description',
      }
    } else
      return {
        header: 'protection.unable-to-access-protection',
        description: 'please-try-again-later',
        showLink: false,
      }
  } else {
    return {
      useTranslationKeys: false,
      showLink: false,
      header: 'Creation of the new stop loss trigger is currently disabled.',
      description:
        "To protect our users, due to extreme adversarial market conditions we have currently disabled setting up NEW stop loss triggers, as they might not result in the expected outcome. Please use the 'close vault' option if you want to close your vault right now.",
    }
  }
}

export function ProtectionControl({
  vault,
  ilkData,
  balanceInfo,
  vaultType,
}: ProtectionControlProps) {
  const { priceInfo$, context$, txHelpers$, tokenPriceUSD$ } = useAppContext()
  const { stopLossTriggerData, autoSellTriggerData } = useAutomationContext()

  const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$(['ETH', vault.token]), [vault.token])
  const [ethAndTokenPricesData, ethAndTokenPricesError] = useObservable(_tokenPriceUSD$)
  const [txHelpersData, txHelpersError] = useObservable(txHelpers$)
  const [contextData, contextError] = useObservable(context$)
  const priceInfoObs$ = useMemo(() => priceInfo$(vault.token), [vault.token])
  const [priceInfoData, priceInfoError] = useObservable(priceInfoObs$)
  const dustLimit = ilkData.debtFloor
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')

  const vaultHasActiveTrigger =
    stopLossTriggerData.isStopLossEnabled || autoSellTriggerData.isTriggerEnabled

  return vaultHasActiveTrigger ||
    (!vault.debt.isZero() &&
      vault.debt.gt(dustLimit) &&
      (vaultHasActiveTrigger || stopLossWriteEnabled)) ? (
    <WithErrorHandler
      error={[priceInfoError, txHelpersError, contextError, ethAndTokenPricesError]}
    >
      <WithLoadingIndicator
        value={[priceInfoData, contextData, ethAndTokenPricesData]}
        customLoader={<VaultContainerSpinner />}
      >
        {([priceInfo, context, ethAndTokenPrices]) => {
          return (
            <DefaultVaultLayout
              detailsViewControl={<ProtectionDetailsControl vault={vault} ilkData={ilkData} />}
              editForm={
                <ProtectionFormControl
                  ilkData={ilkData}
                  priceInfo={priceInfo}
                  vault={vault}
                  balanceInfo={balanceInfo}
                  txHelpers={txHelpersData}
                  context={context}
                  ethMarketPrice={ethAndTokenPrices['ETH']}
                  vaultType={vaultType}
                />
              }
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  ) : (
    <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
      <ZeroDebtProtectionBanner
        {...getZeroDebtProtectionBannerProps({
          stopLossWriteEnabled,
          isVaultDebtZero: vault.debt.isZero(),
          isVaultDebtBelowDustLumit: vault.debt <= dustLimit,
          vaultHasNoProtection: !vaultHasActiveTrigger,
        })}
      />
    </Container>
  )
}
