import BigNumber from 'bignumber.js'
import { getStateUnpacker } from 'helpers/testHelpers'
import { BehaviorSubject, of } from 'rxjs'

import { ClaimTxnState, createBonusPipe$ } from './bonusPipe'

describe('bonusPipe', () => {
  describe('showing the blockchain state', () => {
    it('does not provide claimAll function if there are no bonuses to claim', () => {
      const bonusPipe = createBonusPipe$(
        () => ({
          bonus$: of({
            amountToClaim: new BigNumber(0),
            symbol: 'CSH',
            name: 'token name',
            moreInfoLink: 'https://example.com',
            readableAmount: '0CSH',
          }),
          claimAll$: of(undefined),
        }),
        new BigNumber(123),
      )

      const state = getStateUnpacker(bonusPipe)

      expect(state().bonus).toBeDefined()
      expect(state().claimAll).toBeUndefined()
      expect(state().claimTxnState).toBeUndefined()
    })
  })

  describe('claiming the rewards', () => {
    it('calls claim interface and updates state when claiming', () => {
      const claimAllStub = jest.fn(() => of(ClaimTxnState.PENDING))
      function bonusAdapterStub() {
        return {
          bonus$: of({
            amountToClaim: new BigNumber(30),
            symbol: 'CSH',
            name: 'token name',
            moreInfoLink: 'https://example.com',
            readableAmount: '0CSH',
          }),
          claimAll$: of(claimAllStub),
        }
      }
      const bonusAdapterSpy = jest.fn(() => bonusAdapterStub())
      const bonusPipe = createBonusPipe$(bonusAdapterSpy, new BigNumber(123))
      const state = getStateUnpacker(bonusPipe)

      state().claimAll!()

      expect(bonusAdapterSpy).toHaveBeenCalledWith(new BigNumber(123))
      expect(claimAllStub).toHaveBeenCalled()
      expect(state().claimAll).toBeUndefined()
    })

    it('updates bonuses and bonus state when claim is successful', () => {
      const bonusMock$ = new BehaviorSubject({
        amountToClaim: new BigNumber(30),
        symbol: 'CSH',
        name: 'token name',
        moreInfoLink: 'https://example.com',
        readableAmount: '0CSH',
      })
      const claimTxnState$mock = new BehaviorSubject<ClaimTxnState>(ClaimTxnState.PENDING)
      const claimAllStub = jest.fn(() => claimTxnState$mock)
      const bonusPipe = createBonusPipe$(
        () => ({
          bonus$: bonusMock$,
          claimAll$: of(claimAllStub),
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
        readableAmount: '0CSH',
      })
      claimTxnState$mock.next(ClaimTxnState.SUCCEEDED)

      expect(state().bonus.amountToClaim.toString()).toBe('0')
      expect(state().claimAll).toBeUndefined()
      expect(state().claimTxnState).toBe(ClaimTxnState.SUCCEEDED)
    })

    it('pipes new bonus values', () => {
      const bonusMock$ = new BehaviorSubject({
        amountToClaim: new BigNumber(30),
        symbol: 'CSH',
        name: 'token name',
        moreInfoLink: 'https://example.com',
        readableAmount: '0CSH',
      })
      const bonusPipe = createBonusPipe$(
        () => ({
          bonus$: bonusMock$,
          claimAll$: of(undefined),
        }),
        new BigNumber(123),
      )
      const state = getStateUnpacker(bonusPipe)

      expect(state().bonus.amountToClaim.toString()).toBe('30')

      // new bonus value
      bonusMock$.next({
        amountToClaim: new BigNumber(40),
        symbol: 'CSH',
        name: 'token name',
        moreInfoLink: 'https://example.com',
        readableAmount: '0CSH',
      })

      expect(state().bonus.amountToClaim.toString()).toBe('40')
    })

    it('calls claim once', () => {
      const claimAllStub = jest.fn(() => of(ClaimTxnState.PENDING))
      const bonusPipe = createBonusPipe$(
        () => ({
          bonus$: of({
            amountToClaim: new BigNumber(30),
            symbol: 'CSH',
            name: 'token name',
            moreInfoLink: 'https://example.com',
            readableAmount: '0CSH',
          }),
          claimAll$: of(claimAllStub),
        }),
        new BigNumber(123),
      )
      const state = getStateUnpacker(bonusPipe)

      state().claimAll!()

      expect(claimAllStub).toHaveBeenCalledTimes(1)
    })

    it('allows user to claim again after a failed transaction', () => {
      const claimAllStub = jest.fn(() => of(ClaimTxnState.FAILED))
      const bonusPipe = createBonusPipe$(
        () => ({
          bonus$: of({
            amountToClaim: new BigNumber(30),
            symbol: 'CSH',
            name: 'token name',
            moreInfoLink: 'https://example.com',
            readableAmount: '0CSH',
          }),
          claimAll$: of(claimAllStub),
        }),
        new BigNumber(123),
      )
      const state = getStateUnpacker(bonusPipe)

      state().claimAll!()

      expect(state().claimAll).toBeDefined()
    })

    it('does not allow user to claim without a claim function', () => {
      const bonusPipe = createBonusPipe$(
        () => ({
          bonus$: of({
            amountToClaim: new BigNumber(30),
            symbol: 'CSH',
            name: 'token name',
            moreInfoLink: 'https://example.com',
            readableAmount: '0CSH',
          }),
          claimAll$: of(undefined),
        }),
        new BigNumber(123),
      )
      const state = getStateUnpacker(bonusPipe)

      expect(state().claimAll).toBeUndefined()
    })
  })
})
