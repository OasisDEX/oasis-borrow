import { amountToWei } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'
import * as dsProxy from 'blockchain/abi/ds-proxy.json'
import { CallDef, TransactionDef } from 'blockchain/calls/callsHelpers'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import { contractDesc } from 'blockchain/networksConfig'
import { getToken } from 'blockchain/tokensMetadata'
import { DsProxy, DssProxyActionsDsr, McdPot } from 'types/web3-v1-contracts'

export const pie: CallDef<string, BigNumber> = {
  call: (_, { contract, chainId }) =>
    contract<McdPot>(getNetworkContracts(chainId).mcdPot).methods.pie,
  prepareArgs: (proxyAddress) => [proxyAddress],
  postprocess: (result) => new BigNumber(result),
}

export const Pie: CallDef<void, BigNumber> = {
  call: (_, { contract, chainId }) =>
    contract<McdPot>(getNetworkContracts(chainId).mcdPot).methods.Pie,
  prepareArgs: () => [],
  postprocess: (result) => new BigNumber(result),
}

export const dsr: CallDef<void, BigNumber> = {
  call: (_, { contract, chainId }) =>
    contract<McdPot>(getNetworkContracts(chainId).mcdPot).methods.dsr,
  prepareArgs: () => [],
  postprocess: (result) => new BigNumber(result),
}

export const chi: CallDef<void, BigNumber> = {
  call: (_, { contract, chainId }) =>
    contract<McdPot>(getNetworkContracts(chainId).mcdPot).methods.chi,
  prepareArgs: () => [],
  postprocess: (result) => new BigNumber(result),
}

export type DsrJoinData = {
  kind: TxMetaKind.dsrJoin
  proxyAddress: string
  amount: BigNumber
}

export const join: TransactionDef<DsrJoinData> = {
  call: ({ proxyAddress }, { contract }) =>
    contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)'],
  prepareArgs: (data, context) => {
    const { amount } = data
    const { contract } = context
    const { dssProxyActionsDsr, mcdJoinDai, mcdPot } = getNetworkContracts(context.chainId)
    return [
      dssProxyActionsDsr.address,
      contract<DssProxyActionsDsr>(dssProxyActionsDsr)
        .methods.join(
          mcdJoinDai.address,
          mcdPot.address,
          amountToWei(amount, getToken('DAI').precision).toFixed(0),
        )
        .encodeABI(),
    ]
  },
}

export type DsrExitData = {
  kind: TxMetaKind.dsrExit
  proxyAddress: string
  amount: BigNumber
}

export const exit: TransactionDef<DsrExitData> = {
  call: ({ proxyAddress }, { contract }) =>
    contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)'],
  prepareArgs: (data, context) => {
    const { amount } = data
    const { contract } = context
    const { dssProxyActionsDsr, mcdJoinDai, mcdPot } = getNetworkContracts(context.chainId)
    return [
      dssProxyActionsDsr.address,
      contract<DssProxyActionsDsr>(dssProxyActionsDsr)
        .methods.exit(
          mcdJoinDai.address,
          mcdPot.address,
          amountToWei(amount, getToken('DAI').precision).toFixed(0),
        )
        .encodeABI(),
    ]
  },
}

export type DsrExitAllData = {
  kind: TxMetaKind.dsrExitAll
  proxyAddress: string
}

export const exitAll: TransactionDef<DsrExitAllData> = {
  call: ({ proxyAddress }, { contract }) =>
    contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)'],
  prepareArgs: (data, context) => {
    const { contract } = context
    const { dssProxyActionsDsr, mcdJoinDai, mcdPot } = getNetworkContracts(context.chainId)
    return [
      dssProxyActionsDsr.address,
      contract<DssProxyActionsDsr>(dssProxyActionsDsr)
        .methods.exitAll(mcdJoinDai.address, mcdPot.address)
        .encodeABI(),
    ]
  },
}
