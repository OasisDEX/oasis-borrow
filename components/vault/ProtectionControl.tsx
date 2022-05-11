import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
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
  headerTranslationKey: string
  descriptionTranslationKey: string
}

function ZeroDebtProtectionBanner({
  headerTranslationKey,
  descriptionTranslationKey,
}: ZeroDebtProtectionBannerProps) {
  const { t } = useTranslation()

  return (
    <VaultBanner
      status={<Icon size="34px" name="warning" />}
      withClose={false}
      header={t(headerTranslationKey)}
      subheader={
        <>
          {t(descriptionTranslationKey)}
          {', '}
          <AppLink href="https://kb.oasis.app/help/stop-loss-protection" sx={{ fontSize: 3 }}>
            {t('here')}.
          </AppLink>
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

  return !vault.debt.isZero() && vault.debt > dustLimit ? (
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
  ) : vault.debt.isZero() ? (
    <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
      <ZeroDebtProtectionBanner
        headerTranslationKey={'zero-debt-heading'}
        descriptionTranslationKey={'zero-debt-description'}
      />
    </Container>
  ) : (
    <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
      <ZeroDebtProtectionBanner
        headerTranslationKey={'below-dust-limit-heading'}
        descriptionTranslationKey={'zero-debt-description'}
      />
    </Container>
  )
}
