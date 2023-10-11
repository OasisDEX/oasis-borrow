import type { JsonRpcProvider } from '@ethersproject/providers'
import type { JSONRPCRequestPayload } from 'ethereum-types'
import { providers } from 'ethers'
import { includes } from 'lodash'
import type { JsonRpcResponse } from 'web3-core-helpers'

import { JsonRpcBatchProvider } from './jsonRpcBatchProvider'
import { getNetworkRpcEndpoint } from './networks/get-network-rpc-endpoint'

function fixChainId(chainId: string | number) {
  return Number(chainId).valueOf()
}

const READ_ONLY_RPC_CALLS = ['eth_call', 'eth_getTransactionReceipt', 'eth_getTransactionByHash']
let jsonRpcBatchProvider: JsonRpcBatchProvider | undefined = undefined
function getHandler(chainIdPromise: Promise<number | string>): ProxyHandler<any> {
  const getReadOnlyProviderAsync = (() => {
    let provider: JsonRpcProvider | undefined = undefined
    return async function (chainIdPromise: Promise<number | string>) {
      if (!provider) {
        const chainId = fixChainId(await chainIdPromise)
        jsonRpcBatchProvider =
          jsonRpcBatchProvider ?? new JsonRpcBatchProvider(getNetworkRpcEndpoint(chainId), chainId)
        provider = jsonRpcBatchProvider
      }
      return provider
    }
  })()

  const getRPCProviderAsync = (() => {
    let provider: JsonRpcProvider | undefined = undefined
    return async function (
      chainIdPromise: Promise<number | string>,
      web3Provider: providers.ExternalProvider,
    ) {
      if (!provider) {
        const chainId = fixChainId(await chainIdPromise)
        provider = new providers.Web3Provider(web3Provider, chainId)
      }
      return provider
    }
  })()

  return {
    get: (target: any, name: string) => {
      if (name === 'sendAsync') {
        return async (
          payload: JSONRPCRequestPayload,
          callback: (error: Error | null, result?: JsonRpcResponse) => void,
        ) => {
          const readOnlyProvider = await getReadOnlyProviderAsync(chainIdPromise)
          const rpcProvider = await getRPCProviderAsync(chainIdPromise, target)
          const provider = includes(READ_ONLY_RPC_CALLS, payload.method)
            ? readOnlyProvider
            : rpcProvider
          try {
            const result = await provider!.send(payload.method, payload.params)
            callback(null, { jsonrpc: payload.jsonrpc, id: payload.id, result })
          } catch (err) {
            callback(err as any)
          }
        }
      } else if (name === 'request') {
        return async (payload: JSONRPCRequestPayload) => {
          const readOnlyProvider = await getReadOnlyProviderAsync(chainIdPromise)
          const rpcProvider = await getRPCProviderAsync(chainIdPromise, target)
          const provider = includes(READ_ONLY_RPC_CALLS, payload.method)
            ? readOnlyProvider
            : rpcProvider

          // Gnosis Safe web3-react provider doesn't implement eth_gasPrice call
          if (payload.method === 'eth_gasPrice') {
            try {
              return await provider!.send(payload.method, payload.params)
            } catch (err) {
              console.error(err)
              return 0
            }
          }

          return await provider!.send(payload.method, payload.params)
        }
      } else {
        return target[name]
      }
    },
  }
}

export function readOnlyEnhanceProvider(provider: any, chainIdPromise: Promise<number | string>) {
  return new Proxy(provider, getHandler(chainIdPromise))
}
