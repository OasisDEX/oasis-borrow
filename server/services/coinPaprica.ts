import axios from 'axios'

export interface CoinPapricaPriceResponse {
  [id: string]: string
}

interface ApiResponse {
  id: string
  name: string
  symbol: string
  rank: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  beta_value: number
  first_data_at: Date
  last_updated: Date
  quotes: Quotes
}

export interface Quotes {
  USD: Quote
}

export interface Quote {
  price: number
  volume_24h: number
  volume_24h_change_24h: number
  market_cap: number
  market_cap_change_24h: number
  percent_change_15m: number
  percent_change_30m: number
  percent_change_1h: number
  percent_change_6h: number
  percent_change_12h: number
  percent_change_24h: number
  percent_change_7d: number
  percent_change_30d: number
  percent_change_1y: number
  ath_price: number
  ath_date: Date
  percent_from_price_ath: number
}

const supportedTickers = [
  'usdp-paxos-standard-token',
  'steth-lido-staked-ether',
  'mkr-maker',
  'weth-weth',
  'eth-ethereum',
  'wbtc-wrapped-bitcoin',
  'renbtc-renbtc',
  'gusd-gemini-dollar',
  'usdc-usd-coin',
  'dai-dai',
]

export async function getTickers(): Promise<CoinPapricaPriceResponse> {
  const res = await axios({
    method: 'get',
    timeout: 1000,
    url: 'https://api.coinpaprika.com/v1/tickers/',
    responseType: 'json',
    headers: {
      Accept: 'application/json',
    },
  })

  const result: ApiResponse[] = res.data

  return result
    .filter((response) => supportedTickers.includes(response.id))
    .reduce((acc, res) => {
      return {
        ...acc,
        [res.id]: res.quotes.USD.price,
      }
    }, {})
}
