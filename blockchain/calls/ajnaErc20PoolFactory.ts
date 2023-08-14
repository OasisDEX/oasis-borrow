import { TxMeta } from '@oasisdex/transactions'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { AjnaErc20PoolFactory } from 'types/web3-v1-contracts'

export interface DeployAjnaPoolTxData extends TxMeta {
  kind: TxMetaKind.deployAjnaPool
  collateralAddress: string
  quoteAddress: string
  interestRate: string
}

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
