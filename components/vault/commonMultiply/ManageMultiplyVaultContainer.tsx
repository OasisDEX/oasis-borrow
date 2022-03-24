import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Observable } from 'rxjs'
import { Box, Grid } from 'theme-ui'

import { trackingEvents } from '../../../analytics/analytics'
import { ManageMultiplyVaultState } from '../../../features/multiply/manage/pipes/manageMultiplyVault'
import { createManageMultiplyVaultAnalytics$ } from '../../../features/multiply/manage/pipes/manageMultiplyVaultAnalytics'
import { VaultHistoryEvent } from '../../../features/vaultHistory/vaultHistory'
import { useFeatureToggle } from '../../../helpers/useFeatureToggle'
import { useAppContext } from '../../AppContextProvider'
import { DefaultVaultHeaderProps } from '../DefaultVaultHeader'

export interface ManageMultiplyVaultContainerProps {
  manageVault: ManageMultiplyVaultState
}

interface ManageMultiplyVaultContainerComponents {
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
}: ManageMultiplyVaultContainerProps & ManageMultiplyVaultContainerComponents) {
  const { manageMultiplyVault$, context$, manageGuniVault$ } = useAppContext()
  const {
    vault: { id, ilk },
    clear,
    ilkData,
  } = manageVault
  const { t } = useTranslation()
  const automationEnabled = useFeatureToggle('Automation')

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
      !automationEnabled && clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {!automationEnabled && (
        <Header header={t('vault.header', { ilk, id })} id={id} ilkData={ilkData} />
      )}
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <Details {...manageVault} />
          {!automationEnabled && <History vaultHistory={manageVault.vaultHistory} />}
        </Grid>
        <Box>
          <Form {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
