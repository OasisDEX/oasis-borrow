import React, { useEffect } from 'react'
import { Observable } from 'rxjs'
import { Box, Grid } from 'theme-ui'

import { trackingEvents } from '../../../analytics/analytics'
import { ManageMultiplyVaultState } from '../../../features/multiply/manage/pipes/manageMultiplyVault'
import { createManageMultiplyVaultAnalytics$ } from '../../../features/multiply/manage/pipes/manageMultiplyVaultAnalytics'
import { useAppContext } from '../../AppContextProvider'

export interface ManageMultiplyVaultContainerProps {
  manageVault: ManageMultiplyVaultState
}

interface ManageMultiplyVaultContainerComponents {
  details: (props: ManageMultiplyVaultState) => JSX.Element
  form: (props: ManageMultiplyVaultState) => JSX.Element
}

export function ManageMultiplyVaultContainer({
  manageVault,
  details: Details,
  form: Form,
}: ManageMultiplyVaultContainerProps & ManageMultiplyVaultContainerComponents) {
  const { manageMultiplyVault$, context$, manageGuniVault$ } = useAppContext()
  const {
    vault: { id },
  } = manageVault

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
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <Details {...manageVault} />
        </Grid>
        <Box>
          <Form {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
