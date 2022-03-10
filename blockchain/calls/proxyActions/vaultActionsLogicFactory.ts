import { TransactionDef } from '../callsHelpers'
import {
  DepositAndGenerateData,
  DssProxyActionsSmartContractWrapperInterface,
  OpenData,
  WithdrawAndPaybackData,
} from './adapters/DssProxyActionsSmartContractWrapperInterface'
import { ContextConnected } from '../../network'
import { zero } from '../../../helpers/zero'
import { DsProxy } from '../../../types/web3-v1-contracts/ds-proxy'
import { contractDesc } from '../../config'
import dsProxy from '../../abi/ds-proxy.json'
import { amountToWei } from '../../utils'

export interface VaultActionsLogicInterface {
  open: TransactionDef<OpenData>
  withdrawAndPayback: TransactionDef<WithdrawAndPaybackData>
  depositAndGenerate: TransactionDef<DepositAndGenerateData>
}

export function vaultActionsLogicFactory(
  proxyActionsSmartContractWrapper: DssProxyActionsSmartContractWrapperInterface,
): VaultActionsLogicInterface {
  return {
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
  proxyActionsSmartContractWrapper: DssProxyActionsSmartContractWrapperInterface,
) {
  const { token, withdrawAmount, paybackAmount, shouldPaybackAll } = data

  if (withdrawAmount.gt(zero) && paybackAmount.gt(zero)) {
    if (token === 'ETH') {
      if (shouldPaybackAll) {
        return proxyActionsSmartContractWrapper.wipeAllAndFreeETH(context, data)
      }
      return proxyActionsSmartContractWrapper.wipeAndFreeETH(context, data)
    }

    if (shouldPaybackAll) {
      return proxyActionsSmartContractWrapper.wipeAllAndFreeGem(context, data)
    }
    return proxyActionsSmartContractWrapper.wipeAndFreeGem(context, data)
  }

  if (withdrawAmount.gt(zero)) {
    if (token === 'ETH') {
      return proxyActionsSmartContractWrapper.freeETH(context, data)
    }
    return proxyActionsSmartContractWrapper.freeGem(context, data)
  }

  if (paybackAmount.gt(zero)) {
    if (shouldPaybackAll) {
      return proxyActionsSmartContractWrapper.wipeAll(context, data)
    }
    return proxyActionsSmartContractWrapper.wipe(context, data)
  }

  // would be nice to remove this for Unreachable error case in the future
  throw new Error('Could not make correct proxyActions call')
}

function getDepositAndGenerateCallData(
  data: DepositAndGenerateData,
  context: ContextConnected,
  proxyActionsContract: DssProxyActionsSmartContractWrapperInterface,
) {
  const { token, depositAmount, generateAmount } = data

  if (depositAmount.gt(zero) && generateAmount.gt(zero)) {
    if (token === 'ETH') {
      return proxyActionsContract.lockETHAndDraw(context, data)
    }

    return proxyActionsContract.lockGemAndDraw(context, data)
  }

  if (depositAmount.gt(zero)) {
    if (token === 'ETH') {
      return proxyActionsContract.lockETH(context, data)
    }

    return proxyActionsContract.lockGem(context, data)
  }

  return proxyActionsContract.draw(context, data)
}

function getOpenCallData(
  data: OpenData,
  context: ContextConnected,
  proxyActionWrapper: DssProxyActionsSmartContractWrapperInterface,
) {
  const { depositAmount, generateAmount, token } = data

  if (depositAmount.gt(zero) && generateAmount.gte(zero)) {
    if (token === 'ETH') {
      return proxyActionWrapper.openLockETHAndDraw(context, data)
    }
    return proxyActionWrapper.openLockGemAndDraw(context, data)
  }
  return proxyActionWrapper.open(context, data)
}
