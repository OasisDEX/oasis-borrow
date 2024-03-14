import type BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'

interface GetErc4626ApyParams {
  rewardsApy: {
    per1kUsd?: BigNumber
    token: string
    value: BigNumber
  }[]
  vaultApy: BigNumber
}

export function getErc4626Apy({ rewardsApy, vaultApy }: GetErc4626ApyParams) {
  return vaultApy.plus(rewardsApy.reduce<BigNumber>((sum, { value }) => sum.plus(value), zero))
}
