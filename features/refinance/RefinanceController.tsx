import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import React from 'react'

import { useSdkSimulation } from './simulations/useSdkSimulation'

export function RefinanceController() {
  const { error, user, chain, sourcePosition, liquidationPrice } = useSdkSimulation()

  return (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    <WithErrorHandler error={[error!]}>
      <WithLoadingIndicator
        value={[user, chain, sourcePosition, liquidationPrice]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_user, _chain, _sourcePosition, _liquidationPrice]) => (
          <div>
            {/* // TODO: Use Step Manager here */}
            {_user?.wallet.address} : {_chain?.chainInfo.name} : {_sourcePosition?.positionId} :{' '}
            {_liquidationPrice} :{' '}
          </div>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
