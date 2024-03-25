import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import React from 'react'

import { refinanceContext } from './RefinanceContext'
import { useSdkSimulation } from './useSdkSimulation'

export function RefinanceController() {
  const context = React.useContext(refinanceContext)
  if (context === undefined) {
    throw new Error('RefinanceContextProvider is missing in the hierarchy')
  }

  // TODO: wallet not connected, add better handling
  if (context.address === undefined) {
    return null
  }

  const { error, user, chain, simulation, position, liquidationPrice } = useSdkSimulation(
    context,
    context.address,
  )

  return (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    <WithErrorHandler error={[error!]}>
      <WithLoadingIndicator
        value={[user, chain, position, simulation]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_user, _chain, _position, _simulation]) => (
          <div>
            {/* // TODO: Use Step Manager here */}
            {_user?.wallet.address} : {_chain?.chainInfo.name} : {_position?.positionId} :{' '}
            {_simulation?.targetPosition.positionId} : {liquidationPrice}
          </div>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
