import { JsonRpcProvider } from '@ethersproject/providers'
import { JSONRPCRequestPayload } from 'ethereum-types'
import { providers } from 'ethers'
import { skipCache } from 'helpers/api/skipCache'
import { getNetworkRpcEndpoint } from 'helpers/networkHelpers'
import _ from 'lodash'
import { JsonRpcResponse } from 'web3-core-helpers'

import { JsonRpcBatchProvider } from './jsonRpcBatchProvider'
import { JsonRpcCachedProvider } from './jsonRpcCachedProvider'
import { NetworkIds } from './networkIds'

function fixChainId(chainId: string | number) {
  // eslint-disable-next-line no-new-wrappers
  return new Number(chainId).valueOf()
}

const READ_ONLY_RPC_CALLS = ['eth_call', 'eth_getTransactionReceipt', 'eth_getTransactionByHash']
let jsonRpcBatchProvider: JsonRpcBatchProvider | undefined = undefined
function getHandler(chainIdPromise: Promise<number | string>): ProxyHandler<any> {
  const getReadOnlyProviderAsync = (() => {
    let provider: JsonRpcProvider | undefined = undefined
    return async function (chainIdPromise: Promise<number | string>) {
      if (!provider) {
        const chainId = fixChainId(await chainIdPromise)
        if (jsonRpcBatchProvider === undefined) {
          jsonRpcBatchProvider = new JsonRpcBatchProvider(
            getNetworkRpcEndpoint(NetworkIds.MAINNET, chainId),
            chainId,
          )
          provider = skipCache(chainId)
            ? jsonRpcBatchProvider
            : new JsonRpcCachedProvider(getNetworkRpcEndpoint(NetworkIds.MAINNET, chainId), chainId)
        } else {
          provider = jsonRpcBatchProvider
        }
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

  const handler = {
    get: (target: any, name: string) => {
      if (name === 'sendAsync') {
        const sendAsyncMaybeReadOnly = async (
          payload: JSONRPCRequestPayload,
          callback: (error: Error | null, result?: JsonRpcResponse) => void,
        ) => {
          const readOnlyProvider = await getReadOnlyProviderAsync(chainIdPromise)
          const rpcProvider = await getRPCProviderAsync(chainIdPromise, target)
          const provider = _.includes(READ_ONLY_RPC_CALLS, payload.method)
            ? readOnlyProvider
            : rpcProvider
          try {
            const result = await provider!.send(payload.method, payload.params)
            callback(null, { jsonrpc: payload.jsonrpc, id: payload.id, result })
          } catch (err) {
            callback(err as any)
          }
        }
        return sendAsyncMaybeReadOnly
      } else if (name === 'request') {
        const requestMaybeReadOnly = async (payload: JSONRPCRequestPayload) => {
          const readOnlyProvider = await getReadOnlyProviderAsync(chainIdPromise)
          const rpcProvider = await getRPCProviderAsync(chainIdPromise, target)
          const provider = _.includes(READ_ONLY_RPC_CALLS, payload.method)
            ? readOnlyProvider
            : rpcProvider

          // Gnosis Safe web3-react provider doesn't implement eth_gasPrice call
          if (payload.method === 'eth_gasPrice') {
            try {
              const result = await provider!.send(payload.method, payload.params)
              return result
            } catch (err) {
              console.log(err)
              return 0
            }
          }

          const result = await provider!.send(payload.method, payload.params)
          return result
        }
        return requestMaybeReadOnly
      } else {
        return target[name]
      }
    },
  }
  return handler
}

export function readOnlyEnhanceProvider(provider: any, chainIdPromise: Promise<number | string>) {
  return new Proxy(provider, getHandler(chainIdPromise))
}
