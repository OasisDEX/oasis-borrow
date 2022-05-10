import BigNumber from 'bignumber.js'

import { LidoCrvLiquidityFarmingReward } from '../../types/web3-v1-contracts/lido-crv-liquidity-farming-reward'
import { CallDef } from './callsHelpers'

export const crvLdoRewardsEarned: CallDef<string, BigNumber> = {
  call: (_, { contract, lidoCrvLiquidityFarmingReward }) => {
    return contract<LidoCrvLiquidityFarmingReward>(lidoCrvLiquidityFarmingReward).methods.earned
  },
  prepareArgs: (ilk, { joins }) => [joins[ilk]],
  postprocess: (earned: any) => new BigNumber(earned),
}
