import { BigNumber } from 'bignumber.js'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { contractDesc } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWad, amountToWei } from 'blockchain/utils'
import { ExchangeAction } from 'features/exchange/exchange'
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { one, zero } from 'helpers/zero'
import { DssGuniProxyActions } from 'types/ethers-contracts'
import { DsProxy } from 'types/web3-v1-contracts/ds-proxy'
import { DssProxyActions } from 'types/web3-v1-contracts/dss-proxy-actions'
import { MultiplyProxyActions } from 'types/web3-v1-contracts/multiply-proxy-actions'

import { TxMetaKind } from '../txMeta'
import { StandardDssProxyActionsContractAdapter } from './adapters/standardDssProxyActionsContractAdapter'
import { getWithdrawAndPaybackCallData } from './vaultActionsLogic'

export type OpenMultiplyData = {
  kind: TxMetaKind.multiply
  token: string
  depositCollateral: BigNumber
  requiredDebt: BigNumber
  borrowedCollateral: BigNumber
  skipFL: boolean
  proxyAddress: string
  userAddress: string
  toTokenAmount: BigNumber
  fromTokenAmount: BigNumber

  ilk: string

  exchangeAddress: string
  exchangeData: string
}

function getOpenMultiplyCallData(data: OpenMultiplyData, context: ContextConnected) {
  const {
    contract,
    defaultExchange,
    joins,
    mcdJug,
    dssCdpManager,
    dssMultiplyProxyActions,
    tokens,
    fmm,
  } = context

  const exchangeData = {
    fromTokenAddress: tokens['DAI'].address,
    toTokenAddress: tokens[data.token].address,
    fromTokenAmount: amountToWei(data.fromTokenAmount, 'DAI').toFixed(0),
    toTokenAmount: amountToWei(data.toTokenAmount, data.token).toFixed(0),
    minToTokenAmount: amountToWei(data.borrowedCollateral, data.token).toFixed(0),
    exchangeAddress: data.exchangeAddress,
    _exchangeCalldata: data.exchangeData,
  }
  const cdpData = {
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
    skipFL: data.skipFL,
    methodName: '',
  }
  const addressRegistry = {
    jug: mcdJug.address,
    manager: dssCdpManager.address,
    multiplyProxyActions: dssMultiplyProxyActions.address,
    lender: fmm,
    exchange: defaultExchange.address,
  }

  //TODO: figure out why Typechain is generating arguments as arrays
  return contract<MultiplyProxyActions>(dssMultiplyProxyActions).methods.openMultiplyVault(
    exchangeData as any,
    cdpData as any,
    addressRegistry as any,
  )
}

export const openMultiplyVault: TransactionDef<OpenMultiplyData> = {
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

export type OpenGuniMultiplyData = {
  kind: TxMetaKind.openGuni
  token: string
  depositCollateral: BigNumber
  requiredDebt: BigNumber
  minToTokenAmount: BigNumber
  proxyAddress: string
  userAddress: string
  toTokenAmount: BigNumber
  fromTokenAmount: BigNumber

  ilk: string

  exchangeAddress: string
  exchangeData: string
  token0Amount: BigNumber
}

function getOpenGuniMultiplyCallData(data: OpenGuniMultiplyData, context: ContextConnected) {
  const {
    contract,
    joins,
    mcdJug,
    dssCdpManager,
    tokens,
    fmm,
    guniResolver,
    guniProxyActions,
    guniRouter,
  } = context

  const exchange = context['lowerFeesExchange']

  const tokenData = getToken(data.token)

  const token0Symbol = tokenData.token0
  const token1Symbol = tokenData.token1

  if (!token0Symbol || !token1Symbol) {
    throw new Error('Invalid token')
  }

  return contract<DssGuniProxyActions>(guniProxyActions).methods.openMultiplyGuniVault(
    {
      fromTokenAddress: tokens[token0Symbol].address,
      toTokenAddress: tokens[token1Symbol].address,
      fromTokenAmount: amountToWei(data.fromTokenAmount, token0Symbol).toFixed(0),
      toTokenAmount: amountToWei(data.toTokenAmount, token1Symbol).toFixed(0),
      minToTokenAmount: amountToWei(data.minToTokenAmount, token1Symbol).toFixed(0),
      exchangeAddress: data.exchangeAddress,
      _exchangeCalldata: data.exchangeData,
    } as any, //TODO: figure out why Typechain is generating arguments as arrays
    {
      gemJoin: joins[data.ilk],
      fundsReceiver: data.userAddress,
      cdpId: '0',
      ilk: '0x0000000000000000000000000000000000000000000000000000000000000000',
      requiredDebt: amountToWei(data.requiredDebt, 'DAI').toFixed(0),
      token0Amount: amountToWei(data.depositCollateral, token0Symbol).toFixed(0),
      methodName: '',
    } as any,
    {
      jug: mcdJug.address,
      guni: tokens[data.token].address,
      resolver: guniResolver,
      router: guniRouter,
      otherToken: tokens[token1Symbol].address,
      manager: dssCdpManager.address,
      guniProxyActions: guniProxyActions.address,
      lender: fmm,
      exchange: exchange.address,
    } as any,
  )
}

export const openGuniMultiplyVault: TransactionDef<OpenGuniMultiplyData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    const { guniProxyActions } = context
    return [guniProxyActions.address, getOpenGuniMultiplyCallData(data, context).encodeABI()]
  },
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
  depositDai: BigNumber
  withdrawCollateral: BigNumber
  withdrawDai: BigNumber
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
    defaultExchange,
    joins,
    mcdJug,
    dssCdpManager,
    dssMultiplyProxyActions,
    tokens,
    fmm,
  } = context

  if (data.action === 'BUY_COLLATERAL') {
    const exchangeData = {
      fromTokenAddress: tokens['DAI'].address,
      toTokenAddress: tokens[data.token].address,
      fromTokenAmount: amountToWei(data.requiredDebt, 'DAI').toFixed(0),
      toTokenAmount: amountToWei(data.borrowedCollateral, data.token).toFixed(0),
      minToTokenAmount: amountToWei(data.borrowedCollateral, data.token)
        .times(one.minus(data.slippage))
        .toFixed(0),
      exchangeAddress: data.exchangeAddress,
      _exchangeCalldata: data.exchangeData,
    } as any
    const cdpData = {
      gemJoin: joins[data.ilk],
      cdpId: data.id.toString(),
      ilk: '0x0000000000000000000000000000000000000000000000000000000000000000',
      fundsReceiver: data.userAddress,
      borrowCollateral: amountToWei(data.borrowedCollateral, data.token).toFixed(0),
      requiredDebt: amountToWei(data.requiredDebt, 'DAI').toFixed(0),
      depositCollateral: amountToWei(data.depositCollateral, data.token).toFixed(0),
      withdrawDai: amountToWei(zero, 'DAI').toFixed(0),
      depositDai: amountToWei(data.depositDai, 'DAI').toFixed(0),
      withdrawCollateral: amountToWei(zero, data.token).toFixed(0),
      skipFL: false,
      methodName: '',
    } as any
    const serviceRegistry = {
      jug: mcdJug.address,
      manager: dssCdpManager.address,
      multiplyProxyActions: dssMultiplyProxyActions.address,
      lender: fmm,
      exchange: defaultExchange.address,
    } as any

    if (data.depositCollateral.gt(zero)) {
      return contract<MultiplyProxyActions>(
        dssMultiplyProxyActions,
      ).methods.increaseMultipleDepositCollateral(exchangeData, cdpData, serviceRegistry)
    }

    if (data.depositDai.gt(zero)) {
      return contract<MultiplyProxyActions>(
        dssMultiplyProxyActions,
      ).methods.increaseMultipleDepositDai(exchangeData, cdpData, serviceRegistry)
    }

    return contract<MultiplyProxyActions>(dssMultiplyProxyActions).methods.increaseMultiple(
      exchangeData,
      cdpData,
      serviceRegistry,
    )
  } else {
    const exchangeData = {
      fromTokenAddress: tokens[data.token].address,
      toTokenAddress: tokens['DAI'].address,
      toTokenAmount: amountToWei(
        data.requiredDebt
          .div(one.minus(OAZO_FEE))
          .div(one.minus(LOAN_FEE))
          .times(one.plus(data.slippage)),
        'DAI',
      ).toFixed(0),
      fromTokenAmount: amountToWei(data.borrowedCollateral, data.token).toFixed(0),
      minToTokenAmount: amountToWei(data.requiredDebt, 'DAI')
        .div(one.minus(OAZO_FEE))
        .div(one.minus(LOAN_FEE))
        .toFixed(0),
      exchangeAddress: data.exchangeAddress,
      _exchangeCalldata: data.exchangeData,
    } as any
    const cdpData = {
      gemJoin: joins[data.ilk],
      cdpId: data.id.toString(),
      ilk: '0x0000000000000000000000000000000000000000000000000000000000000000',
      fundsReceiver: data.userAddress,
      borrowCollateral: amountToWei(data.borrowedCollateral, data.token).toFixed(0),
      requiredDebt: amountToWei(data.requiredDebt, 'DAI').toFixed(0),
      depositCollateral: amountToWei(data.depositCollateral, data.token).toFixed(0),
      withdrawDai: amountToWei(data.withdrawDai, 'DAI').toFixed(0),
      depositDai: amountToWei(zero, 'DAI').toFixed(0),
      withdrawCollateral: amountToWei(data.withdrawCollateral, data.token).toFixed(0),
      skipFL: false,
      methodName: '',
    } as any
    const serviceRegistry = {
      jug: mcdJug.address,
      manager: dssCdpManager.address,
      multiplyProxyActions: dssMultiplyProxyActions.address,
      lender: fmm,
      exchange: defaultExchange.address,
    } as any

    if (data.withdrawCollateral.gt(zero)) {
      return contract<MultiplyProxyActions>(
        dssMultiplyProxyActions,
      ).methods.decreaseMultipleWithdrawCollateral(exchangeData, cdpData, serviceRegistry)
    }

    if (data.withdrawDai.gt(zero)) {
      return contract<MultiplyProxyActions>(
        dssMultiplyProxyActions,
      ).methods.decreaseMultipleWithdrawDai(exchangeData, cdpData, serviceRegistry)
    }

    return contract<MultiplyProxyActions>(dssMultiplyProxyActions).methods.decreaseMultiple(
      exchangeData,
      cdpData,
      serviceRegistry,
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
  proxyAddress: string
  fromTokenAmount: BigNumber
  toTokenAmount: BigNumber
  minToTokenAmount: BigNumber
}

function getCloseVaultCallData(data: CloseVaultData, context: ContextConnected) {
  const {
    contract,
    defaultExchange,
    joins,
    mcdJug,
    dssCdpManager,
    dssMultiplyProxyActions,
    tokens,
    fmm,
  } = context

  const {
    id,
    ilk,
    userAddress,
    closeTo,
    totalCollateral,
    totalDebt,
    token,
    exchangeAddress,
    exchangeData,
    fromTokenAmount,
    toTokenAmount,
    minToTokenAmount,
  } = data

  const exchangeCallData = {
    fromTokenAddress: tokens[token].address,
    toTokenAddress: tokens['DAI'].address,
    fromTokenAmount: amountToWei(fromTokenAmount, token).toFixed(0),
    toTokenAmount: amountToWei(toTokenAmount, 'DAI').toFixed(0),
    minToTokenAmount: amountToWei(minToTokenAmount, 'DAI').toFixed(0),
    exchangeAddress,
    _exchangeCalldata: exchangeData,
  }

  const cdpCallData = {
    gemJoin: joins[ilk],
    cdpId: id.toString(),
    ilk: '0x0000000000000000000000000000000000000000000000000000000000000000',
    fundsReceiver: userAddress,
    borrowCollateral: amountToWei(totalCollateral, token).toFixed(0),
    requiredDebt: amountToWei(
      closeTo === 'collateral' ? minToTokenAmount : totalDebt,
      'DAI',
    ).toFixed(0),
    depositCollateral: '0',
    withdrawDai: '0',
    depositDai: '0',
    withdrawCollateral: '0',
    skipFL: false,
    methodName: '',
  }

  const addressRegistryCallData = {
    jug: mcdJug.address,
    manager: dssCdpManager.address,
    multiplyProxyActions: dssMultiplyProxyActions.address,
    lender: fmm,
    exchange: defaultExchange.address,
  }

  if (closeTo === 'collateral') {
    return contract<MultiplyProxyActions>(dssMultiplyProxyActions).methods.closeVaultExitCollateral(
      exchangeCallData as any,
      cdpCallData as any,
      addressRegistryCallData as any,
    )
  } else {
    return contract<MultiplyProxyActions>(dssMultiplyProxyActions).methods.closeVaultExitDai(
      exchangeCallData as any,
      cdpCallData as any,
      addressRegistryCallData as any,
    )
  }
}

export const closeVaultCall: TransactionDef<CloseVaultData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    const { dssMultiplyProxyActions, dssProxyActions } = context
    if (data.exchangeData) {
      return [dssMultiplyProxyActions.address, getCloseVaultCallData(data, context).encodeABI()]
    } else {
      return [
        dssProxyActions.address,
        getWithdrawAndPaybackCallData(
          {
            kind: TxMetaKind.withdrawAndPayback,
            withdrawAmount: data.totalCollateral,
            paybackAmount: new BigNumber(0),
            proxyAddress: data.proxyAddress,
            ilk: data.ilk,
            token: data.token,
            id: data.id,
            shouldPaybackAll: true,
          },
          context,
          StandardDssProxyActionsContractAdapter,
        ).encodeABI(),
      ]
    }
  },
}

export type CloseGuniMultiplyData = {
  kind: TxMetaKind.closeGuni
  token: string
  ilk: string
  userAddress: string
  requiredDebt: BigNumber
  cdpId: string
  fromTokenAmount: BigNumber
  toTokenAmount: BigNumber
  minToTokenAmount: BigNumber
  exchangeAddress: string
  exchangeData: string
  proxyAddress: string
}

function getGuniCloseVaultData(data: CloseGuniMultiplyData, context: ContextConnected) {
  const {
    contract,
    guniProxyActions,
    joins,
    mcdJug,
    dssCdpManager,
    tokens,
    fmm,
    guniResolver,
    guniRouter,
  } = context

  const exchange = context['noFeesExchange']

  const { token0: token0Symbol, token1: token1Symbol } = getToken(data.token)

  if (!token0Symbol || !token1Symbol) {
    throw new Error('Invalid token')
  }

  return contract<DssGuniProxyActions>(guniProxyActions).methods.closeGuniVaultExitDai(
    {
      fromTokenAddress: tokens[token0Symbol].address,
      toTokenAddress: tokens[token1Symbol].address,
      fromTokenAmount: amountToWei(data.fromTokenAmount, token1Symbol).toFixed(0),
      toTokenAmount: amountToWei(data.toTokenAmount, token0Symbol).toFixed(0),
      minToTokenAmount: amountToWei(data.minToTokenAmount, token0Symbol).toFixed(0),
      exchangeAddress: data.exchangeAddress,
      _exchangeCalldata: data.exchangeData,
    } as any,
    {
      gemJoin: joins[data.ilk],
      fundsReceiver: data.userAddress,
      cdpId: data.cdpId,
      ilk: '0x0000000000000000000000000000000000000000000000000000000000000000',
      requiredDebt: amountToWei(data.requiredDebt, 'DAI').toFixed(0),
      token0Amount: '0',
      methodName: '',
    } as any,
    {
      jug: mcdJug.address,
      guni: tokens[data.token].address,
      resolver: guniResolver,
      router: guniRouter,
      otherToken: tokens[token1Symbol].address,
      manager: dssCdpManager.address,
      guniProxyActions: guniProxyActions.address,
      lender: fmm,
      exchange: exchange.address,
    } as any,
  )
}

export const closeGuniVaultCall: TransactionDef<CloseGuniMultiplyData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => {
    const { guniProxyActions } = context

    return [guniProxyActions.address, getGuniCloseVaultData(data, context).encodeABI()]
  },
}
