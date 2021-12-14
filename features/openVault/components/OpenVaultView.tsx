import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import React, { useEffect } from 'react'
import { Box, Container, Grid } from 'theme-ui'

import { OpenVaultState } from '../openVault'
import { createOpenVaultAnalytics$ } from '../openVaultAnalytics'
import { Header } from './Header'
import { OpenVaultDetails } from './OpenVaultDetails'
import { OpenVaultForm } from './OpenVaultForm'

export function OpenVaultContainer() {
  const { clear } = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    clear: ctx.clear,
  }))

  useEffect(() => {
    return () => {
      clear()
    }
  }, [])

  return (
    <>
      <Header />
      <Grid variant="vaultContainer">
        <Box>
          <OpenVaultDetails />
        </Box>
        <Box>
          <OpenVaultForm />
        </Box>
      </Grid>
    </>
  )
}

export const OpenBorrowVaultContext = React.createContext<OpenVaultState | undefined>(undefined)

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { openVault$, accountData$, context$ } = useAppContext()
  const openVaultWithIlk$ = openVault$(ilk)
  const openVaultWithError = useObservableWithError(openVaultWithIlk$)

  useEffect(() => {
    const subscription = createOpenVaultAnalytics$(
      accountData$,
      openVaultWithIlk$,
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <WithErrorHandler error={openVaultWithError.error}>
      <WithLoadingIndicator value={openVaultWithError.value}>
        {(openVault) => (
          <Container variant="vaultPageContainer">
            <OpenBorrowVaultContext.Provider value={openVault}>
              <OpenVaultContainer />
            </OpenBorrowVaultContext.Provider>
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
