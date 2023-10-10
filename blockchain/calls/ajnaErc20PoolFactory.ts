import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import type { PoolCreatorBoundries } from 'features/poolCreator/types'
import { AjnaErc20PoolFactory__factory as AjnaErc20PoolFactoryFactory } from 'types/ethers-contracts'

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
