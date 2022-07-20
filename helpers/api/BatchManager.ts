import { Network } from '@ethersproject/networks/src.ts/types'
import { fetchJson } from 'ethers/lib/utils'

import { BatchCache } from './BatchCache'

export interface Request {
  method: any
  params: any
  network: Network
  id: number
  jsonrpc: string
}

export class BatchManager {
  private _cache: BatchCache
  private _connection: string
  private _fetchJson: typeof fetchJson

  constructor(url: string, fetchJsonFn?: typeof fetchJson) {
    this._cache = new BatchCache()
    this._connection = url
    this._fetchJson = fetchJsonFn || fetchJson
  }

  async batchCall(batchCallData: Array<Request>) {
    // 1. Extract cache hits
    const batchResults: Array<{
      data: unknown
      callData: Request
      fromCache: boolean
    }> = batchCallData.map((callData) => {
      const hash = this._cache.createHash(callData)
      const cachedResult = this._cache.get(hash)
      if (cachedResult) {
        return { data: cachedResult, callData, fromCache: true }
      }
      return { data: null, callData, fromCache: false }
    })

    // 2. Extract cache miss requests
    const batchRequests: Array<Request> = batchResults
      .filter((call) => !call.fromCache)
      .map((call) => call.callData)

    // 3. Make the call to infura
    let batchResponse: Array<unknown> = []

    if (batchRequests.length > 0) {
      batchResponse = await this._fetchJson(this._connection, JSON.stringify(batchRequests)).then(
        (responses) => {
          return responses.map(
            (response: { result?: string; error: Error } | null, index: number) => {
              if (response?.result) {
                this._cache.set(
                  this._cache.createHash(batchRequests[index] as Request),
                  response.result,
                )
                return { data: response?.result, fromCache: false }
              }
              if (response?.error) {
                return { error: new Error(response?.error.message) }
              }
              return null
            },
          )
        },
      )
    }

    // 4. Integrate responses into batchResults
    return batchResults.map((result) => {
      if (result.fromCache) {
        return { data: result.data, fromCache: true }
      } else {
        return batchResponse.shift()
      }
    })
  }
}
