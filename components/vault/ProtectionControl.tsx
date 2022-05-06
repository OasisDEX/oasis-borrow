import { Icon } from '@makerdao/dai-ui-icons'
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

function ZeroDebtProtectionBanner() {
  const { t } = useTranslation()

  return (
    <VaultBanner
      status={<Icon size="34px" name="warning" />}
      withClose={false}
      header={t('protection.zero-debt-heading')}
      subheader={
        <>
          {t('protection.zero-debt-description')}
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
}

export function ProtectionControl({ vault, ilkData, account }: ProtectionControlProps) {
  const { automationTriggersData$, collateralPrices$ } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(vault.id)
  const [automationTriggersData, automationTriggersError] = useObservable(autoTriggersData$)
  const [collateralPrices, collateralPricesError] = useObservable(collateralPrices$)

  return !vault.debt.isZero() ? (
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
                />
              }
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  ) : (
    <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
      <ZeroDebtProtectionBanner />
    </Container>
  )
}
