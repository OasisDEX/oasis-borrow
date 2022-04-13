import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { BehaviorSubject, Observable, of } from 'rxjs'
import sinon from 'sinon'

import { getStateUnpacker } from '../../helpers/testHelpers'
import { ClaimTxnState, createBonusPipe$ } from './bonusPipe'

describe('bonusPipe', () => {
  describe('showing the blockchain state', () => {
    it('does not provide bonus values or a claimAll function if there are no bonuses to claim', () => {
      const bonusPipe = createBonusPipe$(
        () => ({
          bonus$: of(undefined),
          claimAll: () => {
            throw new Error('unimplemented')
          },
        }),
        new BigNumber(123),
      )

      const state = getStateUnpacker(bonusPipe)

      expect(state().bonus).to.be.undefined
      expect(state().claimAll).to.be.undefined
      expect(state().claimTxnState).to.be.undefined
    })
  })

  describe('claiming the rewards', () => {
    it('calls claim interface and updates state when claiming', () => {
      const claimAllStub = sinon.stub().returns(of(TxStatus.Propagating))
      function bonusAdapterStub() {
        return {
          bonus$: of({
            amountToClaim: new BigNumber(30),
            symbol: 'CSH',
            name: 'token name',
            moreInfoLink: 'https://example.com',
          }),
          claimAll: claimAllStub,
        }
      }
      const bonusAdapterSpy = sinon.spy(bonusAdapterStub)
      const bonusPipe = createBonusPipe$(bonusAdapterSpy, new BigNumber(123))
      const state = getStateUnpacker(bonusPipe)

      state().claimAll!()

      expect(bonusAdapterSpy).to.have.been.calledWith(new BigNumber(123))
      expect(claimAllStub).to.have.been.called
      expect(state().claimAll).eq(undefined)
    })

    it('updates bonuses and bonus state when claim is successful', () => {
      const bonusMock$ = new BehaviorSubject({
        amountToClaim: new BigNumber(30),
        symbol: 'CSH',
        name: 'token name',
        moreInfoLink: 'https://example.com',
      })
      const claimTxnState$mock = new BehaviorSubject<ClaimTxnState>(ClaimTxnState.PENDING)
      const claimAllStub = sinon.stub<[], Observable<ClaimTxnState>>().returns(claimTxnState$mock)
      const bonusPipe = createBonusPipe$(
        () => ({
          bonus$: bonusMock$,
          claimAll: claimAllStub,
        }),
        new BigNumber(123),
      )
      const state = getStateUnpacker(bonusPipe)

      state().claimAll!()

      // mock successful claim
      bonusMock$.next({
        amountToClaim: new BigNumber(0),
        symbol: 'CSH',
        name: 'token name',
        moreInfoLink: 'https://example.com',
      })
      claimTxnState$mock.next(ClaimTxnState.SUCCEEDED)

      expect(state().bonus?.amountToClaim.toString()).eq('0')
      expect(state().claimAll).to.be.undefined
      expect(state().claimTxnState).eq(ClaimTxnState.SUCCEEDED)
    })

    it('pipes new bonus vaules', () => {
      const bonusMock$ = new BehaviorSubject({
        amountToClaim: new BigNumber(30),
        symbol: 'CSH',
        name: 'token name',
        moreInfoLink: 'https://example.com',
      })
      const bonusPipe = createBonusPipe$(
        () => ({
          bonus$: bonusMock$,
          claimAll: () => {
            throw new Error('not implemented')
          },
        }),
        new BigNumber(123),
      )
      const state = getStateUnpacker(bonusPipe)

      expect(state().bonus?.amountToClaim.toString()).eq('30')

      // new bonus value
      bonusMock$.next({
        amountToClaim: new BigNumber(40),
        symbol: 'CSH',
        name: 'token name',
        moreInfoLink: 'https://example.com',
      })

      expect(state().bonus?.amountToClaim.toString()).eq('40')
    })

    it('calls claim once', () => {
      const claimAllStub = sinon.stub().returns(of(ClaimTxnState.PENDING))
      const bonusPipe = createBonusPipe$(
        () => ({
          bonus$: of({
            amountToClaim: new BigNumber(30),
            symbol: 'CSH',
            name: 'token name',
            moreInfoLink: 'https://example.com',
          }),
          claimAll: claimAllStub,
        }),
        new BigNumber(123),
      )
      const state = getStateUnpacker(bonusPipe)

      state().claimAll!()

      expect(claimAllStub).to.have.been.calledOnce
    })
  })
})
