import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { NetworkIds } from 'blockchain/networks'
import { getRpcProvider } from 'blockchain/networks'
import type { PoolCreatorBoundries } from 'features/ajna/pool-creator/types'
import { AjnaErc20PoolFactory__factory as AjnaErc20PoolFactoryFactory } from 'types/ethers-contracts'

export async function getAjnaPoolInterestRateBoundaries(
  networkId: NetworkIds,
): Promise<PoolCreatorBoundries | undefined> {
  const rpcProvider = getRpcProvider(networkId)
  const networkContracts = getNetworkContracts(networkId)

  if ('ajnaERC20PoolFactory' in networkContracts) {
    const ajnaErc20PoolFactoryAddress = networkContracts.ajnaERC20PoolFactory.address
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
  } else return undefined
}
