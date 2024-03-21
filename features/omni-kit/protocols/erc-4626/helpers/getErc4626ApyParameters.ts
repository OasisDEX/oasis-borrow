import type BigNumber from 'bignumber.js'
import type { Tickers } from 'blockchain/prices.types'
import { getTokensPrices, type TokensPricesList } from 'handlers/portfolio/positions/helpers'
import { fetchFromFunctionsApi } from 'helpers/fetchFromFunctionsApi'
import { one } from 'helpers/zero'

interface GetErc4626ApyParametersParams {
  prices?: TokensPricesList | Tickers
  rewardTokenPrice?: BigNumber
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

export function getErc4626ApyParameters({
  prices,
  rewardTokenPrice = one,
}: GetErc4626ApyParametersParams) {
  return async (vaultAddress: string) => {
    const resolvedPrices = prices ?? (await getTokensPrices()).tokens ?? {}

    const wstETHPrice = resolvedPrices['WSTETH']
    const response = await fetchFromFunctionsApi(
      `/api/morpho/meta-morpho?address=${vaultAddress}&morhoPrice=${rewardTokenPrice}&wsEthPrice=${wstETHPrice}`,
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
