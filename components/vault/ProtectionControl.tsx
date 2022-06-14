import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { extractStopLossData } from 'features/automation/protection/common/StopLossTriggerDataExtractor'
import { ProtectionDetailsControl } from 'features/automation/protection/controls/ProtectionDetailsControl'
import { ProtectionFormControl } from 'features/automation/protection/controls/ProtectionFormControl'
import { VaultBanner } from 'features/banners/VaultsBannersView'
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
    <VaultBanner
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
      color="primary"
    />
  )
}

interface ProtectionControlProps {
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  account?: string
  collateralizationRatioAtNextPrice: BigNumber
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
        header: 'Unable to access stop loss',
        description: 'Please try again later',
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
  account,
  collateralizationRatioAtNextPrice,
  balanceInfo,
}: ProtectionControlProps) {
  const { automationTriggersData$, priceInfo$ } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(vault.id)
  const [automationTriggersData, automationTriggersError] = useObservable(autoTriggersData$)
  const priceInfoObs$ = useMemo(() => priceInfo$(vault.token), [vault.token])
  const [priceInfoData, priceInfoError] = useObservable(priceInfoObs$)
  const dustLimit = ilkData.debtFloor
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')

  const stopLossData = automationTriggersData
    ? extractStopLossData(automationTriggersData)
    : undefined
  const vaultHasActiveTrigger = stopLossData?.isStopLossEnabled

  return vaultHasActiveTrigger ||
    (!vault.debt.isZero() &&
      vault.debt.gt(dustLimit) &&
      (vaultHasActiveTrigger || stopLossWriteEnabled)) ? (
    <WithErrorHandler error={[automationTriggersError, priceInfoError]}>
      <WithLoadingIndicator
        value={[automationTriggersData, priceInfoData]}
        customLoader={<VaultContainerSpinner />}
      >
        {([automationTriggers, priceInfo]) => {
          return (
            <DefaultVaultLayout
              detailsViewControl={
                <ProtectionDetailsControl
                  vault={vault}
                  automationTriggersData={automationTriggers}
                  priceInfo={priceInfo}
                  ilkData={ilkData}
                />
              }
              editForm={
                <ProtectionFormControl
                  ilkData={ilkData}
                  automationTriggersData={automationTriggers}
                  priceInfo={priceInfo}
                  vault={vault}
                  account={account}
                  collateralizationRatioAtNextPrice={collateralizationRatioAtNextPrice}
                  balanceInfo={balanceInfo}
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
