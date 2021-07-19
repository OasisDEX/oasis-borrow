import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { ManageMultiplyVaultContainer } from 'features/manageMultiplyVault/components/ManageMultiplyVaultView'
import { ManageVaultContainer } from 'features/manageVault/ManageVaultView'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import React from 'react'
import { Box, Grid } from 'theme-ui'
import { slideInAnimation } from 'theme/animations'

import { VaultType } from './generalManageVault'

export function GeneralManageVaultView({ id }: { id: BigNumber }) {
  const { generalManageVault$, vaultHistory$ } = useAppContext()
  const manageVaultWithId$ = generalManageVault$(id)
  const manageVaultWithError = useObservableWithError(manageVaultWithId$)
  const vaultHistoryWithError = useObservableWithError(vaultHistory$(id))

  // useEffect(() => {
  //   const subscription = createManageVaultAnalytics$(manageVaultWithId$, trackingEvents).subscribe()

  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [])

  return (
    <WithLoadingIndicator
      value={[manageVaultWithError.value, vaultHistoryWithError.value]}
      error={[manageVaultWithError.error, vaultHistoryWithError.error]}
      customLoader={
        <Box
          sx={{
            position: 'relative',
            height: 600,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <AppSpinner sx={{ mx: 'auto', display: 'block' }} variant="styles.spinner.extraLarge" />
        </Box>
      }
    >
      {([generalManageVault, vaultHistory]) => {
        switch (generalManageVault.type) {
          case VaultType.Borrow:
            return (
              <Grid sx={{ width: '100%', zIndex: 1, ...slideInAnimation, position: 'relative' }}>
                <ManageVaultContainer
                  vaultHistory={vaultHistory}
                  manageVault={generalManageVault.state}
                />
              </Grid>
            )
          case VaultType.Multiply:
            return (
              <Grid sx={{ width: '100%', zIndex: 1, ...slideInAnimation, position: 'relative' }}>
                <ManageMultiplyVaultContainer
                  vaultHistory={vaultHistory}
                  manageVault={generalManageVault.state}
                />
              </Grid>
            )
        }
      }}
    </WithLoadingIndicator>
  )
}
