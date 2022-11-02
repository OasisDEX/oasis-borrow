import { Context } from 'blockchain/network'
import { ethers } from 'ethers'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { default as arbitrumGoerliAddreses } from './addresses/arbitrum-goerli.json'

const ARBITRUM_GOERLI_RPC = 'https://goerli-rollup.arbitrum.io/rpc'
const arbitrumGoerliHttpProvider = new ethers.providers.JsonRpcProvider(ARBITRUM_GOERLI_RPC)

const resolverInterface = new ethers.utils.Interface([
  'function getFirstDefaultDomain(address _addr) public view returns(string memory)',
])

export function resolvePunkName$(context$: Observable<Context>, address: string) {
  return context$.pipe(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    switchMap(async (context) => {
      return await arbitrumGoerliHttpProvider
        .call({
          to: arbitrumGoerliAddreses['PUNK_DOMAINS_RESOLVER'],
          data: resolverInterface.encodeFunctionData('getFirstDefaultDomain', [address]),
        })
        .then((result) => {
          return resolverInterface.decodeFunctionResult('getFirstDefaultDomain', result)[0]
        })
    }),
  )
}
