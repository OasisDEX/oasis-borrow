import { Subgraphs } from 'features/subgraphLoader/types'
import { useEffect, useState } from 'react'

interface UseSubgraphLoader {
  isError: boolean
  isLoading: boolean
  response: Object | undefined
}

export async function loadSubgraph<
  S extends keyof Subgraphs,
  M extends keyof Subgraphs[S],
  P extends Subgraphs[S][M]
>(subgraph: S, method: M, params: P) {
  const response = await fetch(`/api/subgraph`, {
    method: 'POST',
    body: JSON.stringify({
      subgraph,
      method,
      params,
    }),
  })

  return await response.json()
}

export function useSubgraphLoader<
  S extends keyof Subgraphs,
  M extends keyof Subgraphs[S],
  P extends Subgraphs[S][M]
>(subgraph: S, method: M, params: P) {
  const stringifiedParams = JSON.stringify(params)
  const [state, setState] = useState<UseSubgraphLoader>({
    isError: false,
    isLoading: false,
    response: undefined,
  })

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
    }))

    loadSubgraph(subgraph, method, params)
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
  }, [subgraph, method, stringifiedParams])

  return state
}
