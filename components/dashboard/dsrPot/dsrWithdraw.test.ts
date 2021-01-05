import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { RAY } from 'components/constants'
import { describe, it } from 'mocha'
import { Observable, of } from 'rxjs'

import { getStateUnpacker } from '../../../helpers/testHelpers'
import { zero } from '../../../helpers/zero'
import { TxHelpers } from '../../AppContext'
import { createDsrWithdraw$ } from './dsrWithdraw'

const proxyAddress$ = of('0x987')
const daiDeposit$ = of(new BigNumber(10))
const potDsr$ = of(new BigNumber(1).times(RAY))
// @ts-ignore
function addGasEstimation(state) {
  return of(state)
}

const defaultSend = {
  send: () => of(),
  sendWithGasEstimation: () => of(),
  estimateGas: () => of(20),
} as TxHelpers

const txHelpers$: Observable<TxHelpers> = of(defaultSend)

describe('DSR withdraw', () => {
  it('set amount', () => {
    const state = getStateUnpacker(
      createDsrWithdraw$(txHelpers$, proxyAddress$, daiDeposit$, potDsr$, addGasEstimation),
    )
    const { change } = state()

    change!({ kind: 'amount', amount: new BigNumber(2) })
    expect(state().amount).to.be.deep.eq(new BigNumber(2))
  })

  it('not enough to withdraw', () => {
    const state = getStateUnpacker(
      createDsrWithdraw$(txHelpers$, proxyAddress$, daiDeposit$, potDsr$, addGasEstimation),
    )
    const { change } = state()

    change!({ kind: 'amount', amount: new BigNumber(12) })
    expect(state().messages[0].kind).to.be.deep.eq('amountBiggerThanDeposit')
  })

  it('amount empty', () => {
    const state = getStateUnpacker(
      createDsrWithdraw$(txHelpers$, proxyAddress$, daiDeposit$, potDsr$, addGasEstimation),
    )
    const { change } = state()

    expect(state().messages[0].kind).to.be.deep.eq('amountIsEmpty')
    change!({ kind: 'amount', amount: zero })
    expect(state().messages[0].kind).to.be.deep.eq('amountIsEmpty')
  })

  it('proceed withdrawal', () => {
    const state = getStateUnpacker(
      createDsrWithdraw$(txHelpers$, proxyAddress$, daiDeposit$, potDsr$, addGasEstimation),
    )
    const { change } = state()

    change!({ kind: 'amount', amount: new BigNumber(5) })
    state().proceed!()
    expect(state().stage).to.be.eq('withdrawWaiting4Confirmation')
  })
})
