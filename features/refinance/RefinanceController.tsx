import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import type { PropsWithChildren } from 'react'
import React from 'react'

import { useSdk } from './useSdk'
import { useSdkSimulation } from './useSdkSimulation'

export interface RefinanceControllerProps {
  chainId: number
  address: string
}

export function RefinanceController({
  chainId,
  address,
}: PropsWithChildren<RefinanceControllerProps>) {
  const { error: sdkError, sdk, user, chain } = useSdk(address, chainId)

  const { error: sdkSimulationError, simulation, position } = useSdkSimulation(sdk)

  return (
    <WithErrorHandler error={[sdkError, sdkSimulationError]}>
      <WithLoadingIndicator
        value={[user, chain, position, simulation]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_user, _chain, _position, _simulation]) => (
          <div>
            {/* // TODO: Use Step Manager here */}
            {_user?.wallet.address} : {_chain?.chainInfo.name} : {_position?.id} :{' '}
            {_simulation?.positionId}
          </div>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
