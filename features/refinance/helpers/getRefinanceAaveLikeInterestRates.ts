import type { NetworkIds } from 'blockchain/networks'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { objectEntries } from 'helpers/objectEntries'
import { LendingProtocol } from 'lendingProtocols'

export type GetAaveLikeInterestRateInput = Record<NetworkIds, Record<LendingProtocol, string[]>>

export type AaveLikeVariableInterestRates = Record<'borrowVariable' | 'lendingVariable', string>
export type AaveLikeTokenInterestRate = Record<string, AaveLikeVariableInterestRates>

export type RefinanceInterestRatesMetadata = Record<
  NetworkIds,
  Record<LendingProtocol, AaveLikeTokenInterestRate>
>

export interface GetAaveLikeInterestRatesResponse {
  rate: string
  token: {
    symbol: string
  }
}

function generateInterestRateQueries(data: Record<LendingProtocol, string[]>): string {
  const queries = Object.entries(data).flatMap(([protocol, symbols]) => {
    const protocolSubgraphMap = {
      [LendingProtocol.AaveV3]: 'aave_v3',
      [LendingProtocol.AaveV2]: 'aave_v2',
      [LendingProtocol.SparkV3]: 'spark',
    }[protocol]

    return symbols.map((symbol) => {
      const resolvedSymbol = symbol === 'ETH' ? 'WETH' : symbol

      const symbolKey = resolvedSymbol.replace('.', '')

      return `
      ${symbolKey}_${protocol}_borrowVariable: interestRates(
        where: {token_: {symbol_starts_with_nocase: "${resolvedSymbol}"}, protocol: "${protocolSubgraphMap}", type: "borrow-variable"}
        first: 1
        orderBy: timestamp
        orderDirection: desc
      ) {
        rate
        token {
          symbol
        }
      }
      ${symbolKey}_${protocol}_lendVariable: interestRates(
        where: {token_: {symbol_starts_with_nocase: "${resolvedSymbol}"}, protocol: "${protocolSubgraphMap}", type: "lend"}
        first: 1
        orderBy: timestamp
        orderDirection: desc
      ) {
        rate
        token {
          symbol
        }
      }
    `
    })
  })

  return `{ ${queries.join('')} }`
}

export const getRefinanceAaveLikeInterestRates = async (
  input: GetAaveLikeInterestRateInput,
): Promise<RefinanceInterestRatesMetadata> => {
  const response = await Promise.all(
    objectEntries(input).map(async ([networkId, data]) => ({
      [networkId]: (await loadSubgraph({
        subgraph: 'Aave',
        networkId,
        rawQuery: generateInterestRateQueries(data),
      })) as SubgraphsResponses['Aave']['getAaveLikeInterestRates'],
    })),
  )

  const reduced = response.reduce((acc, curr) => ({ ...acc, ...curr }))

  return objectEntries(reduced).reduce(
    (acc, [networkId, data]) => ({
      ...acc,
      [networkId]: data.response
        ? objectEntries(data.response).reduce(
            (acc2, [key, value]) => {
              if (typeof key !== 'string') {
                return acc2
              }

              const [, protocol, type] = key.split('_')

              const castedProtocol = protocol as LendingProtocol
              const token = value?.[0]?.token.symbol?.toUpperCase()
              return {
                ...acc2,
                [protocol]: {
                  ...(acc2[castedProtocol] ? acc2[castedProtocol] : {}),
                  ...(token
                    ? {
                        [token]: {
                          ...(acc2[castedProtocol]?.[token] ? acc2[castedProtocol]?.[token] : {}),
                          [type]: value?.[0]?.rate,
                        },
                      }
                    : {}),
                },
              }
            },
            {} as Record<LendingProtocol, AaveLikeTokenInterestRate>,
          )
        : undefined,
    }),
    {} as Record<NetworkIds, Record<LendingProtocol, AaveLikeTokenInterestRate>>,
  )
}
