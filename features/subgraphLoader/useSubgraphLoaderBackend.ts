import type { NetworkIds } from 'blockchain/networks'
import { subgraphMethodsRecord, subgraphsRecord } from 'features/subgraphLoader/consts'
import type { Subgraphs, SubgraphsResponses } from 'features/subgraphLoader/types'
import request from 'graphql-request'

export async function loadSubgraphBackend<
  S extends keyof Subgraphs,
  M extends keyof Subgraphs[S],
  P extends Subgraphs[S][M],
>(
  subgraph: S,
  method: M,
  networkId: NetworkIds,
  params: P = {} as P,
): Promise<SubgraphsResponses[S][keyof SubgraphsResponses[S]]> {
  const subgraphUrl = subgraphsRecord[subgraph][networkId]
  const subgraphQuery = subgraphMethodsRecord[method as keyof typeof subgraphMethodsRecord]
  const subgraphParams = params as {}

  const backendResponse = await request(subgraphUrl, subgraphQuery, subgraphParams)

  return {
    success: !!backendResponse,
    error: undefined,
    response: backendResponse,
  } as SubgraphsResponses[S][keyof SubgraphsResponses[S]]
}
