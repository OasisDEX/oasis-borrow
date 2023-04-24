import { Network } from '@ethersproject/providers'
import axios from 'axios'
import { providers } from 'ethers'
import { deepCopy } from 'ethers/lib/utils'

type PendingBatch = Array<{
  request: { method: string; params: Array<any> }
  resolve: (result: any) => void
  reject: (error: Error) => void
}>

export class JsonRpcCachedProvider extends providers.JsonRpcProvider {
  _pendingBatchAggregator: NodeJS.Timer | null = null
  _pendingBatch: PendingBatch | null = null

  send(method: string, params: Array<any>): Promise<any> {
    const request = {
      method: method,
      params: params,
      network: this.network,
      id: this._nextId++,
      jsonrpc: '2.0' as '2.0',
    }

    if (this._pendingBatch == null) {
      this._pendingBatch = []
    }

    interface InflightRequest {
      request: typeof request
      resolve: (value: unknown) => void
      reject: (value: unknown) => void
    }

    const inflightRequest: InflightRequest = {
      request,
      resolve: () => null,
      reject: () => null,
    }

    const promise = new Promise((resolve, reject) => {
      inflightRequest.resolve = resolve
      inflightRequest.reject = reject
    })

    this._pendingBatch.push(inflightRequest)

    if (!this._pendingBatchAggregator) {
      // Schedule batch for next event loop + short duration
      this._pendingBatchAggregator = setTimeout(() => {
        // Get teh current batch and clear it, so new requests
        // go into the next batch
        const batch = this._pendingBatch
        this._pendingBatch = null
        this._pendingBatchAggregator = null

        // Get the request as an array of requests
        const requests = batch!.map((inflight) => inflight.request)

        this.emit('debug', {
          action: 'requestBatch',
          request: deepCopy(request),
          provider: this,
        })

        return axios
          .post<{ encoded: string; network: Network }, { data: any[] }>('/api/infuraCallsCache', {
            encoded: JSON.stringify(requests),
            network: this.network,
          })
          .then(
            (response) => {
              const responses = response.data
              this.emit('debug', {
                action: 'response',
                request: request,
                response,
                provider: this,
              })

              // For each result, feed it to the correct Promise, depending
              // on whether it was a success or error
              batch!.forEach((inflightRequest, index) => {
                const payload = responses[index]
                if (payload.data && !payload.error) {
                  inflightRequest.resolve(payload.data)
                }
                if (payload.error) {
                  const error = new Error(payload.error.message)
                  ;(<any>error).code = payload.error.code
                  ;(<any>error).data = payload.error.data
                  inflightRequest.reject(error)
                } else {
                  inflightRequest.reject(new Error('Cache returned null for request'))
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

              batch!.forEach((inflightRequest) => {
                inflightRequest.reject(error)
              })
            },
          )
      }, 10)
    }

    return promise
  }
}
