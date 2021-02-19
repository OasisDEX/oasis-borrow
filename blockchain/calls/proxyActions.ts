import { BigNumber } from 'bignumber.js'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { contractDesc } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { amountToWei } from 'blockchain/utils'
import { zero } from 'helpers/zero'
import { DsProxy } from 'types/web3-v1-contracts/ds-proxy'
import { DssProxyActions } from 'types/web3-v1-contracts/dss-proxy-actions'
import Web3 from 'web3'

import { TxMetaKind } from './txMeta'

export type ProxyActionData = {
  kind: TxMetaKind.proxyAction
  id?: string
  tkn: string
  ilk: string
  lockAmount?: BigNumber
  drawAmount?: BigNumber
  withdrawAmount?: BigNumber
  paybackAmount?: BigNumber
  proxyAddress: string
}

function getCallData(data: ProxyActionData, context: ContextConnected) {
  const { dssProxyActions, dssCdpManager, mcdJoinDai, mcdJug, joins, contract } = context
  const { id, tkn, lockAmount, drawAmount, withdrawAmount, paybackAmount, ilk, proxyAddress } = data

  const isOpenVault = !id
  const isETH = tkn === 'ETH'

  const isLocking = lockAmount && lockAmount.gt(zero)
  const isDrawing = drawAmount && drawAmount.gt(zero)
  const isLockingAndDrawing = isLocking && isDrawing
  const isLockingOrDrawing = isLocking || isDrawing

  const isWiping = paybackAmount && paybackAmount.gt(zero)
  const isFreeing = withdrawAmount && withdrawAmount.gt(zero)
  const isWipingAndFreeing = isWiping && isFreeing

  const isOpenLockETHAndDraw = isOpenVault && isETH && isLockingOrDrawing
  const isOpenLockGemAndDraw = isOpenVault && !isETH && isLockingOrDrawing
  const isOpenEmpty = isOpenVault && !isLockingOrDrawing

  const isLockETHAndDraw = !isOpenVault && isETH && isLockingAndDrawing
  const isLockGemAndDraw = !isOpenVault && !isETH && isLockingAndDrawing
  const isLockETH = !isOpenVault && isETH && isLocking && !isDrawing
  const isLockGem = !isOpenVault && !isETH && isLocking && !isDrawing
  const isDraw = !isOpenVault && !isLocking && isDrawing

  const isWipeAndFreeETH = !isOpenVault && isETH && isWipingAndFreeing
  const isWipeAndFreeGem = !isOpenVault && !isETH && isWipingAndFreeing

  const isFreeETH = !isOpenVault && isETH && !isWiping && isFreeing
  const isFreeGem = !isOpenVault && !isETH && !isWiping && isFreeing

  const isWipe = !isOpenVault && isWiping && !isFreeing

  if (isOpenLockETHAndDraw) {
    return contract<DssProxyActions>(dssProxyActions).methods.openLockETHAndDraw(
      dssCdpManager.address,
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      Web3.utils.utf8ToHex(ilk),
      amountToWei(drawAmount || zero, 'DAI').toFixed(0),
    )
  }

  if (isOpenLockGemAndDraw) {
    return contract<DssProxyActions>(dssProxyActions).methods.openLockGemAndDraw(
      dssCdpManager.address,
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      Web3.utils.utf8ToHex(ilk),
      amountToWei(lockAmount || zero, tkn).toFixed(0),
      amountToWei(drawAmount || zero, 'DAI').toFixed(0),
      true,
    )
  }

  if (isLockETHAndDraw) {
    return contract<DssProxyActions>(dssProxyActions).methods.lockETHAndDraw(
      dssCdpManager.address,
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      id!,
      amountToWei(drawAmount!, 'DAI').toFixed(0),
    )
  }

  if (isLockGemAndDraw) {
    return contract<DssProxyActions>(dssProxyActions).methods.lockGemAndDraw(
      dssCdpManager.address,
      mcdJug.address,
      joins[ilk],
      mcdJoinDai.address,
      id!,
      amountToWei(lockAmount!, tkn).toFixed(0),
      amountToWei(drawAmount!, 'DAI').toFixed(0),
      true,
    )
  }

  if (isLockETH) {
    return contract<DssProxyActions>(dssProxyActions).methods.lockETH(
      dssCdpManager.address,
      joins[ilk],
      id!,
    )
  }
  if (isLockGem) {
    return contract<DssProxyActions>(dssProxyActions).methods.lockGem(
      dssCdpManager.address,
      joins[ilk],
      id!,
      amountToWei(lockAmount!, tkn).toFixed(0),
      true,
    )
  }
  if (isDraw) {
    return contract<DssProxyActions>(dssProxyActions).methods.draw(
      dssCdpManager.address,
      mcdJug.address,
      mcdJoinDai.address,
      id!,
      amountToWei(drawAmount!, 'DAI').toFixed(0),
    )
  }
  if (isWipeAndFreeETH) {
    return contract<DssProxyActions>(dssProxyActions).methods.wipeAndFreeETH(
      dssCdpManager.address,
      joins[ilk],
      mcdJoinDai.address,
      id!,
      amountToWei(withdrawAmount!, tkn).toFixed(0),
      amountToWei(paybackAmount!, 'DAI').toFixed(0),
    )
  }

  if (isWipeAndFreeGem) {
    return contract<DssProxyActions>(dssProxyActions).methods.wipeAndFreeGem(
      dssCdpManager.address,
      joins[ilk],
      mcdJoinDai.address,
      id!,
      amountToWei(withdrawAmount!, tkn).toFixed(0),
      amountToWei(paybackAmount!, 'DAI').toFixed(0),
    )
  }

  if (isFreeETH) {
    return contract<DssProxyActions>(dssProxyActions).methods.freeETH(
      dssCdpManager.address,
      joins[ilk],
      id!,
      amountToWei(withdrawAmount!, tkn).toFixed(0),
    )
  }

  if (isFreeGem) {
    return contract<DssProxyActions>(dssProxyActions).methods.freeGem(
      dssCdpManager.address,
      joins[ilk],
      id!,
      amountToWei(withdrawAmount!, tkn).toFixed(0),
    )
  }

  if (isWipe) {
    return contract<DssProxyActions>(dssProxyActions).methods.wipe(
      dssCdpManager.address,
      mcdJoinDai.address,
      id!,
      amountToWei(paybackAmount!, 'DAI').toFixed(0),
    )
  }

  // fall through is to open an empty ilk vault
  return contract<DssProxyActions>(dssProxyActions).methods.open(
    dssCdpManager.address,
    Web3.utils.utf8ToHex(ilk),
    proxyAddress,
  )
}

export const proxyAction: TransactionDef<ProxyActionData> = {
  call: ({ proxyAddress }, { contract }) => {
    return (contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods as any)[
      'execute(address,bytes)'
    ]
  },
  prepareArgs: (data, context) => {
    const { dssProxyActions } = context
    return [dssProxyActions.address, getCallData(data, context).encodeABI()]
  },
  options: ({ tkn, lockAmount }) =>
    tkn === 'ETH' && lockAmount ? { value: amountToWei(lockAmount, 'ETH').toString() } : {},
}
