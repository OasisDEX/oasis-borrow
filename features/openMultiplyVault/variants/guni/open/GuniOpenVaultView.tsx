import { useAppContext } from 'components/AppContextProvider'
import React, { useEffect } from 'react'
import { Container } from 'theme-ui'

import { trackingEvents } from '../../../../../analytics/analytics'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../../../helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from '../../../../../helpers/observableHook'
import { createOpenMultiplyVaultAnalytics$ } from '../../../openMultiplyVaultAnalytics'
import { GuniOpenMultiplyVaultContainer } from './GuniOpenMultiplyVaultContainer'

export function GuniOpenVaultView({
  ilk,
}: {
  ilk: string
}) {
  const { openGuniVault$, accountData$, context$ } = useAppContext()
  // const multiplyVaultWithIlk$ = openGuniVault$(ilk)

  const openVaultWithError = useObservableWithError(openGuniVault$(ilk))

  // useEffect(() => {
  //   const subscription = createOpenMultiplyVaultAnalytics$(
  //     accountData$,
  //     multiplyVaultWithIlk$,
  //     context$,
  //     trackingEvents,
  //   ).subscribe()
  //
  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [])

  return (
    <WithErrorHandler error={openVaultWithError.error}>
      <WithLoadingIndicator {...openVaultWithError} customLoader={<VaultContainerSpinner />}>
        {(openVault) => (
          <Container variant="vaultPageContainer">
            <GuniOpenMultiplyVaultContainer {...openVault} />
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
