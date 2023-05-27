import { deepCopy } from '@ethersproject/properties'
import { fetchJson } from '@ethersproject/web'
import { providers } from 'ethers'

// Experimental
type PendingBatch = Record<
  string,
  Array<{
    request: { method: string; params: Array<any>; id: number; jsonrpc: '2.0' }
    resolve: (result: any) => void
    reject: (error: Error) => void
  }>
>

export class JsonRpcBatchProvider extends providers.JsonRpcProvider {
  _pendingBatchAggregator: NodeJS.Timeout | null = null
  _pendingBatch: PendingBatch | null = null
  send(method: string, params: Array<any>): Promise<any> {
    console.log(`Request method: ${method}`)
    const request = {
      method: method,
      params: params,
      id: this._nextId++,
      jsonrpc: '2.0' as '2.0',
    }

    if (this._pendingBatch == null) {
      this._pendingBatch = {}
    }

    if (this._pendingBatch[method] == null) {
      this._pendingBatch[method] = []
    }

    interface InflightRequest {
      request: typeof request
      resolve: (value: unknown) => void
      reject: (value: unknown) => void
    }

    const inflightRequest: InflightRequest = { request, resolve: () => null, reject: () => null }

    const promise = new Promise((resolve, reject) => {
      inflightRequest.resolve = resolve
      inflightRequest.reject = reject
    })

    this._pendingBatch[method].push(inflightRequest)

    if (!this._pendingBatchAggregator) {
      // Schedule batch for next event loop + short duration
      this._pendingBatchAggregator = setTimeout(() => {
        // Get teh current batch and clear it, so new requests
        // go into the next batch
        const batch = this._pendingBatch
        if (batch === null) {
          return Promise.resolve()
        }
        this._pendingBatch = null
        this._pendingBatchAggregator = null

        // Get the request as an array of requests
        return Object.entries(batch)
          .map(([method, inflights]) => {
            return {
              method,
              request: inflights.map((inflight) => inflight.request),
            }
          })
          .map(({ method, request }) => {
            this.emit('debug', {
              action: 'requestBatch',
              request: deepCopy(request),
              provider: this,
            })
            return fetchJson(this.connection, JSON.stringify(request)).then(
              (result) => {
                this.emit('debug', {
                  action: 'response',
                  request: request,
                  response: result,
                  provider: this,
                })

                // For each result, feed it to the correct Promise, depending
                // on whether it was a success or error
                batch[method].forEach((inflightRequest, index) => {
                  const payload = result[index]
                  if (payload.error) {
                    const error = new Error(payload.error.message)
                    ;(<any>error).code = payload.error.code
                    ;(<any>error).data = payload.error.data
                    inflightRequest.reject(error)
                  } else {
                    inflightRequest.resolve(payload.result)
                  }
                })
              },
              (error) => {
                this.emit('debug', {
                  action: 'response',
                  error: error,
                  request: request,
                  provider: this,
                })

                batch[method].forEach((inflightRequest) => {
                  inflightRequest.reject(error)
                })
              },
            )
          })
        // const request = batch.map((inflight) => inflight.request)
      }, 200)
    }

    return promise
  }
}
