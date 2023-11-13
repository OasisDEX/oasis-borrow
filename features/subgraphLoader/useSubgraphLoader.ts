import type { NetworkIds } from 'blockchain/networks'
import { subgraphMethodsRecord, subgraphsRecord } from 'features/subgraphLoader/consts'
import type {
  SubgraphBaseResponse,
  Subgraphs,
  SubgraphsResponses,
} from 'features/subgraphLoader/types'
import request from 'graphql-request'
import { useEffect, useState } from 'react'

interface UseSubgraphLoader<R> {
  isError: boolean
  isLoading: boolean
  response: SubgraphBaseResponse<R> | undefined
}

export async function loadSubgraph<
  S extends keyof Subgraphs,
  M extends keyof Subgraphs[S],
  P extends Subgraphs[S][M],
>(
  subgraph: S,
  method: M,
  networkId: NetworkIds,
  params: P = {} as P,
): Promise<SubgraphsResponses[S][keyof SubgraphsResponses[S]]> {
  if (global.window === undefined) {
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
  const resolvedUrl = global.window?.location.origin || 'http://localhost:3000'

  const response = await fetch(`${resolvedUrl}/api/subgraph`, {
    method: 'POST',
    body: JSON.stringify({
      subgraph,
      method,
      params,
      networkId,
    }),
  })

  return await response.json()
}

export function useSubgraphLoader<
  S extends keyof Subgraphs,
  M extends keyof Subgraphs[S],
  P extends Subgraphs[S][M],
>(subgraph: S, method: M, params: P, networkId: NetworkIds) {
  const stringifiedParams = JSON.stringify(params)
  const [state, setState] = useState<
    UseSubgraphLoader<SubgraphsResponses[S][keyof SubgraphsResponses[S]]>
  >({
    isError: false,
    isLoading: false,
    response: undefined,
  })

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
    }))

    loadSubgraph(subgraph, method, networkId, params)
      // @ts-ignore
      // TODO adjust types
      .then(({ success, response }) => {
        setState((prev) => ({
          ...prev,
          isError: !success,
          response,
        }))
      })
      .catch(() => {
        setState((prev) => ({
          ...prev,
          isError: true,
          response: undefined,
        }))
      })
      .finally(() => {
        // console.log('finally')
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }))
      })
  }, [subgraph, method, stringifiedParams, networkId])

  return state
}
