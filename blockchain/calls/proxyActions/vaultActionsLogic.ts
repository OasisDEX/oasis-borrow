import { zero } from 'helpers/zero'
import { DsProxy } from 'types/web3-v1-contracts/ds-proxy'

import dsProxy from '../../abi/ds-proxy.json'
import { contractDesc } from '../../config'
import { ContextConnected } from '../../network'
import { amountToWei } from '../../utils'
import { TransactionDef } from '../callsHelpers'
import {
  ClaimRewardData,
  DepositAndGenerateData,
  OpenData,
  ProxyActionsSmartContractAdapterInterface,
  WithdrawAndPaybackData,
} from './adapters/ProxyActionsSmartContractAdapterInterface'

export interface VaultActionsLogicInterface {
  open: TransactionDef<OpenData>
  withdrawAndPayback: TransactionDef<WithdrawAndPaybackData>
  depositAndGenerate: TransactionDef<DepositAndGenerateData>
  claimReward: TransactionDef<ClaimRewardData>
}

export function vaultActionsLogic(
  proxyActionsSmartContractWrapper: ProxyActionsSmartContractAdapterInterface,
): VaultActionsLogicInterface {
  return {
    claimReward: {
      call: ({ proxyAddress }, { contract }) => {
        return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods[
          'execute(address,bytes)'
        ]
      },
      prepareArgs: (data, context) => {
        return [
          proxyActionsSmartContractWrapper.resolveContractAddress(context),
          proxyActionsSmartContractWrapper.claimRewards(context, data).encodeABI(),
        ]
      },
    },
    open: {
      call: ({ proxyAddress }, { contract }) => {
        return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods[
          'execute(address,bytes)'
        ]
      },
      prepareArgs: (data, context) => {
        return [
          proxyActionsSmartContractWrapper.resolveContractAddress(context),
          getOpenCallData(data, context, proxyActionsSmartContractWrapper).encodeABI(),
        ]
      },
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

export function getWithdrawAndPaybackCallData(
  data: WithdrawAndPaybackData,
  context: ContextConnected,
  proxyActionsSmartContractAdapter: ProxyActionsSmartContractAdapterInterface,
) {
  const { token, withdrawAmount, paybackAmount, shouldPaybackAll } = data

  if (withdrawAmount.gt(zero) && paybackAmount.gt(zero)) {
    if (token === 'ETH') {
      if (shouldPaybackAll) {
        return proxyActionsSmartContractAdapter.wipeAllAndFreeETH(context, data)
      }
      return proxyActionsSmartContractAdapter.wipeAndFreeETH(context, data)
    }

    if (shouldPaybackAll) {
      return proxyActionsSmartContractAdapter.wipeAllAndFreeGem(context, data)
    }
    return proxyActionsSmartContractAdapter.wipeAndFreeGem(context, data)
  }

  if (withdrawAmount.gt(zero)) {
    if (token === 'ETH') {
      return proxyActionsSmartContractAdapter.freeETH(context, data)
    }
    return proxyActionsSmartContractAdapter.freeGem(context, data)
  }

  if (paybackAmount.gt(zero)) {
    if (shouldPaybackAll) {
      return proxyActionsSmartContractAdapter.wipeAll(context, data)
    }
    return proxyActionsSmartContractAdapter.wipe(context, data)
  }

  // would be nice to remove this for Unreachable error case in the future
  throw new Error('Could not make correct proxyActions call')
}

function getDepositAndGenerateCallData(
  data: DepositAndGenerateData,
  context: ContextConnected,
  proxyActionsContractAdapter: ProxyActionsSmartContractAdapterInterface,
) {
  const { token, depositAmount, generateAmount } = data

  if (depositAmount.gt(zero) && generateAmount.gt(zero)) {
    if (token === 'ETH') {
      return proxyActionsContractAdapter.lockETHAndDraw(context, data)
    }

    return proxyActionsContractAdapter.lockGemAndDraw(context, data)
  }

  if (depositAmount.gt(zero)) {
    if (token === 'ETH') {
      return proxyActionsContractAdapter.lockETH(context, data)
    }

    return proxyActionsContractAdapter.lockGem(context, data)
  }

  return proxyActionsContractAdapter.draw(context, data)
}

function getOpenCallData(
  data: OpenData,
  context: ContextConnected,
  proxyActionAdapter: ProxyActionsSmartContractAdapterInterface,
) {
  const { depositAmount, generateAmount, token } = data

  if (depositAmount.gt(zero) && generateAmount.gte(zero)) {
    if (token === 'ETH') {
      return proxyActionAdapter.openLockETHAndDraw(context, data)
    }
    return proxyActionAdapter.openLockGemAndDraw(context, data)
  }
  return proxyActionAdapter.open(context, data)
}
