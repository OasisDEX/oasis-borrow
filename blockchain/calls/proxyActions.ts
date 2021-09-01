import { BigNumber } from 'bignumber.js'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { contractDesc } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { amountToWad, amountToWei } from 'blockchain/utils'
import { ExchangeAction } from 'features/exchange/exchange'
import { CloseVaultTo } from 'features/manageMultiplyVault/manageMultiplyVault'
import { one, zero } from 'helpers/zero'
import { DsProxy } from 'types/web3-v1-contracts/ds-proxy'
import { DssProxyActions } from 'types/web3-v1-contracts/dss-proxy-actions'
import { MultiplyProxyActions } from 'types/web3-v1-contracts/multiply-proxy-actions'
import Web3 from 'web3'

import { TxMetaKind } from './txMeta'

export type WithdrawAndPaybackData = {
  kind: TxMetaKind.withdrawAndPayback
  id: BigNumber
  token: string
  ilk: string
  withdrawAmount: BigNumber
  paybackAmount: BigNumber
  proxyAddress: string
  shouldPaybackAll: boolean
}

export function getWithdrawAndPaybackCallData(
  data: WithdrawAndPaybackData,
  context: ContextConnected,
) {
  const { dssProxyActions, dssCdpManager, mcdJoinDai, joins, contract } = context
  const { id, token, withdrawAmount, paybackAmount, ilk, shouldPaybackAll } = data

  if (withdrawAmount.gt(zero) && paybackAmount.gt(zero)) {
    if (token === 'ETH') {
      if (shouldPaybackAll) {
        return contract<DssProxyActions>(dssProxyActions).methods.wipeAllAndFreeETH(
          dssCdpManager.address,
          joins[ilk],
          mcdJoinDai.address,
          id.toString(),
          amountToWei(withdrawAmount, token).toFixed(0),
        )
      }

      return contract<DssProxyActions>(dssProxyActions).methods.wipeAndFreeETH(
        dssCdpManager.address,
        joins[ilk],
        mcdJoinDai.address,
        id.toString(),
        amountToWei(withdrawAmount, token).toFixed(0),
        amountToWei(paybackAmount, 'DAI').toFixed(0),
      )
    }

    if (shouldPaybackAll) {
      return contract<DssProxyActions>(dssProxyActions).methods.wipeAllAndFreeGem(
        dssCdpManager.address,
        joins[ilk],
        mcdJoinDai.address,
        id.toString(),
        amountToWei(withdrawAmount, token).toFixed(0),
      )
    }

    return contract<DssProxyActions>(dssProxyActions).methods.wipeAndFreeGem(
      dssCdpManager.address,
      joins[ilk],
      mcdJoinDai.address,
      id.toString(),
      amountToWei(withdrawAmount, token).toFixed(0),
      amountToWei(paybackAmount, 'DAI').toFixed(0),
    )
  }

  if (withdrawAmount.gt(zero)) {
    if (token === 'ETH') {
      return contract<DssProxyActions>(dssProxyActions).methods.freeETH(
        dssCdpManager.address,
        joins[ilk],
        id.toString(),
        amountToWei(withdrawAmount, token).toFixed(0),
      )
    }
    return contract<DssProxyActions>(dssProxyActions).methods.freeGem(
      dssCdpManager.address,
      joins[ilk],
      id.toString(),
      amountToWei(withdrawAmount, token).toFixed(0),
    )
  }

  if (paybackAmount.gt(zero)) {
    if (shouldPaybackAll) {
      return contract<DssProxyActions>(dssProxyActions).methods.wipeAll(
        dssCdpManager.address,
        mcdJoinDai.address,
        id.toString(),
      )
    }

    return contract<DssProxyActions>(dssProxyActions).methods.wipe(
      dssCdpManager.address,
      mcdJoinDai.address,
      id.toString(),
      amountToWei(paybackAmount, 'DAI').toFixed(0),
    )
  }

  // would be nice to remove this for Unreachable error case in the future
  throw new Error('Could not make correct proxyActions call')
}

export const withdrawAndPayback: TransactionDef<WithdrawAndPaybackData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    const { dssProxyActions } = context
    return [dssProxyActions.address, getWithdrawAndPaybackCallData(data, context).encodeABI()]
  },
}

export type DepositAndGenerateData = {
  kind: TxMetaKind.depositAndGenerate
  id: BigNumber
  token: string
  ilk: string
  depositAmount: BigNumber
  generateAmount: BigNumber
  proxyAddress: string
}

function getDepositAndGenerateCallData(data: DepositAndGenerateData, context: ContextConnected) {
  const { dssProxyActions, dssCdpManager, mcdJoinDai, mcdJug, joins, contract } = context
  const { id, token, depositAmount, generateAmount, ilk } = data

  if (depositAmount.gt(zero) && generateAmount.gt(zero)) {
    if (token === 'ETH') {
      return contract<DssProxyActions>(dssProxyActions).methods.lockETHAndDraw(
        dssCdpManager.address,
        mcdJug.address,
        joins[ilk],
        mcdJoinDai.address,
        id.toString(),
        amountToWei(generateAmount, 'DAI').toFixed(0),
      )
    }
    return contract<DssProxyActions>(dssProxyActions).methods.lockGemAndDraw(
      dssCdpManager.address,
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      id.toString(),
      amountToWei(depositAmount, token).toFixed(0),
      amountToWei(generateAmount, 'DAI').toFixed(0),
      true,
    )
  }

  if (depositAmount.gt(zero)) {
    if (token === 'ETH') {
      return contract<DssProxyActions>(dssProxyActions).methods.lockETH(
        dssCdpManager.address,
        joins[ilk],
        id.toString(),
      )
    }

    return contract<DssProxyActions>(dssProxyActions).methods.lockGem(
      dssCdpManager.address,
      joins[ilk],
      id.toString(),
      amountToWei(depositAmount, token).toFixed(0),
      true,
    )
  }

  return contract<DssProxyActions>(dssProxyActions).methods.draw(
    dssCdpManager.address,
    mcdJug.address,
    mcdJoinDai.address,
    id.toString(),
    amountToWei(generateAmount, 'DAI').toFixed(0),
  )
}

export const depositAndGenerate: TransactionDef<DepositAndGenerateData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    const { dssProxyActions } = context
    return [dssProxyActions.address, getDepositAndGenerateCallData(data, context).encodeABI()]
  },
  options: ({ token, depositAmount }) =>
    token === 'ETH' ? { value: amountToWei(depositAmount, 'ETH').toString() } : {},
}

export type OpenData = {
  kind: TxMetaKind.open
  token: string
  ilk: string
  depositAmount: BigNumber
  generateAmount: BigNumber
  proxyAddress: string
}

function getOpenCallData(data: OpenData, context: ContextConnected) {
  const { dssProxyActions, dssCdpManager, mcdJoinDai, mcdJug, joins, contract } = context
  const { depositAmount, generateAmount, token, ilk, proxyAddress } = data

  if (depositAmount.gt(zero) && generateAmount.gt(zero)) {
    if (token === 'ETH') {
      return contract<DssProxyActions>(dssProxyActions).methods.openLockETHAndDraw(
        dssCdpManager.address,
        mcdJug.address,
        joins[ilk],
        mcdJoinDai.address,
        Web3.utils.utf8ToHex(ilk),
        amountToWei(generateAmount, 'DAI').toFixed(0),
      )
    }

    return contract<DssProxyActions>(dssProxyActions).methods.openLockGemAndDraw(
      dssCdpManager.address,
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      Web3.utils.utf8ToHex(ilk),
      amountToWei(depositAmount, token).toFixed(0),
      amountToWei(generateAmount, 'DAI').toFixed(0),
      true,
    )
  }

  if (depositAmount.gt(zero) && generateAmount.isZero()) {
    if (token === 'ETH') {
      return contract<DssProxyActions>(dssProxyActions).methods.openLockETHAndDraw(
        dssCdpManager.address,
        mcdJug.address,
        joins[ilk],
        mcdJoinDai.address,
        Web3.utils.utf8ToHex(ilk),
        zero.toFixed(0),
      )
    }

    return contract<DssProxyActions>(dssProxyActions).methods.openLockGemAndDraw(
      dssCdpManager.address,
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      Web3.utils.utf8ToHex(ilk),
      amountToWei(depositAmount, token).toFixed(0),
      zero.toFixed(0),
      true,
    )
  }

  return contract<DssProxyActions>(dssProxyActions).methods.open(
    dssCdpManager.address,
    Web3.utils.utf8ToHex(ilk),
    proxyAddress,
  )
}

export const open: TransactionDef<OpenData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    const { dssProxyActions } = context
    return [dssProxyActions.address, getOpenCallData(data, context).encodeABI()]
  },
  options: ({ token, depositAmount }) =>
    token === 'ETH' ? { value: amountToWei(depositAmount, 'ETH').toString() } : {},
}

export type MultiplyData = {
  kind: TxMetaKind.multiply
  token: string
  depositCollateral: BigNumber
  requiredDebt: BigNumber
  borrowedCollateral: BigNumber
  proxyAddress: string
  userAddress: string

  ilk: string

  exchangeAddress: string
  exchangeData: string
  slippage: BigNumber
}
function getOpenMultiplyCallData(data: MultiplyData, context: ContextConnected) {
  const {
    contract,
    joins,
    mcdJug,
    dssCdpManager,
    dssMultiplyProxyActions,
    tokens,
    exchange,
    aaveLendingPool,
  } = context

  return contract<MultiplyProxyActions>(dssMultiplyProxyActions).methods.openMultiplyVault(
    {
      fromTokenAddress: tokens['DAI'].address,
      toTokenAddress: tokens[data.token].address,
      fromTokenAmount: amountToWei(data.requiredDebt, 'DAI').toFixed(0),
      toTokenAmount: amountToWei(data.borrowedCollateral, data.token).toFixed(0),
      minToTokenAmount: amountToWei(data.borrowedCollateral, data.token)
        .div(one.minus(data.slippage))
        .toFixed(0),
      exchangeAddress: data.exchangeAddress,
      _exchangeCalldata: data.exchangeData,
    } as any, //TODO: figure out why Typechain is generating arguments as arrays
    {
      gemJoin: joins[data.ilk],
      cdpId: '0',
      ilk: '0x0000000000000000000000000000000000000000000000000000000000000000',
      fundsReceiver: data.userAddress,
      borrowCollateral: amountToWei(data.borrowedCollateral, data.token).toFixed(0),
      requiredDebt: amountToWei(data.requiredDebt, 'DAI').toFixed(0),
      depositCollateral: amountToWei(data.depositCollateral, data.token).toFixed(0),
      withdrawDai: amountToWei(zero, 'DAI').toFixed(0),
      depositDai: amountToWei(zero, 'DAI').toFixed(0),
      withdrawCollateral: amountToWei(zero, data.token).toFixed(0),
      skipFL: false,
      methodName: '',
    } as any,
    {
      jug: mcdJug.address,
      manager: dssCdpManager.address,
      multiplyProxyActions: dssMultiplyProxyActions.address,
      aaveLendingPoolProvider: aaveLendingPool,
      exchange: exchange.address,
    } as any,
  )
}

export const openMultiplyVault: TransactionDef<MultiplyData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    const { dssMultiplyProxyActions } = context
    return [dssMultiplyProxyActions.address, getOpenMultiplyCallData(data, context).encodeABI()]
  },
  options: ({ token, depositCollateral }) =>
    token === 'ETH' ? { value: amountToWei(depositCollateral, 'ETH').toFixed(0) } : {},
}

export type ReclaimData = {
  kind: TxMetaKind.reclaim
  proxyAddress: string
  amount: BigNumber
  token: string
  id: BigNumber
}

export const reclaim: TransactionDef<ReclaimData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    const { dssProxyActions, dssCdpManager } = context

    return [
      dssProxyActions.address,
      context
        .contract<DssProxyActions>(dssProxyActions)
        .methods.frob(
          dssCdpManager.address,
          data.id.toString(),
          amountToWad(data.amount).toFixed(0),
          zero.toFixed(0),
        )
        .encodeABI(),
    ]
  },
}

export type MultiplyAdjustData = {
  kind: TxMetaKind.adjustPosition
  token: string
  requiredDebt: BigNumber
  proxyAddress: string
  userAddress: string

  depositCollateral: BigNumber
  borrowedCollateral: BigNumber

  ilk: string

  exchangeAddress: string
  exchangeData: string
  slippage: BigNumber

  action: ExchangeAction
  id: BigNumber
}
function getMultiplyAdjustCallData(data: MultiplyAdjustData, context: ContextConnected) {
  const {
    contract,
    joins,
    mcdJug,
    dssCdpManager,
    dssMultiplyProxyActions,
    tokens,
    exchange,
    aaveLendingPool,
  } = context

  if (data.action === 'BUY_COLLATERAL') {
    return contract<MultiplyProxyActions>(dssMultiplyProxyActions).methods.increaseMultiple(
      {
        fromTokenAddress: tokens['DAI'].address,
        toTokenAddress: tokens[data.token].address,
        fromTokenAmount: amountToWei(data.requiredDebt, 'DAI').toFixed(0),
        toTokenAmount: amountToWei(data.borrowedCollateral, data.token).toFixed(0),
        minToTokenAmount: amountToWei(data.borrowedCollateral, data.token)
          .div(one.minus(data.slippage))
          .toFixed(0),
        exchangeAddress: data.exchangeAddress,
        _exchangeCalldata: data.exchangeData,
      } as any,
      {
        gemJoin: joins[data.ilk],
        cdpId: data.id.toString(),
        ilk: '0x0000000000000000000000000000000000000000000000000000000000000000',
        fundsReceiver: data.userAddress,
        borrowCollateral: amountToWei(data.borrowedCollateral, data.token).toFixed(0),
        requiredDebt: amountToWei(data.requiredDebt, 'DAI').toFixed(0),
        depositCollateral: amountToWei(data.depositCollateral, data.token).toFixed(0),
        withdrawDai: amountToWei(zero, 'DAI').toFixed(0),
        depositDai: amountToWei(zero, 'DAI').toFixed(0),
        withdrawCollateral: amountToWei(zero, data.token).toFixed(0),
        skipFL: false,
        methodName: '',
      } as any,
      {
        jug: mcdJug.address,
        manager: dssCdpManager.address,
        multiplyProxyActions: dssMultiplyProxyActions.address,
        aaveLendingPoolProvider: aaveLendingPool,
        exchange: exchange.address,
      } as any,
    )
  } else {
    return contract<MultiplyProxyActions>(dssMultiplyProxyActions).methods.decreaseMultiple(
      {
        fromTokenAddress: tokens[data.token].address,
        toTokenAddress: tokens['DAI'].address,
        toTokenAmount: amountToWei(data.requiredDebt, 'DAI').toFixed(0),
        fromTokenAmount: amountToWei(data.borrowedCollateral, data.token).toFixed(0),
        minToTokenAmount: amountToWei(data.requiredDebt, 'DAI')
          .div(one.minus(data.slippage))
          .toFixed(0),
        exchangeAddress: data.exchangeAddress,
        _exchangeCalldata: data.exchangeData,
      } as any, //TODO: figure out why Typechain is generating arguments as arrays
      {
        gemJoin: joins[data.ilk],
        cdpId: data.id.toString(),
        ilk: '0x0000000000000000000000000000000000000000000000000000000000000000',
        fundsReceiver: data.userAddress,
        borrowCollateral: amountToWei(data.borrowedCollateral, data.token).toFixed(0),
        requiredDebt: amountToWei(data.requiredDebt, 'DAI').toFixed(0),
        depositCollateral: amountToWei(data.depositCollateral, data.token).toFixed(0),
        withdrawDai: amountToWei(zero, 'DAI').toFixed(0),
        depositDai: amountToWei(zero, 'DAI').toFixed(0),
        withdrawCollateral: amountToWei(zero, data.token).toFixed(0),
        skipFL: false,
        methodName: '',
      } as any,
      {
        jug: mcdJug.address,
        manager: dssCdpManager.address,
        multiplyProxyActions: dssMultiplyProxyActions.address,
        aaveLendingPoolProvider: aaveLendingPool,
        exchange: exchange.address,
      } as any,
    )
  }
}

export const adjustMultiplyVault: TransactionDef<MultiplyAdjustData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    const { dssMultiplyProxyActions } = context
    return [dssMultiplyProxyActions.address, getMultiplyAdjustCallData(data, context).encodeABI()]
  },
  options: ({ token, depositCollateral }) =>
    token === 'ETH' ? { value: amountToWei(depositCollateral, token).toFixed(0) } : {},
}

export type CloseVaultData = {
  kind: TxMetaKind.closeVault
  closeTo: CloseVaultTo
  token: string
  ilk: string
  id: BigNumber
  exchangeAddress: string
  userAddress: string
  exchangeData: string
  totalCollateral: BigNumber
  totalDebt: BigNumber
  marketPrice: BigNumber
  slippage: BigNumber
  proxyAddress: string
}

function getCloseVaultCallData(data: CloseVaultData, context: ContextConnected) {
  const {
    contract,
    joins,
    mcdJug,
    dssCdpManager,
    dssMultiplyProxyActions,
    tokens,
    exchange,
    aaveLendingPool,
  } = context

  if (data.closeTo === 'collateral') {
    throw new Error('NOT IMPLEMENTED')
  } else {
    return contract<MultiplyProxyActions>(dssMultiplyProxyActions).methods.closeVaultExitDai(
      {
        fromTokenAddress: tokens[data.token].address,
        toTokenAddress: tokens['DAI'].address,
        fromTokenAmount: amountToWei(data.totalCollateral, data.token).toFixed(0),
        toTokenAmount: amountToWei(data.totalCollateral.times(data.marketPrice), 'DAI').toFixed(0),
        minToTokenAmount: amountToWei(data.totalCollateral.times(data.marketPrice), 'DAI')
          .times(one.minus(data.slippage))
          .toFixed(0),
        exchangeAddress: data.exchangeAddress,
        _exchangeCalldata: data.exchangeData,
      } as any,
      {
        gemJoin: joins[data.ilk],
        cdpId: data.id.toString(),
        ilk: '0x0000000000000000000000000000000000000000000000000000000000000000',
        fundsReceiver: data.userAddress,
        borrowCollateral: amountToWei(data.totalCollateral, data.token).toFixed(0),
        requiredDebt: amountToWei(data.totalDebt.times(one.plus(0.01)), 'DAI').toFixed(0),
        depositCollateral: '0',
        withdrawDai: '0',
        depositDai: '0',
        withdrawCollateral: '0',
        skipFL: false,
        methodName: '',
      } as any,
      {
        jug: mcdJug.address,
        manager: dssCdpManager.address,
        multiplyProxyActions: dssMultiplyProxyActions.address,
        aaveLendingPoolProvider: aaveLendingPool,
        exchange: exchange.address,
      } as any,
    )
  }
}

export const closeVaultCall: TransactionDef<CloseVaultData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    const { dssMultiplyProxyActions } = context
    return [dssMultiplyProxyActions.address, getCloseVaultCallData(data, context).encodeABI()]
  },
}
