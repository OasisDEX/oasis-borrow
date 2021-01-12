import { amountToWei } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'
import * as dsProxy from 'components/blockchain/abi/ds-proxy.abi.json'
import { CallDef, TransactionDef } from 'components/blockchain/calls/callsHelpers'
import { TxMetaKind } from 'components/blockchain/calls/txMeta'
import { contractDesc, getToken } from 'components/blockchain/config'
import { DsProxy } from 'types/web3-v1-contracts/ds-proxy'
import { DssProxyActionsDsr } from 'types/web3-v1-contracts/dss-proxy-actions-dsr'
import { McdPot } from 'types/web3-v1-contracts/mcd-pot'

export const pie: CallDef<string, BigNumber> = {
  call: (_, { contract, mcdPot }) => contract<McdPot>(mcdPot).methods.pie,
  prepareArgs: (proxyAddress) => [proxyAddress],
  postprocess: (result) => new BigNumber(result),
}

export const dsr: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdPot }) => contract<McdPot>(mcdPot).methods.dsr,
  prepareArgs: () => [],
  postprocess: (result) => new BigNumber(result),
}

export const chi: CallDef<void, BigNumber> = {
  call: (_, { contract, mcdPot }) => contract<McdPot>(mcdPot).methods.chi,
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
    contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods.execute,
  prepareArgs: (data, context) => {
    const { amount } = data
    const { contract, dssProxyActionsDsr, mcdJoinDai, mcdPot } = context
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
    contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods.execute,
  prepareArgs: (data, context) => {
    const { amount } = data
    const { contract, dssProxyActionsDsr, mcdJoinDai, mcdPot } = context
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
    contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods.execute,
  prepareArgs: (_data, context) => {
    const { contract, dssProxyActionsDsr, mcdJoinDai, mcdPot } = context
    return [
      dssProxyActionsDsr.address,
      contract<DssProxyActionsDsr>(dssProxyActionsDsr)
        .methods.exitAll(mcdJoinDai.address, mcdPot.address)
        .encodeABI(),
    ]
  },
}
