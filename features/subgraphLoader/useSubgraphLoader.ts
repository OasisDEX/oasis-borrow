import type { NetworkIds } from 'blockchain/networks'
import type {
  SubgraphBaseResponse,
  Subgraphs,
  SubgraphsResponses,
} from 'features/subgraphLoader/types'
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
  const response = await fetch(`/api/subgraph`, {
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
