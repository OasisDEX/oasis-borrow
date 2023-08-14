import { TxMeta } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { PoolCreatorBoundries } from 'features/poolCreator/types'
import { AjnaErc20PoolFactory__factory as AjnaErc20PoolFactoryFactory } from 'types/ethers-contracts'
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

export async function getAjnaPoolInterestRateBoundaries(
  chainId: NetworkIds,
): Promise<PoolCreatorBoundries> {
  const rpcProvider = getRpcProvider(chainId)
  const ajnaErc20PoolFactoryAddress = getNetworkContracts(NetworkIds.MAINNET, chainId)
    .ajnaERC20PoolFactory.address
  const ajnaErc20PoolFactoryContract = AjnaErc20PoolFactoryFactory.connect(
    ajnaErc20PoolFactoryAddress,
    rpcProvider,
  )

  return Promise.all([
    ajnaErc20PoolFactoryContract.MIN_RATE(),
    ajnaErc20PoolFactoryContract.MAX_RATE(),
  ]).then(([min, max]) => {
    return {
      min: amountFromWei(new BigNumber(min.toString())).times(100),
      max: amountFromWei(new BigNumber(max.toString())).times(100),
    }
  })
}
