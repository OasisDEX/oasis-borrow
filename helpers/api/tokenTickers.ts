import { getCoinbaseTickers } from 'server/services/coinbase'
import { getCoingeckoTickers } from 'server/services/coingecko'
import { getCoinPaprikaTickers } from 'server/services/coinPaprika'

export async function tokenTickers() {
  return {
    'eth-ethereum': 1334.258465143443,
    'usdc-usd-coin': 0.9991509192670103,
    'dai-dai': 0.9993865595295941,
    'steth-lido-staked-ether': 1320.5983637874394,
    'weth-weth': 1328.789027770681,
    'wbtc-wrapped-bitcoin': 17916.97654729976,
    'usdp-paxos-standard-token': 0.99823445715842,
    'gusd-gemini-dollar': 1.0007410295770038,
    'mkr-maker': 604.415049614932,
    'renbtc-renbtc': 18105.408329982565,
    'mkr-usd': 604.27,
    'eth-usd': 1335.6,
    'MANA-USD': 0.3901,
    'LINK-USD': 6.865,
    'YFI-USD': 6508.68,
    'UNI-USD': 6.115,
    'MATIC-USD': 0.9273,
    'dai-usd': 0.9998,
    'wrapped-steth': 1454.19,
    'rocket-pool-eth': 1431.83,
    gnosis: 93.87,
  }
  const results = await Promise.all([
    getCoinPaprikaTickers(),
    getCoinbaseTickers(),
    getCoingeckoTickers(),
  ])
  const mergedTickers = results.reduce((acc, el) => ({ ...acc, ...el }), {})

  return mergedTickers
}
