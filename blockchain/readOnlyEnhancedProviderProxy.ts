import { JSONRPCRequestPayload } from 'ethereum-protocol'
import { providers } from 'ethers'
import _ from 'lodash'
import { JsonRpcResponse } from 'web3-core-helpers'

import { networksById } from './config'

const readOnlyProviderByChainId: Record<number, providers.JsonRpcProvider> = {}

async function getReadOnlyProviderAsync(
  chainIdPromise: Promise<number | string>,
): Promise<providers.JsonRpcProvider> {
  let chainId = await chainIdPromise
  if (_.isString(chainId)) {
    chainId = parseInt(chainId, 16)
  }
  if (!readOnlyProviderByChainId[chainId]) {
    readOnlyProviderByChainId[chainId] = new providers.WebSocketProvider(
      networksById[chainId].infuraUrlWS,
      chainId,
    )
  }
  return readOnlyProviderByChainId[chainId]
}

const web3ProviderByChainId: Record<number, providers.Web3Provider> = {}

async function getRPCProviderAsync(
  chainIdPromise: Promise<number | string>,
  web3Provider: providers.ExternalProvider,
): Promise<providers.Web3Provider> {
  let chainId = await chainIdPromise
  if (_.isString(chainId)) {
    chainId = parseInt(chainId, 16)
  }
  if (!web3ProviderByChainId[chainId]) {
    web3ProviderByChainId[chainId] = new providers.Web3Provider(web3Provider, chainId)
  }
  return web3ProviderByChainId[chainId]
}

function getHandler(chainIdPromise: Promise<number | string>): ProxyHandler<any> {
  const handler = {
    get: (target: any, name: string) => {
      if (name === 'sendAsync') {
        // eslint-disable-next-line func-style
        const sendAsyncMaybeReadOnly = async (
          payload: JSONRPCRequestPayload,
          callback: (error: Error | null, result?: JsonRpcResponse) => void,
        ) => {
          const readOnlyProvider = await getReadOnlyProviderAsync(chainIdPromise)
          const rpcProvider = await getRPCProviderAsync(chainIdPromise, target)
          const provider = payload.method === 'eth_call' ? readOnlyProvider : rpcProvider
          try {
            const result = await provider.send(payload.method, payload.params)
            callback(null, { jsonrpc: payload.jsonrpc, id: payload.id, result })
          } catch (err) {
            callback(err)
          }
        }
        return sendAsyncMaybeReadOnly
      } else if (name === 'request') {
        // eslint-disable-next-line func-style
        const requestMaybeReadOnly = async (payload: JSONRPCRequestPayload) => {
          const readOnlyProvider = await getReadOnlyProviderAsync(chainIdPromise)
          const rpcProvider = await getRPCProviderAsync(chainIdPromise, target)
          const provider = payload.method === 'eth_call' ? readOnlyProvider : rpcProvider
          const result = await provider.send(payload.method, payload.params)
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
