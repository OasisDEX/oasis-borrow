import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networkIds'
import { LidoCrvLiquidityFarmingReward } from 'types/web3-v1-contracts'

import { CallDef } from './callsHelpers'

export const crvLdoRewardsEarned: CallDef<string, BigNumber> = {
  call: (_, { contract, chainId }) => {
    return contract<LidoCrvLiquidityFarmingReward>(
      getNetworkContracts(NetworkIds.MAINNET, chainId).lidoCrvLiquidityFarmingReward,
    ).methods.earned
  },
  prepareArgs: (ilk, { chainId }) => [getNetworkContracts(NetworkIds.MAINNET, chainId).joins[ilk]],
  postprocess: (earned: any) => new BigNumber(earned),
}
