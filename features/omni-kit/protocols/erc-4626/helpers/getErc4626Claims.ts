import type { MorphoCloseClaimRewardsPayload } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { Erc4626RewardsType } from 'features/omni-kit/protocols/erc-4626/types'
import { getMetaMorphoClaims } from 'features/omni-kit/protocols/morpho-blue/helpers'

interface GetErc4626ClaimsParams {
  account: string
  rewardsType?: Erc4626RewardsType
}

interface Erc4626Claims {
  claims: {
    address: string
    claimable: BigNumber
    earned: BigNumber
    token: string
  }[]
  payload?: MorphoCloseClaimRewardsPayload
}

export async function getErc4626Claims({
  account,
  rewardsType,
}: GetErc4626ClaimsParams): Promise<Erc4626Claims> {
  switch (rewardsType) {
    case Erc4626RewardsType.MetaMorpho:
      return getMetaMorphoClaims({ account })
    default:
      return {
        claims: [],
      }
  }
}
