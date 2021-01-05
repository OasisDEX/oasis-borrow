import * as dsProxy from 'components/blockchain/abi/ds-proxy.abi.json'
import { CallDef, TransactionDef } from 'components/blockchain/calls/callsHelpers'
import { TxMetaKind } from 'components/blockchain/calls/txMeta'
import { contractDesc } from 'components/blockchain/config'

export const proxyAddress: CallDef<string, string | undefined> = {
  call: (_, { dsProxyRegistry, contract }) => contract(dsProxyRegistry).methods.proxies,
  prepareArgs: (address) => [address],
}

export const owner: CallDef<string, string | undefined> = {
  call: (dsProxyAddress, { contract }) =>
    contract(contractDesc(dsProxy, dsProxyAddress)).methods.owner,
  prepareArgs: () => [],
}

export type SetupDSProxyData = {
  kind: TxMetaKind.setupDSProxy
}
export const setupDSProxy: TransactionDef<SetupDSProxyData> = {
  call: (_, { dsProxyRegistry, contract }) => contract(dsProxyRegistry).methods['build()'],
  prepareArgs: () => [],
}

export type SetOwnerData = {
  kind: TxMetaKind.setOwner
  proxyAddress: string
  owner: string
}

export const setOwner: TransactionDef<SetOwnerData> = {
  call: ({ proxyAddress }, { contract }) =>
    contract(contractDesc(dsProxy, proxyAddress)).methods.setOwner,
  prepareArgs: ({ owner }: SetOwnerData) => [owner],
  options: () => ({ gas: 1000000 }),
}
