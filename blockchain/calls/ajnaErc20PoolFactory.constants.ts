import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { AjnaErc20PoolFactory } from 'types/web3-v1-contracts'

import type { DeployAjnaPoolTxData } from './ajnaErc20PoolFactory.types'

export const deployAjnaPool: TransactionDef<DeployAjnaPoolTxData> = {
  call: (_, { contract, chainId }) => {
    return contract<AjnaErc20PoolFactory>(
      getNetworkContracts(NetworkIds.MAINNET, chainId).ajnaERC20PoolFactory,
    ).methods.deployPool
  },
  prepareArgs: (data) => {
    const { collateralAddress, quoteAddress, interestRate } = data

    return [collateralAddress, quoteAddress, interestRate]
  },
}
