import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
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
            title="Title"
            badge={true}
            buttons={[
              {
                label: 'Button',
                action: () => {
                  alert('Button')
                },
              },
              {
                label: 'Expandable',
                actions: [
                  {
                    label: 'First item',
                    action: () => {
                      alert('First item')
                    },
                  },
                  {
                    label: 'Second item with a little bit longer text',
                    action: () => {
                      alert('Second item')
                    },
                  },
                  {
                    label: 'Third item',
                    action: () => {
                      alert('Third item')
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
                  modal="Lorem ipsum modal"
                />
                <DetailsSectionContentCard
                  title="Collateral Ratio"
                  footnote="219.10% on next price"
                />
                <DetailsSectionContentCard
                  title="Collateral Locked"
                  value="$420,000.20"
                  unit="DAI"
                  change={{ value: '$420,103.90 After', variant: 'positive' }}
                  footnote="300.30 ETH"
                  modal="Lorem ipsum modal"
                />
                <DetailsSectionContentCard
                  title="Collateral Locked"
                  value="$420,000.20"
                  unit="DAI"
                  change={{ value: '$1,200 After', variant: 'negative' }}
                  footnote="300.30 ETH"
                  modal={<p>Lorem ipsum modal</p>}
                />
              </DetailsSectionContentCardWrapper>
            }
            footer="Lorem"
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
