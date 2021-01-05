import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { TxData, TxHelpers } from 'components/AppContext'
import { SendTransactionFunction } from 'components/blockchain/calls/callsHelpers'
import { ContextConnected } from 'components/blockchain/network'
import { getStateUnpacker } from 'helpers/testHelpers'
import { describe, it } from 'mocha'
import { BehaviorSubject, Observable, of } from 'rxjs'
import sinon from 'sinon'

import { createDsrCreation$ } from './dsrPotCreate'

const proxyAddress$ = new BehaviorSubject('')
const daiBalance$ = of(new BigNumber(10))
const daiAllowance$ = new BehaviorSubject(false)

const context = {
  safeConfirmations: 1,
} as ContextConnected

const context$ = new BehaviorSubject(context)

const defaultSend = {
  send: () => of(),
  sendWithGasEstimation: () => of(),
  estimateGas: () => of(20),
} as TxHelpers

const txHelpers$: Observable<TxHelpers> = of(defaultSend)

describe('DSR Pot create', () => {
  it('creating proxy', () => {
    const state = getStateUnpacker(
      createDsrCreation$(context$, txHelpers$, proxyAddress$, daiAllowance$, daiBalance$),
    )
    expect(state().stage).to.be.eq('proxyWaiting4Confirmation')
  })

  it('setting allowance', () => {
    proxyAddress$.next('0x123')
    const state = getStateUnpacker(
      createDsrCreation$(context$, txHelpers$, proxyAddress$, daiAllowance$, daiBalance$),
    )
    expect(state().stage).to.be.eq('allowanceWaiting4Confirmation')
  })

  it('editing amount', () => {
    proxyAddress$.next('0x123')
    daiAllowance$.next(true)
    const state = getStateUnpacker(
      createDsrCreation$(context$, txHelpers$, proxyAddress$, daiAllowance$, daiBalance$),
    )
    expect(state().stage).to.be.eq('editing')
    expect(state().amount).to.be.eq(undefined)
  })

  it('editing', () => {
    proxyAddress$.next('0x123')
    daiAllowance$.next(true)
    const state = getStateUnpacker(
      createDsrCreation$(context$, txHelpers$, proxyAddress$, daiAllowance$, daiBalance$),
    )
    expect(state().stage).to.be.eq('editing')
    expect(state().amount).to.be.eq(undefined)
  })

  it('set amount', () => {
    proxyAddress$.next('0x123')
    daiAllowance$.next(true)
    const state = getStateUnpacker(
      createDsrCreation$(context$, txHelpers$, proxyAddress$, daiAllowance$, daiBalance$),
    )
    const { change } = state()
    change!({ kind: 'amount', amount: new BigNumber(2) })
    expect(state().amount).to.be.deep.eq(new BigNumber(2))
  })

  it('not enough money', () => {
    proxyAddress$.next('0x123')
    daiAllowance$.next(true)
    const state = getStateUnpacker(
      createDsrCreation$(context$, txHelpers$, proxyAddress$, daiAllowance$, daiBalance$),
    )
    const { change } = state()
    change!({ kind: 'amount', amount: new BigNumber(20) })
    expect(state().messages[0].kind).to.be.eq('amountBiggerThanBalance')
  })

  it('creation flow - create proxy and set allowance', () => {
    proxyAddress$.next('')
    daiAllowance$.next(false)
    const proxyCreationMock = sinon.spy(() =>
      of(
        { status: TxStatus.WaitingForApproval },
        { status: TxStatus.WaitingForConfirmation },
        { status: TxStatus.Propagating, txHash: '0xabc123' },
        { status: TxStatus.Success, confirmations: 1 },
      ),
    )

    const txHelp$ = of({
      ...defaultSend,
      //@ts-ignore
      sendWithGasEstimation: proxyCreationMock as SendTransactionFunction<TxData>,
    })

    const state = getStateUnpacker(
      createDsrCreation$(context$, txHelp$, proxyAddress$, daiAllowance$, daiBalance$),
    )

    expect(state().stage).to.be.eq('proxyWaiting4Confirmation')
    state().createProxy!()
    proxyAddress$.next('0x123')

    expect(state().stage).to.be.eq('allowanceWaiting4Confirmation')
    state().setAllowance!()
    daiAllowance$.next(true)
    expect(proxyCreationMock).to.have.been.calledTwice
    expect(state().stage).to.be.eq('editingWaiting4Continue')
  })

  it('creation flow - proxy waiting for confirmations', () => {
    proxyAddress$.next('')
    daiAllowance$.next(false)
    const proxyCreationMock = sinon.spy(() =>
      of(
        { status: TxStatus.WaitingForApproval },
        { status: TxStatus.WaitingForConfirmation },
        { status: TxStatus.Propagating, txHash: '0xabc123' },
        { status: TxStatus.Success, confirmations: 0 },
      ),
    )

    const txHelp$ = of({
      ...defaultSend,
      //@ts-ignore
      sendWithGasEstimation: proxyCreationMock as SendTransactionFunction<TxData>,
    })

    const state = getStateUnpacker(
      createDsrCreation$(context$, txHelp$, proxyAddress$, daiAllowance$, daiBalance$),
    )

    expect(state().stage).to.be.eq('proxyWaiting4Confirmation')
    state().createProxy!()
    expect(state().stage).to.be.eq('proxyInProgress')
    expect(proxyCreationMock).to.have.been.calledOnce
    proxyAddress$.next('0x123')
    expect(state().stage).to.be.eq('proxyInProgress')
  })

  it('reset creation flow stage on account change', () => {
    const state = getStateUnpacker(
      createDsrCreation$(context$, txHelpers$, proxyAddress$, daiAllowance$, daiBalance$),
    )

    proxyAddress$.next('0x123')
    daiAllowance$.next(true)
    expect(state().stage).to.be.eq('editing')
    // change to account with proxy only
    context$.next({ account: '0x123', safeConfirmations: 1 } as ContextConnected)
    proxyAddress$.next('0x1245')
    daiAllowance$.next(false)
    expect(state().stage).to.be.eq('allowanceWaiting4Confirmation')
    // change to account without proxy
    context$.next({ account: '0x12345', safeConfirmations: 1 } as ContextConnected)
    proxyAddress$.next('')
    daiAllowance$.next(false)
    expect(state().stage).to.be.eq('proxyWaiting4Confirmation')
  })

  // we require users to refresh our website if they made proxy change or dai allowance outside of our UI
  // for proxy address change we would have to reverse enginner creation tx of it and track confirmations,
  // and it adds a lot of overhead with that it was consulted with Chris and for now we shouldn't spend our time on that
  it('don`reset allowance on change from external UI/source without changing account', () => {
    const state = getStateUnpacker(
      createDsrCreation$(context$, txHelpers$, proxyAddress$, daiAllowance$, daiBalance$),
    )

    proxyAddress$.next('0x123')
    daiAllowance$.next(true)
    expect(state().stage).to.be.eq('editing')
    daiAllowance$.next(false)
    expect(state().stage).to.be.eq('editing')
  })

  it('don`reset proxy on change from external UI/source without changing account', () => {
    const state = getStateUnpacker(
      createDsrCreation$(context$, txHelpers$, proxyAddress$, daiAllowance$, daiBalance$),
    )

    proxyAddress$.next('0x123')
    daiAllowance$.next(true)
    expect(state().stage).to.be.eq('editing')
    proxyAddress$.next('')
    expect(state().stage).to.be.eq('editing')
  })
})
