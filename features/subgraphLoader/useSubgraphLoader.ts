import { NetworkIds } from 'blockchain/networks'
import { subgraphMethodsRecord, subgraphsRecord } from 'features/subgraphLoader/consts'
import type {
  SubgraphBaseResponse,
  Subgraphs,
  SubgraphsResponses,
} from 'features/subgraphLoader/types'
import request from 'graphql-request'
import type { ConfigResponseType } from 'helpers/config'
import { configCacheTime, getRemoteConfigWithCache } from 'helpers/config'
import getConfig from 'next/config'
import { useEffect, useState } from 'react'

interface UseSubgraphLoader<R> {
  isError: boolean
  isLoading: boolean
  response: SubgraphBaseResponse<R> | undefined
}

/**
 * @param subgraph - The name of the subgraph.
 * @param method - Optional, name of subgraph to be used - if not provided rawQuery is needed.
 * @param networkId - Determines network of subgraph to be called.
 * @param params - Optional, params for method function.
 * @param rawQuery - Optional, should be used to inject custom query, when defined method and params are not required.
 */
export async function loadSubgraph<
  S extends keyof Subgraphs,
  M extends keyof Subgraphs[S],
  P extends Subgraphs[S][M],
>({
  subgraph,
  method,
  networkId,
  params = {} as P,
  rawQuery,
}: {
  subgraph: S
  method?: M
  networkId: NetworkIds
  params?: P
  rawQuery?: string
}): Promise<SubgraphsResponses[S][keyof SubgraphsResponses[S]]> {
  if (global.window === undefined) {
    const subgraphUrl = await getSubgraphUrl(subgraph, networkId)

    const response = await request(
      subgraphUrl,
      rawQuery || subgraphMethodsRecord[method as keyof typeof subgraphMethodsRecord],
      params as P,
    )

    return {
      success: !!response,
      error: undefined,
      response,
    } as SubgraphsResponses[S][keyof SubgraphsResponses[S]]
  } else {
    const resolvedUrl = global.window?.location.origin || 'http://localhost:3000'

    const response = await fetch(`${resolvedUrl}/api/subgraph`, {
      method: 'POST',
      body: JSON.stringify({
        subgraph,
        method,
        params,
        networkId,
        rawQuery,
      }),
    })

    return await response.json()
  }
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

    loadSubgraph({ subgraph, method, networkId, params })
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
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }))
      })
  }, [subgraph, method, stringifiedParams, networkId])

  return state
}

/**
 * Retrieves the URL of a subgraph based on the provided subgraph name and network ID.
 * @param subgraph - The name of the subgraph.
 * @param networkId - The ID of the network.
 * @returns The URL of the subgraph.
 */
export async function getSubgraphUrl(subgraph: keyof typeof subgraphsRecord, networkId: number) {
  const appConfig: ConfigResponseType = await getRemoteConfigWithCache(
    1000 * configCacheTime.backend,
  )
  const subgraphBaseUrl = appConfig.parameters.subgraphs.baseShortUrl
  const subgraphName = subgraphsRecord[subgraph][networkId as NetworkIds]
  // special case for Ajna goerli subgraph
  if (subgraph === 'Ajna' && networkId === NetworkIds.GOERLI) {
    return getConfig()?.publicRuntimeConfig?.ajnaSubgraphV2UrlGoerli
  }
  return `${subgraphBaseUrl}/${subgraphName}`
}
