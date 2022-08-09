import { Network } from '@ethersproject/networks/src.ts/types'
import crypto from 'crypto'
import { fetchJson } from 'ethers/lib/utils'

export interface Request {
  method: any
  params: any
  network: Network
  id: number
  jsonrpc: string
}

interface Cache {
  getStats: () => void
  get: (hash: string) => unknown
  set: (hash: string, entry: unknown) => void
}

interface Options {
  fetchJsonFn?: typeof fetchJson
  debug?: boolean
}

export class BatchManager {
  private _cache: Cache
  private _connection: string
  private _fetchJson: typeof fetchJson
  private _debug: boolean | undefined

  constructor(url: string, cache: Cache, options?: Options) {
    this._cache = cache
    this._connection = url
    this._fetchJson = options?.fetchJsonFn || fetchJson
    this._debug = options?.debug
  }

  private _createHash(request: Request) {
    const requestExtract = {
      method: request.method,
      params: { data: request.params[0].data, to: request.params[0].to },
      network: request.network,
    }

    const hashString = JSON.stringify(requestExtract)
    const hash = crypto.createHash('sha256').update(hashString).digest('hex')

    return hash
  }

  async batchCall(batchCallData: Array<Request>) {
    // 1. Extract cache hits
    const batchResults: Array<{
      requestIdx: number
      data: unknown
      callData: Request
      fromCache: boolean
    }> = batchCallData.map((callData, index) => {
      const hash = this._createHash(callData)
      const cachedResult = this._cache.get(hash)

      return {
        data: cachedResult,
        callData,
        fromCache: !!cachedResult,
        requestIdx: index,
      }
    })

    // 2. Extract cache miss requests
    const batchRequests: Array<Request> = batchResults
      .filter((call) => !call.fromCache)
      .map((call) => call.callData)

    // 3. Make the call to infura
    let batchResponse: Array<{ data: unknown; error?: Error }> = []
    if (batchRequests.length > 0) {
      batchResponse = await this._fetchJson(this._connection, JSON.stringify(batchRequests)).then(
        (responses) => {
          return responses.map(
            (response: { result?: string; error: Error } | null, index: number) => {
              if (response?.result) {
                this._cache.set(this._createHash(batchRequests[index] as Request), response.result)
                return { data: response?.result }
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

    // 4. Print stats (Debug mode only)
    this._debug && console.log(this._cache.getStats())

    // 5. Integrate responses into batchResults
    return batchResults.map((result) => {
      if (result.fromCache) {
        return result
      } else {
        return { ...result, ...batchResponse.shift() }
      }
    })
  }
}
