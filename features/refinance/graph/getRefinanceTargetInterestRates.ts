import { NetworkIds } from 'blockchain/networks'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { objectEntries } from 'helpers/objectEntries'
import { LendingProtocol } from 'lendingProtocols'

export type GetAaveLikeInterestRateInput = Record<NetworkIds, Record<LendingProtocol, string[]>>

export type AaveLikeVariableInterestRates = Record<'borrowVariable' | 'lendVariable', string>
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

  return `{ ${queries.join('')} }`.replaceAll(' ', '')
}

const getTargetLendingProtocols = (sourceLendingProtocol: LendingProtocol) => {
  switch (sourceLendingProtocol) {
    case LendingProtocol.AaveV3:
      return [LendingProtocol.SparkV3]
    case LendingProtocol.SparkV3:
      return [LendingProtocol.AaveV3]
    case LendingProtocol.MorphoBlue:
      return [LendingProtocol.SparkV3]
    default:
      throw new Error(`Unsupported refinance source protocol ${sourceLendingProtocol}`)
  }
}

export const getRefinanceTargetInterestRates = async (
  input: GetAaveLikeInterestRateInput,
  sourceLendingProtocol: LendingProtocol,
): Promise<RefinanceInterestRatesMetadata> => {
  // based on the source protocol we should get available target protocols
  const targetLendingProtocols = getTargetLendingProtocols(sourceLendingProtocol)
  const targetNetwork = NetworkIds.MAINNET

  const resolvedInput = {
    [targetNetwork]: targetLendingProtocols.reduce((acc, targetLendingProtocol) => {
      // we don't need to fetch rates for Morpho, they are already available
      if (targetLendingProtocol === LendingProtocol.MorphoBlue) {
        return acc
      }
      return {
        ...acc,
        [targetLendingProtocol]: input[targetNetwork][targetLendingProtocol],
      }
    }, {}),
  } as GetAaveLikeInterestRateInput

  const requests = objectEntries(resolvedInput).map(async ([networkId, data]) => ({
    [networkId]: (await loadSubgraph({
      subgraph: 'Aave',
      networkId,
      rawQuery: generateInterestRateQueries(data),
    })) as SubgraphsResponses['Aave']['getAaveLikeInterestRates'],
  }))
  const response = await Promise.all(requests)

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
              const resolvedToken = token === 'WETH' ? 'ETH' : token

              return {
                ...acc2,
                [protocol]: {
                  ...(acc2[castedProtocol] ? acc2[castedProtocol] : {}),
                  ...(resolvedToken
                    ? {
                        [resolvedToken]: {
                          ...(acc2[castedProtocol]?.[resolvedToken]
                            ? acc2[castedProtocol]?.[resolvedToken]
                            : {}),
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
