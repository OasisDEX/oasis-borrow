import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import type { PropsWithChildren } from 'react'
import React from 'react'

import { refinanceContext } from './RefinanceContext'
import { useSdk } from './useSdk'

export interface RefinanceControllerProps {
  chainId: number
  address: string
}

export function RefinanceController({
  chainId,
  address,
}: PropsWithChildren<RefinanceControllerProps>) {
  const context = React.useContext(refinanceContext)
  if (context === undefined) {
    throw new Error('RefinanceContextProvider is missing in the hierarchy')
  }
  const { position } = context
  const { user, chain, error } = useSdk(address, chainId)

  return (
    <WithErrorHandler error={[error?.message]}>
      <WithLoadingIndicator
        value={[user, chain, position]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_user, _chain, _position]) => (
          <div>
            {_user?.wallet.address} : {_chain?.chainInfo.name} : {_position?.poolId.protocol.name}
          </div>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
