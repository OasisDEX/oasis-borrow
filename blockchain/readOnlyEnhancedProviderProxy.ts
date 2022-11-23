import { JsonRpcProvider, Provider } from '@ethersproject/providers'
import { JSONRPCRequestPayload } from 'ethereum-protocol'
import { providers as ethersProviders } from 'ethers'
import { providers as multicallProvider } from '@0xsequence/multicall'
import _ from 'lodash'
import { JsonRpcResponse } from 'web3-core-helpers'

import { networksById } from './config'

function fixChainId(chainId: string | number) {
  // eslint-disable-next-line no-new-wrappers
  return new Number(chainId).valueOf()
}

function getHandler(chainIdPromise: Promise<number | string>): ProxyHandler<any> {
  const getReadOnlyProviderAsync = (() => {
    let provider: Provider | undefined = undefined
    return async function (chainIdPromise: Promise<number | string>) {
      if (!provider) {
        const chainId = fixChainId(await chainIdPromise)
        const ethersProvider = new ethersProviders.JsonRpcProvider(networksById[chainId].infuraUrl, chainId);
        const multicall =  new multicallProvider.MulticallProvider(ethersProvider);
        provider = multicall;
      }
      return provider
    }
  })()

  const getRPCProviderAsync = (() => {
    let provider: JsonRpcProvider | undefined = undefined
    return async function (
      chainIdPromise: Promise<number | string>,
      web3Provider: ethersProviders.ExternalProvider,
    ) {
      if (!provider) {
        const chainId = fixChainId(await chainIdPromise)
        provider = new ethersProviders.Web3Provider(web3Provider, chainId)
      }
      return provider
    }
  })()

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
          if(payload.method === 'eth_call') {
            console.log("new eth_call");
            try {
              const result = await readOnlyProvider!.call(payload.params[0]);
              console.log("eth_call executed");
              callback(null, { jsonrpc: payload.jsonrpc, id: payload.id, result })
            } catch (err) {
              callback(err as any)
            }
          }else
          if (payload.method === 'eth_getTransactionByHash') {
            try {
              console.log("new eth_getTransactionByHash");
              const result = await readOnlyProvider!.getTransaction(payload.params[0]);
              console.log("eth_getTransactionByHash executed");
              callback(null, { jsonrpc: payload.jsonrpc, id: payload.id, result })
            } catch (err) {
              callback(err as any)
            }
          }else
            if(payload.method === 'eth_getTransactionReceipt') {
              try {
                console.log("new eth_getTransactionReceipt");
                const result = await readOnlyProvider!.getTransactionReceipt(payload.params[0]);
                console.log("eth_getTransactionReceipt executed");
                callback(null, { jsonrpc: payload.jsonrpc, id: payload.id, result })
              } catch (err) {
                callback(err as any)
              }
            }
            else{
              try {
                const result = await rpcProvider.send(payload.method, payload.params)
                callback(null, { jsonrpc: payload.jsonrpc, id: payload.id, result })
              } catch (err) {
                callback(err as any)
              }
            }
          
         
        }
        return sendAsyncMaybeReadOnly
      } else if (name === 'request') {
        // eslint-disable-next-line func-style
        const requestMaybeReadOnly = async (payload: JSONRPCRequestPayload) => {
          console.log("request not implemented:"+payload.method);
          const rpcProvider = await getRPCProviderAsync(chainIdPromise, target)
          
          // Gnosis Safe web3-react provider doesn't implement eth_gasPrice call
          if (payload.method === 'eth_gasPrice') {
            try {
              const result = await rpcProvider.send(payload.method, payload.params)
              return result
            } catch (err) {
              console.log(err)
              return 0
            }
          }

          const result = await rpcProvider.send(payload.method, payload.params)
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
