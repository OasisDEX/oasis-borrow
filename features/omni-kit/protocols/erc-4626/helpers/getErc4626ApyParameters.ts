import type { views } from '@oasisdex/dma-library'
import { tokenPrices } from 'blockchain/prices.constants'

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
  const prices = await tokenPrices()
  const wstETHPrice = prices['wsteth']
  // TODO: Pass Morhpo price
  const response = await fetch(
    `/api/morpho/meta-morpho?address=${vaultAddress}&morhoPrice=1&wsEthPrice=${wstETHPrice}`,
  )

  if (response.status !== 200) {
    console.warn('Failed to fetch vault details', response)
    return {
      vault: {
        apy: '0',
        fee: '0',
      },
      apyFromRewards: [],
      allocations: [],
    }
  }

  const data = (await response.json()) as GetRewardsResponse

  const apyFromRewards = data.rewardsByToken
    .map((token) => {
      return {
        token: token.symbol.toUpperCase(),
        value: token.apy.toString(),
        per1kUsd: token.humanReadable.toString(),
      }
    })
    .filter((token) => token.value !== '0')

  const allocations = data.rewardsByMarket
    .map((market) => ({
      token: market.market.collateral.symbol.toUpperCase(),
      supply: market.market.suppliedAssetsHumanReadable,
      riskRatio: market.market.liquidationLtv.toString(),
    }))
    .filter((market) => market.supply !== '0')

  return {
    vault: {
      apy: data.metaMorpho.apy.toString(),
      curator: 'Steakhouse',
      fee: data.metaMorpho.fee.toString(),
    },
    apyFromRewards: apyFromRewards.length > 0 ? apyFromRewards : undefined,
    allocations: allocations.length > 0 ? allocations : undefined,
  }
}
