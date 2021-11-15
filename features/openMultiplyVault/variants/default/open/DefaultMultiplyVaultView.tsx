import { useAppContext } from 'components/AppContextProvider'
import React, { useEffect } from 'react'
import { Container } from 'theme-ui'

import { trackingEvents } from '../../../../../analytics/analytics'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../../../helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from '../../../../../helpers/observableHook'
import { createOpenMultiplyVaultAnalytics$ } from '../../../openMultiplyVaultAnalytics'
import { DefaultOpenMultiplyVaultContainer } from './DefaultOpenMultiplyVaultContainer'

export function DefaultMultiplyVaultView({ ilk }: { ilk: string }) {
  const { openMultiplyVault$, accountData$, context$ } = useAppContext()
  const multiplyVaultWithIlk$ = openMultiplyVault$(ilk)

  const openVaultWithError = useObservableWithError(openMultiplyVault$(ilk))

  useEffect(() => {
    const subscription = createOpenMultiplyVaultAnalytics$(
      accountData$,
      multiplyVaultWithIlk$,
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <WithErrorHandler error={openVaultWithError.error}>
      <WithLoadingIndicator {...openVaultWithError} customLoader={<VaultContainerSpinner />}>
        {(openVault) => (
          <Container variant="vaultPageContainer">
            <DefaultOpenMultiplyVaultContainer {...openVault} />
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
