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
import { OpenVaultForm } from './OpenVaultForm'

import { CardCollateralizationRatio } from './details/CardCollateralizationRatio'
import { CardCollateralLocked } from './details/CardCollateralLocked'
import { CardCurrentPrice } from './details/CardCurrentPrice'
import { CardLiquidationPrice } from './details/CardLiquidationPrice'
import { OpenVaultDetailsSummary } from './details/Summary'

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
    <Container variant="vaultPageContainer">
      <Header />
      <Grid variant="vaultContainer">
        <Box>
          <Grid variant="vaultDetailsCardsContainer">
            <CardLiquidationPrice />
            <CardCollateralizationRatio />
            <CardCurrentPrice />
            <CardCollateralLocked />
          </Grid>
          <OpenVaultDetailsSummary />
        </Box>
        <Box>
          <OpenVaultForm />
        </Box>
      </Grid>
    </Container>
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
          <OpenBorrowVaultContext.Provider value={openVault}>
            <OpenVaultContainer />
          </OpenBorrowVaultContext.Provider>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
