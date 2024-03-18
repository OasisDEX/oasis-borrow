import { getTokensPrices, type TokensPricesList } from 'handlers/portfolio/positions/helpers'

interface GetErc4626ApyParametersParams {
  prices?: TokensPricesList
}

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

export function getErc4626ApyParameters({ prices }: GetErc4626ApyParametersParams) {
  return async (vaultAddress: string) => {
    const resolvedUrl = global.window?.location.origin || 'http://localhost:3000'
    const resolvedPrices = prices ?? (await getTokensPrices()).tokens ?? {}

    const wstETHPrice = resolvedPrices['WSTETH']
    // TODO: Pass Morhpo price
    const response = await fetch(
      `${resolvedUrl}/api/morpho/meta-morpho?address=${vaultAddress}&morhoPrice=1&wsEthPrice=${wstETHPrice}`,
    )

    if (response.status !== 200) {
      console.warn('Failed to fetch vault details', response)
      return {
        vault: {
          apy: '0',
          fee: '0',
        },
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
}
