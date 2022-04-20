import { ContractDesc } from '@oasisdex/web3-context'
import {
  getDepositAndGenerateCallData,
  getOpenCallData,
  getWithdrawAndPaybackCallData,
} from 'blockchain/calls/proxyActions/vaultActionsLogic'
import sinon from 'sinon'

import * as dsProxy from '../../blockchain/abi/ds-proxy.json'
import { TransactionDef } from '../../blockchain/calls/callsHelpers'
import {
  DepositAndGenerateData,
  OpenData,
  ProxyActionsSmartContractAdapterInterface,
  WithdrawAndPaybackData,
} from '../../blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import { contractDesc } from '../../blockchain/config'
import { amountToWei } from '../../blockchain/utils'
import { DsProxy } from '../../types/web3-v1-contracts/ds-proxy'

export interface VaultActionsLogicInterface {
  open: TransactionDef<OpenData>
  withdrawAndPayback: TransactionDef<WithdrawAndPaybackData>
  depositAndGenerate: TransactionDef<DepositAndGenerateData>
}

const open = {
  call: function openCall(
    { proxyAddress }: { proxyAddress: string },
    { contract }: { contract: <T>(desc: ContractDesc) => T },
  ) {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
}

export const openCallSpy = sinon.spy(open, 'call')

export function mockVaultActionsLogic(
  proxyActionsSmartContractWrapper: ProxyActionsSmartContractAdapterInterface,
): VaultActionsLogicInterface {
  return {
    open: {
      prepareArgs: (data, context) => {
        return [
          proxyActionsSmartContractWrapper.resolveContractAddress(context),
          getOpenCallData(data, context, proxyActionsSmartContractWrapper).encodeABI(),
        ]
      },
      ...open,
      options: ({ token, depositAmount }) =>
        token === 'ETH' ? { value: amountToWei(depositAmount, 'ETH').toString() } : {},
    },
    withdrawAndPayback: {
      call: ({ proxyAddress }, { contract }) => {
        return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods[
          'execute(address,bytes)'
        ]
      },
      prepareArgs: (data, context) => {
        return [
          proxyActionsSmartContractWrapper.resolveContractAddress(context),
          getWithdrawAndPaybackCallData(
            data,
            context,
            proxyActionsSmartContractWrapper,
          ).encodeABI(),
        ]
      },
    },
    depositAndGenerate: {
      call: ({ proxyAddress }, { contract }) => {
        return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods[
          'execute(address,bytes)'
        ]
      },
      prepareArgs: (data, context) => {
        return [
          proxyActionsSmartContractWrapper.resolveContractAddress(context),
          getDepositAndGenerateCallData(
            data,
            context,
            proxyActionsSmartContractWrapper,
          ).encodeABI(),
        ]
      },
      options: ({ token, depositAmount }) =>
        token === 'ETH' ? { value: amountToWei(depositAmount, 'ETH').toString() } : {},
    },
  }
}
