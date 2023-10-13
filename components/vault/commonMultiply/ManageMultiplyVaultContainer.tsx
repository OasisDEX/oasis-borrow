import { trackingEvents } from 'analytics/trackingEvents'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { createManageMultiplyVaultAnalytics$ } from 'features/multiply/manage/pipes/manageMultiplyVaultAnalytics'
import { uiChanges } from 'helpers/uiChanges'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import { useAppConfig } from 'helpers/config'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import type { Observable } from 'rxjs'
import { Box, Grid } from 'theme-ui'

import type {
  ManageMultiplyVaultContainerComponents,
  ManageMultiplyVaultContainerProps,
} from './ManageMultiplyVaultContainer.types'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange.constants'
import { VaultViewMode } from '../GeneralManageTabBar.types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { ManageVaultDetails } from 'features/borrow/manage/containers/ManageVaultDetails'

export function ManageMultiplyVaultContainer({
  manageVault,
  header: Header,
  details: Details,
  form: Form,
  history: History,
}: ManageMultiplyVaultContainerProps & ManageMultiplyVaultContainerComponents) {
  const { context$ } = useMainContext()
  const { manageMultiplyVault$, manageGuniVault$ } = useProductContext()
  const {
    vault: { id, ilk },
    clear,
    ilkData,
  } = manageVault
  const { t } = useTranslation()
  const { StopLossRead: stopLossReadEnabled } = useAppConfig('features')

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
      {/* TODO: propably here */}
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
