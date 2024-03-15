import type { views } from '@oasisdex/dma-library'

// TODO: entire file is a mock

type GetErc4626ApyParametersResponse = ReturnType<
  Parameters<typeof views.common.getErc4626Position>[1]['getVaultApyParameters']
>

interface RewardToken {
  address: string
  symbol: string
  decimals: number
  amountWei: string
  humanReadable: string
  apy: number
}

interface RewardsByMarket {
  market: {
    marketId: string
    collateral: {
      address: string
      symbol: string
      decimals: number
      priceUsd: number | undefined
    }
    suppliedAssets: string
    suppliedAssetsHumanReadable: string
    allocation: number
    liquidationLtv: number
  }
  tokens: RewardToken[]
}

interface GetRewardsResponse {
  metaMorpho: {
    address: string
    weeklyApy: number
    monthlyApy: number
    dailyApy: number
    apy: number
    fee: number
    totalAssets: string
  }
  rewardsByMarket: RewardsByMarket[]
  rewardsByToken: RewardToken[]
}

export async function getErc4626ApyParameters(
  vaultAddress: string,
): GetErc4626ApyParametersResponse {
  // TODO: Pass proper prices
  const response = await fetch(
    `/api/morpho/meta-morpho?address=${vaultAddress}&morhoPrice=1&wsEthPrice=4500`,
  )

  if (response.status !== 200) {
    console.warn('Failed to fetch vault details', response)
    return {
      vault: {
        apy: '0',
        curator: 'Steakhouse',
        fee: '0',
      },
      apyFromRewards: [],
      allocations: [],
    }
  }
  const data = (await response.json()) as GetRewardsResponse
  return {
    vault: {
      apy: data.metaMorpho.apy.toString(),
      curator: 'Steakhouse',
      fee: data.metaMorpho.fee.toString(),
    },
    apyFromRewards: data.rewardsByToken.map((token) => {
      return {
        token: token.symbol.toUpperCase(),
        value: token.apy.toString(),
        per1kUsd: token.humanReadable.toString(),
      }
    }),
    allocations: data.rewardsByMarket.map((market) => ({
      token: market.market.collateral.symbol.toUpperCase(),
      supply: market.market.suppliedAssetsHumanReadable,
      riskRatio: market.market.liquidationLtv.toString(),
    })),
  }
}
