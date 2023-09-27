import type { ethers } from 'ethers'
import type {
  ContractDesc,
  Web3ContextConnected,
  Web3ContextConnectedReadonly,
} from 'features/web3Context'
import type { Observable } from 'rxjs'
import type Web3 from 'web3'

import type { NetworkConfig } from './networks'

interface WithContractMethod {
  contract: <T>(desc: ContractDesc) => T

  /**
   * @deprecated user `networkById[networkId].readProvider` instead. This is set only for mainnet
   */
  rpcProvider: ethers.providers.StaticJsonRpcProvider
}
interface WithWeb3ProviderGetPastLogs {
  web3ProviderGetPastLogs: Web3
}

export type ContextConnectedReadOnly = NetworkConfig &
  Web3ContextConnectedReadonly &
  WithContractMethod &
  WithWeb3ProviderGetPastLogs & { account: undefined }

export type ContextConnected = NetworkConfig &
  Web3ContextConnected &
  WithContractMethod &
  WithWeb3ProviderGetPastLogs

export type Context = ContextConnected | ContextConnectedReadOnly

export type EveryBlockFunction$ = <O>(
  o$: Observable<O>,
  compare?: (x: O, y: O) => boolean,
) => Observable<O>
