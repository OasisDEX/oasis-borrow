import { useAppContext } from 'components/AppContextProvider'
import React, { useEffect } from 'react'
import { Container } from 'theme-ui'

import { trackingEvents } from '../../../analytics/analytics'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from '../../../helpers/observableHook'
import { OpenMultiplyVaultState } from '../openMultiplyVault'
import { createOpenMultiplyVaultAnalytics$ } from '../openMultiplyVaultAnalytics'

export function OpenMultiplyVaultView({
  ilk,
  render,
}: {
  ilk: string
  render: (props: OpenMultiplyVaultState) => JSX.Element
}) {
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
            {render(openVault)}
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
