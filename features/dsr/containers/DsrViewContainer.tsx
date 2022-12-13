import { useAppContext } from 'components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { Container } from 'theme-ui'

import { DsrView } from './DsrView'

export function DsrViewContainer({ walletAddress }: { walletAddress: string }) {
  const { dsrDeposit$, dsr$, context$ } = useAppContext()
  const resolvedDsrDeposit$ = dsrDeposit$(walletAddress)
  const resolvedDsr$ = dsr$(walletAddress)
  const [depositState, depositStateError] = useObservable(resolvedDsrDeposit$)
  const [context, contextError] = useObservable(context$)
  const [pots, potsError] = useObservable(resolvedDsr$)

  return (
    <Container variant="vaultPageContainer">
      <WithErrorHandler error={[depositStateError, potsError, contextError]}>
        <WithLoadingIndicator
          value={[depositState, pots, context]}
          customLoader={<VaultContainerSpinner />}
        >
          {([_depositState, _pots, _context]) => (
            <DsrView
              dsrOverview={_pots.pots.dsr}
              dsrDepositState={_depositState}
              walletAddress={walletAddress}
              context={_context}
            />
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Container>
  )
}
