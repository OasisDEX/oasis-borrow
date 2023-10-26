import { trackingEvents } from 'analytics/trackingEvents'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { createManageMultiplyVaultAnalytics$ } from 'features/multiply/manage/pipes/manageMultiplyVaultAnalytics'
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
      manageVaultMap[token] ? manageVaultMap[token] : manageMultiplyVault$(id),
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
          <Details {...manageVault} />
          {!stopLossReadEnabled && <History vaultHistory={manageVault.vaultHistory} />}
        </Grid>
        <Box>
          <Form {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
