import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import React from 'react'

import { useSdkSimulation } from './useSdkSimulation'

export function RefinanceController() {
  const { error, user, chain, simulation, sourcePosition, liquidationPrice } = useSdkSimulation()

  return (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    <WithErrorHandler error={[error!]}>
      <WithLoadingIndicator
        value={[user, chain, sourcePosition, simulation, liquidationPrice]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_user, _chain, _sourcePosition, _simulation, _liquidationPrice]) => (
          <div>
            {/* // TODO: Use Step Manager here */}
            {_user?.wallet.address} : {_chain?.chainInfo.name} : {_sourcePosition?.positionId} :{' '}
            {_simulation?.targetPosition.positionId} : {_liquidationPrice} :{' '}
          </div>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
