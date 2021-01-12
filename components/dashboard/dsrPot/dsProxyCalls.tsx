import * as dsProxy from 'components/blockchain/abi/ds-proxy.abi.json'
import { CallDef, TransactionDef } from 'components/blockchain/calls/callsHelpers'
import { TxMetaKind } from 'components/blockchain/calls/txMeta'
import { contractDesc } from 'components/blockchain/config'
import { DsProxy } from 'types/web3-v1-contracts/ds-proxy'
import { DsProxyRegistry } from 'types/web3-v1-contracts/ds-proxy-registry'

export const proxyAddress: CallDef<string, string | undefined> = {
  call: (_, { dsProxyRegistry, contract }) =>
    contract<DsProxyRegistry>(dsProxyRegistry).methods.proxies,
  prepareArgs: (address) => [address],
}

export const owner: CallDef<string, string | undefined> = {
  call: (dsProxyAddress, { contract }) =>
    contract<DsProxy>(contractDesc(dsProxy, dsProxyAddress)).methods.owner,
  prepareArgs: () => [],
}

export type SetupDSProxyData = {
  kind: TxMetaKind.setupDSProxy
}
export const setupDSProxy: TransactionDef<SetupDSProxyData> = {
  call: (_, { dsProxyRegistry, contract }) =>
    contract<DsProxyRegistry>(dsProxyRegistry).methods.build,
  prepareArgs: () => [],
}

export type SetOwnerData = {
  kind: TxMetaKind.setOwner
  proxyAddress: string
  owner: string
}

export const setOwner: TransactionDef<SetOwnerData> = {
  call: ({ proxyAddress }, { contract }) =>
    contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods.setOwner,
  prepareArgs: ({ owner }: SetOwnerData) => [owner],
  options: () => ({ gas: 1000000 }),
}
