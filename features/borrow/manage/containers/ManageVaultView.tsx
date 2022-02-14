import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { DefaultVaultHeaderProps } from 'components/vault/DefaultVaultHeader'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { ManageVaultState } from '../pipes/manageVault'
import { createManageVaultAnalytics$ } from '../pipes/manageVaultAnalytics'

export interface ManageVaultContainerProps {
  manageVault: ManageVaultState
  vaultHistory: VaultHistoryEvent[]
}

interface ManageVaultContainerComponents {
  header: (props: DefaultVaultHeaderProps) => JSX.Element
  details: (props: ManageVaultState) => JSX.Element
  form: (props: ManageVaultState) => JSX.Element
  history: (props: Pick<ManageVaultContainerProps, 'vaultHistory'>) => JSX.Element
}

export function ManageVaultContainer({
  manageVault,
  vaultHistory,
  header: Header,
  details: Details,
  form: Form,
  history: History,
}: ManageVaultContainerProps & ManageVaultContainerComponents) {
  const { manageVault$, context$ } = useAppContext()
  const {
    vault: { id, ilk },
    clear,
    ilkData
  } = manageVault
  const { t } = useTranslation()

  useEffect(() => {
    const subscription = createManageVaultAnalytics$(
      manageVault$(id),
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      <Header header={t('vault.header', { ilk, id })} id={id} ilkData={ilkData} />
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <Details {...manageVault} />
          <History vaultHistory={vaultHistory} />
        </Grid>
        <Box>
          <Form {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
