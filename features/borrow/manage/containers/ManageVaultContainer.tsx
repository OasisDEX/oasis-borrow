import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { VaultChangesInformationEstimatedGasFee } from 'components/vault/VaultChangesInformation'
import { VaultViewMode } from 'components/VaultTabSwitch'
import { TAB_CHANGE_SUBJECT } from 'features/automation/common/UITypes/TabChange'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { ManageStandardBorrowVaultState } from '../pipes/manageVault'
import { createManageVaultAnalytics$ } from '../pipes/manageVaultAnalytics'
import { ManageVaultDetails } from './ManageVaultDetails'
import { ManageVaultForm } from './ManageVaultForm'

export function ManageVaultContainer({
  manageVault,
}: {
  manageVault: ManageStandardBorrowVaultState
}) {
  const { manageVault$, context$, uiChanges } = useAppContext()
  const {
    vault: { id, ilk, token },
    clear,
    ilkData,
    priceInfo,
  } = manageVault
  const { t } = useTranslation()
  const automationEnabled = useFeatureToggle('Automation')

  useEffect(() => {
    const subscription = createManageVaultAnalytics$(
      manageVault$(id),
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      !automationEnabled && clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {!automationEnabled && (
        <DefaultVaultHeader
          header={t('vault.header', { ilk, id })}
          id={id}
          ilkData={ilkData}
          token={token}
          priceInfo={priceInfo}
        />
      )}
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <DetailsSection
            title="Overview"
            badge={true}
            buttons={[
              {
                label: 'Close Vault',
                action: () => {
                  alert('Clicked "Close Vault" button!')
                },
              },
              {
                label: 'Edit Position',
                actions: [
                  {
                    label: 'Edit DAI',
                    action: () => {
                      alert('Clicked "Edit DAI" option!')
                    },
                  },
                  {
                    label: 'Edit Collateral',
                    action: () => {
                      alert('Clicked "Edit Collateral" option!')
                    },
                  },
                ],
              },
            ]}
            content={
              <DetailsSectionContentCardWrapper>
                <DetailsSectionContentCard
                  title="Liquidation Price"
                  value="$1,320.2000"
                  footnote="22.34% below current price"
                  modal="Content in modal, please fill me somewhere later..."
                />
                <DetailsSectionContentCard
                  title="Collateral Ratio"
                  value="220.40%"
                  footnote="219.10% on next price"
                  modal="Content in modal, please fill me somewhere later..."
                />
                <DetailsSectionContentCard
                  title="Collateral Locked"
                  value="420,000.20"
                  unit="DAI"
                  change={{ value: '424,602.40 DAI after', variant: 'positive' }}
                  footnote="300.30 ETH"
                  modal="Content in modal, please fill me somewhere later..."
                />
                <DetailsSectionContentCard
                  title="Title"
                  link={{
                    label: 'Enable now',
                    action: () => {
                      alert('Clicked "Enable now" link!')
                    },
                  }}
                  modal="Content in modal, please fill me somewhere later..."
                />
              </DetailsSectionContentCardWrapper>
            }
            footer={
              <DetailsSectionFooterItemWrapper>
                <DetailsSectionFooterItem title="Vault DAI Debt" value="103,203.20 DAI" />
                <DetailsSectionFooterItem title="Available to Withdraw" value="44.00 ETH" />
                <DetailsSectionFooterItem title="Available to Generate" value="440.40 ETH" />
                <DetailsSectionFooterItem title="Days Open" value="1130" />
              </DetailsSectionFooterItemWrapper>
            }
          />
          <ManageVaultDetails
            {...manageVault}
            onBannerButtonClickHandler={() => {
              uiChanges.publish(TAB_CHANGE_SUBJECT, {
                type: 'change-tab',
                currentMode: VaultViewMode.Protection,
              })
            }}
          />
          {!automationEnabled && <VaultHistoryView vaultHistory={manageVault.vaultHistory} />}
        </Grid>
        <Box>
          <ManageVaultForm
            {...manageVault}
            txnCostDisplay={<VaultChangesInformationEstimatedGasFee {...manageVault} />}
          />
        </Box>
      </Grid>
    </>
  )
}
