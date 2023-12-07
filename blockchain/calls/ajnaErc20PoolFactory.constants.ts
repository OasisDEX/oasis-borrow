import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import type { AjnaErc20PoolFactory } from 'types/web3-v1-contracts'

import type { DeployAjnaPoolTxData } from './ajnaErc20PoolFactory.types'

export const deployAjnaPool: TransactionDef<DeployAjnaPoolTxData> = {
  call: (_, { contract, chainId }) => {
    const networkContracts = getNetworkContracts(chainId)

    return 'ajnaERC20PoolFactory' in networkContracts
      ? contract<AjnaErc20PoolFactory>(networkContracts.ajnaERC20PoolFactory).methods.deployPool
      : { abi: {}, address: '' }
  },
  prepareArgs: (data) => {
    const { collateralAddress, quoteAddress, interestRate } = data

    return [collateralAddress, quoteAddress, interestRate]
  },
}
