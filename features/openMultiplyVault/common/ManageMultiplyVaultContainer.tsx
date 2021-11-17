import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { trackingEvents } from '../../../analytics/analytics'
import { useAppContext } from '../../../components/AppContextProvider'
import { DefaultVaultHeaderProps } from '../../../components/vault/DefaultVaultHeader'
import { ManageMultiplyVaultState } from '../../manageMultiplyVault/manageMultiplyVault'
import { createManageMultiplyVaultAnalytics$ } from '../../manageMultiplyVault/manageMultiplyVaultAnalytics'
import { VaultHistoryEvent } from '../../vaultHistory/vaultHistory'

export interface ManageMultiplyVaultContainerProps {
  manageVault: ManageMultiplyVaultState
  vaultHistory: VaultHistoryEvent[]
}

interface ManageMultiplyVaultContainerComponents {
  header: (props: DefaultVaultHeaderProps) => JSX.Element
  details: (props: ManageMultiplyVaultState) => JSX.Element
  form: (props: ManageMultiplyVaultState) => JSX.Element
  history: (props: Pick<ManageMultiplyVaultContainerProps, 'vaultHistory'>) => JSX.Element
}

export function ManageMultiplyVaultContainer({
  manageVault,
  vaultHistory,
  header: Header,
  details: Details,
  form: Form,
  history: History,
}: ManageMultiplyVaultContainerProps & ManageMultiplyVaultContainerComponents) {
  const { manageMultiplyVault$, context$ } = useAppContext()
  const {
    vault: { id, ilk },
    clear,
    ilkData,
  } = manageVault
  const { t } = useTranslation()

  useEffect(() => {
    const subscription = createManageMultiplyVaultAnalytics$(
      manageMultiplyVault$(id),
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
