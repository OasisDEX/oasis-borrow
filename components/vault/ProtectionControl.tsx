import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Container } from 'theme-ui'

import { IlkData } from '../../blockchain/ilks'
import { Vault } from '../../blockchain/vaults'
import { ProtectionDetailsControl } from '../../features/automation/protection/controls/ProtectionDetailsControl'
import { ProtectionFormControl } from '../../features/automation/protection/controls/ProtectionFormControl'
import { VaultBanner } from '../../features/banners/VaultsBannersView'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../helpers/observableHook'
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
  account?: string
  collateralizationRatioAtNextPrice: BigNumber
}

function getZeroDebtProtectionBannerProps({
  stopLossWriteEnabled,
  isVaultDebtZero,
  isVaultDebtBelowDustLumit,
}: {
  stopLossWriteEnabled: boolean
  isVaultDebtZero: boolean
  isVaultDebtBelowDustLumit: boolean
}): ZeroDebtProtectionBannerProps {
  if (stopLossWriteEnabled) {
    if (isVaultDebtZero) {
      return {
        header: 'protection.zero-debt-heading',
        description: 'protection.zero-debt-description',
      }
    } else if (isVaultDebtBelowDustLumit) {
      return {
        header: 'protection.below-dust-limit',
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
}: ProtectionControlProps) {
  const { automationTriggersData$, collateralPrices$ } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(vault.id)
  const [automationTriggersData, automationTriggersError] = useObservable(autoTriggersData$)
  const [collateralPrices, collateralPricesError] = useObservable(collateralPrices$)
  const dustLimit = ilkData.debtFloor
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')

  return !vault.debt.isZero() &&
    vault.debt > dustLimit &&
    (automationTriggersData?.triggers?.length || stopLossWriteEnabled) ? (
    <WithErrorHandler error={[automationTriggersError, collateralPricesError]}>
      <WithLoadingIndicator
        value={[automationTriggersData, collateralPrices]}
        customLoader={<VaultContainerSpinner />}
      >
        {([automationTriggersData, collateralPrices]) => {
          return (
            <DefaultVaultLayout
              detailsViewControl={
                <ProtectionDetailsControl
                  vault={vault}
                  automationTriggersData={automationTriggersData}
                  collateralPrices={collateralPrices}
                  ilkData={ilkData}
                />
              }
              editForm={
                <ProtectionFormControl
                  ilkData={ilkData}
                  automationTriggersData={automationTriggersData}
                  collateralPrices={collateralPrices}
                  vault={vault}
                  account={account}
                  collateralizationRatioAtNextPrice={collateralizationRatioAtNextPrice}
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
        })}
      />
    </Container>
  )
}
