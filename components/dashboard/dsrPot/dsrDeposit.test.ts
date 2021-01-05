import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { TxHelpers } from 'components/AppContext'
import { ContextConnected } from 'components/blockchain/network'
import { createDsrDeposit$ } from 'components/dashboard/dsrPot/dsrDeposit'
import { getStateUnpacker } from 'helpers/testHelpers'
import { zero } from 'helpers/zero'
import { describe, it } from 'mocha'
import { BehaviorSubject, Observable, of } from 'rxjs'

const proxyAddress$ = new BehaviorSubject('')
const daiBalance$ = of(new BigNumber(10))
const daiAllowance$ = new BehaviorSubject(false)
// @ts-ignore
function addGasEstimation(state) {
  return of(state)
}

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

describe('DSR deposit', () => {
  it('set amount', () => {
    const state = getStateUnpacker(
      createDsrDeposit$(
        context$,
        txHelpers$,
        proxyAddress$,
        daiAllowance$,
        daiBalance$,
        addGasEstimation,
      ),
    )
    proxyAddress$.next('0x123')
    daiAllowance$.next(true)
    const { change } = state()

    change!({ kind: 'amount', amount: new BigNumber(2) })
    expect(state().amount).to.be.deep.eq(new BigNumber(2))
  })

  it('not enough money', () => {
    const state = getStateUnpacker(
      createDsrDeposit$(
        context$,
        txHelpers$,
        proxyAddress$,
        daiAllowance$,
        daiBalance$,
        addGasEstimation,
      ),
    )
    proxyAddress$.next('0x123')
    daiAllowance$.next(true)
    const { change } = state()

    change!({ kind: 'amount', amount: new BigNumber(12) })
    expect(state().messages[0].kind).to.be.eq('amountBiggerThanBalance')
  })

  it('amount empty', () => {
    const state = getStateUnpacker(
      createDsrDeposit$(
        context$,
        txHelpers$,
        proxyAddress$,
        daiAllowance$,
        daiBalance$,
        addGasEstimation,
      ),
    )
    const { change } = state()

    expect(state().messages[0].kind).to.be.eq('amountIsEmpty')
    change!({ kind: 'amount', amount: zero })
    expect(state().messages[0].kind).to.be.eq('amountIsEmpty')
  })

  it('proceed with depositing', () => {
    proxyAddress$.next('0x123')
    daiAllowance$.next(true)
    const state = getStateUnpacker(
      createDsrDeposit$(
        context$,
        txHelpers$,
        proxyAddress$,
        daiAllowance$,
        daiBalance$,
        addGasEstimation,
      ),
    )
    const { change } = state()

    change!({ kind: 'amount', amount: new BigNumber(2) })
    state().proceed!()
    expect(state().stage).to.be.eq('depositWaiting4Confirmation')
  })

  it('wait for allowance', () => {
    const state = getStateUnpacker(
      createDsrDeposit$(
        context$,
        txHelpers$,
        proxyAddress$,
        daiAllowance$,
        daiBalance$,
        addGasEstimation,
      ),
    )
    proxyAddress$.next('0x123')
    daiAllowance$.next(false)
    const { change } = state()

    change!({ kind: 'amount', amount: new BigNumber(2) })
    state().proceed!()
    expect(state().stage).to.be.eq('allowanceWaiting4Confirmation')
  })

  it('no proxy address', () => {
    const state = getStateUnpacker(
      createDsrDeposit$(
        context$,
        txHelpers$,
        proxyAddress$,
        daiAllowance$,
        daiBalance$,
        addGasEstimation,
      ),
    )
    const { change } = state()

    change!({ kind: 'amount', amount: new BigNumber(5) })
    state().proceed!()
    expect(state().stage).to.be.eq('allowanceWaiting4Confirmation')
  })

  it('reset deposit flow stage on account change', () => {
    const state = getStateUnpacker(
      createDsrDeposit$(
        context$,
        txHelpers$,
        proxyAddress$,
        daiAllowance$,
        daiBalance$,
        addGasEstimation,
      ),
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
      createDsrDeposit$(
        context$,
        txHelpers$,
        proxyAddress$,
        daiAllowance$,
        daiBalance$,
        addGasEstimation,
      ),
    )

    proxyAddress$.next('0x123')
    daiAllowance$.next(true)
    expect(state().stage).to.be.eq('editing')
    daiAllowance$.next(false)
    expect(state().stage).to.be.eq('editing')
  })

  it('don`reset proxy on change from external UI/source without changing account', () => {
    const state = getStateUnpacker(
      createDsrDeposit$(
        context$,
        txHelpers$,
        proxyAddress$,
        daiAllowance$,
        daiBalance$,
        addGasEstimation,
      ),
    )

    proxyAddress$.next('0x123')
    daiAllowance$.next(true)
    expect(state().stage).to.be.eq('editing')
    proxyAddress$.next('')
    expect(state().stage).to.be.eq('editing')
  })
})
