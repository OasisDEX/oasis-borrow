import type { Block } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import dayjs from 'dayjs'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import {
  getEstimatedBlockNumber,
  getEstimatedBlockNumberSync,
} from 'helpers/getEstimatedBlockNumber'
import type { Observable } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'

const getOsmRawQuery = ({
  timestamps,
  lastBlock,
  osmId,
}: {
  timestamps: dayjs.Dayjs[]
  lastBlock: Block
  osmId: string
}) =>
  `
    {${timestamps
      .map(
        (timestamp) => `
         price_${timestamp.unix().toString()}: osm(id: "${osmId.toLowerCase()}", block: { number: ${getEstimatedBlockNumberSync(timestamp.unix(), lastBlock)} }) {
            value
          }
        `,
      )
      .join('')}
      }`.replaceAll(' ', '')

export interface MakerOracleTokenPrice {
  token: string
  price: BigNumber
  timestamp: dayjs.Dayjs
  requestedTimestamp: dayjs.Dayjs
}

export function createMakerOracleTokenPrices$(
  context$: Observable<Context>,
  token: string,
  timestamp: dayjs.Dayjs,
): Observable<MakerOracleTokenPrice> {
  return context$.pipe(
    first(),
    switchMap(async ({ chainId }) => {
      const provider = getRpcProvider(chainId)
      const mcdOsms = getNetworkContracts(NetworkIds.MAINNET).mcdOsms
      const osmId = mcdOsms[token].address.toLowerCase()

      if (!osmId) {
        console.error('There is no OSM available for given token', token)
      }

      const block = await getEstimatedBlockNumber(provider, timestamp.unix())

      const { response } = (await loadSubgraph({
        subgraph: 'Discover',
        method: 'getOsm',
        networkId: chainId,
        params: {
          id: osmId,
          block,
        },
      })) as SubgraphsResponses['Discover']['getOsm']

      return {
        token,
        price: new BigNumber(response.osm.value),
        timestamp: dayjs(timestamp),
        requestedTimestamp: dayjs(timestamp),
      }
    }),
  )
}

export function createMakerOracleTokenPricesForDates$(
  context$: Observable<Context>,
  token: string,
  timestamps: dayjs.Dayjs[],
): Observable<MakerOracleTokenPrice[]> {
  return context$.pipe(
    first(),
    switchMap(async ({ chainId }) => {
      const provider = getRpcProvider(chainId)
      const mcdOsms = getNetworkContracts(NetworkIds.MAINNET).mcdOsms
      const osmId = mcdOsms[token].address.toLowerCase()

      if (!osmId) {
        console.error('There is no OSM available for given token', token)
      }

      const lastBlock = await provider.getBlock('latest')

      const { response } = (await loadSubgraph({
        subgraph: 'Discover',
        method: 'getOsm',
        networkId: chainId,
        rawQuery: getOsmRawQuery({
          timestamps,
          lastBlock,
          osmId,
        }),
      })) as SubgraphsResponses['Discover']['getOsm']

      return Object.entries(response).map(([key, value]) => ({
        token,
        price: new BigNumber(value.value),
        timestamp: dayjs(),
        requestedTimestamp: dayjs(Number(key.split('_')[1]) * 1000),
      }))
    }),
  )
}
