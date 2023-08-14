import { TxMeta } from '@oasisdex/transactions'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { AjnaErc20PoolFactory } from 'types/web3-v1-contracts'

export interface DeployAjnaPoolTxData extends TxMeta {
  kind: TxMetaKind.deployAjnaPool
  collateralToken: string
  quoteToken: string
  interestRate: number
}

export const claimAjnaRewards: TransactionDef<DeployAjnaPoolTxData> = {
  call: (_, { contract, chainId }) => {
    return contract<AjnaErc20PoolFactory>(
      getNetworkContracts(NetworkIds.MAINNET, chainId).ajnaRewardsClaimer,
    ).methods.deployPool
  },
  prepareArgs: (data) => {
    const { collateralToken, quoteToken, interestRate } = data

    return [collateralToken, quoteToken, interestRate]
  },
}
