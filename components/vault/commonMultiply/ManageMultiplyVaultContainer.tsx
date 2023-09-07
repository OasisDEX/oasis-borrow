import { trackingEvents } from 'analytics/analytics'
import { useMainContext, useProductContext } from 'components/context'
import { DefaultVaultHeaderProps } from 'components/vault/DefaultVaultHeader'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { ManageVaultDetails } from 'features/borrow/manage/containers/ManageVaultDetails'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange'
import { VaultType } from 'features/generalManageVault/vaultType'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { createManageMultiplyVaultAnalytics$ } from 'features/multiply/manage/pipes/manageMultiplyVaultAnalytics'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { uiChanges } from 'helpers/uiChanges'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Observable } from 'rxjs'
import { Box, Grid } from 'theme-ui'

export interface ManageMultiplyVaultContainerProps {
  manageVault: ManageMultiplyVaultState
  header: (props: DefaultVaultHeaderProps) => JSX.Element
  details: (props: ManageMultiplyVaultState) => JSX.Element
  form: (props: ManageMultiplyVaultState) => JSX.Element
  history: (props: { vaultHistory: VaultHistoryEvent[] }) => JSX.Element
}

export function ManageMultiplyVaultContainer({
  manageVault,
  header: Header,
  details: Details,
  form: Form,
  history: History,
}: ManageMultiplyVaultContainerProps) {
  const { context$ } = useMainContext()
  const { manageMultiplyVault$, manageGuniVault$ } = useProductContext()
  const {
    vault: { id, ilk },
    clear,
    ilkData,
  } = manageVault
  const { t } = useTranslation()
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')

  useEffect(() => {
    const { token } = manageVault.vault

    const manageVaultMap: Record<string, Observable<ManageMultiplyVaultState>> = {
      GUNIV3DAIUSDC1: manageGuniVault$(id),
      GUNIV3DAIUSDC2: manageGuniVault$(id),
    }
    const subscription = createManageMultiplyVaultAnalytics$(
      manageVaultMap[token]
        ? manageVaultMap[token]
        : manageMultiplyVault$(id, manageVault.vaultType),
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      !stopLossReadEnabled && clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {!stopLossReadEnabled && (
        <Header
          header={t('vault.header', { ilk, id })}
          id={id}
          ilkData={ilkData}
          token={manageVault.vault.token}
          priceInfo={manageVault.priceInfo}
        />
      )}
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          {}
          {manageVault.vaultType === VaultType.Multiply ? (
            <Details {...manageVault} />
          ) : (
            <ManageVaultDetails
              {...manageVault}
              onBannerButtonClickHandler={() => {
                uiChanges.publish(TAB_CHANGE_SUBJECT, {
                  type: 'change-tab',
                  currentMode: VaultViewMode.Protection,
                })
              }}
            />
          )}
          {!stopLossReadEnabled && <History vaultHistory={manageVault.vaultHistory} />}
        </Grid>
        <Box>
          <Form {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
