import { subgraphMethodsRecord, subgraphsRecord } from 'features/subgraphLoader/consts'
import { Subgraphs } from 'features/subgraphLoader/types'
import request from 'graphql-request'
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
  return await request(subgraphsRecord[subgraph], subgraphMethodsRecord[method], params)
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
      .then((response) => {
        setState((prev) => ({
          ...prev,
          isError: false,
          response,
        }))
      })
      .catch((error) => {
        console.error(error)

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
