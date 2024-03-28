import type BigNumber from 'bignumber.js'
import type { OmniTxData } from 'features/omni-kit/hooks'
import { Erc4626RewardsType } from 'features/omni-kit/protocols/erc-4626/types'
import { getMetaMorphoClaims } from 'features/omni-kit/protocols/morpho-blue/helpers'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'

interface GetErc4626ClaimsParams {
  account: string
  networkId: OmniSupportedNetworkIds
  rewardsType?: Erc4626RewardsType
}

export interface Erc4626Claims {
  claims: {
    address: string
    claimable: BigNumber
    earned: BigNumber
    token: string
  }[]
  tx?: OmniTxData
}

export async function getErc4626Claims({
  account,
  networkId,
  rewardsType,
}: GetErc4626ClaimsParams): Promise<Erc4626Claims> {
  switch (rewardsType) {
    case Erc4626RewardsType.MetaMorpho:
      return await getMetaMorphoClaims({ account, networkId })
    default:
      return {
        claims: [],
      }
  }
}
