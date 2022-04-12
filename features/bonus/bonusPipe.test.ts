import { ClaimTxnState, createBonusPipe$ } from './bonusPipe'
import { BehaviorSubject, of } from 'rxjs'
import BigNumber from 'bignumber.js'
import { getStateUnpacker } from '../../helpers/testHelpers'
import { expect } from 'chai'
import { zero } from '../../helpers/zero'

describe('bonusPipe', () => {
  describe('showing the blockchain state', () => {
    it('pipes the decimals and symbol correctly', () => {
      const bonusPipe = createBonusPipe$(
        () => of({ urnAddress: '0xUrnAddress', ilk: 'ILKYILK-A' }),
        () => of(new BigNumber('34845377488320063721')),
        () => of('0xTokenAddress'),
        () => of(new BigNumber(18)),
        () => of('CSH'),
        () => of('token name'),
        () => of(),
        new BigNumber(123),
      )

      const state = getStateUnpacker(bonusPipe)

      expect(state().bonus?.symbol).eq('CSH')
      expect(state().bonus?.name).eq('token name')
      expect(state().bonus?.amountToClaim.toFixed(0)).eq('35')
      expect(state().claimAll).to.exist
    })

    it('does not provide bonus values or a claimAll function if there are no bonuses to claim', () => {
      const bonusPipe = createBonusPipe$(
        () => of({ urnAddress: '0xUrnAddress', ilk: 'ILKYILK-A' }),
        () => of(new BigNumber('0')),
        () => of('0xTokenAddress'),
        () => of(new BigNumber(18)),
        () => of('CASH'),
        () => of('token name'),
        () => of(),
        new BigNumber(123),
      )

      const state = getStateUnpacker(bonusPipe)

      expect(state().bonus?.amountToClaim.toString()).eq('0')
      expect(state().claimAll).to.be.undefined
    })
  })

  describe('claiming the rewards', () => {
    it('calls claim interface and updates state when claiming', () => {
      let ilkPassedToClaimCropFunction: string, cdpIdPassedToCropFunction: BigNumber
      const bonusPipe = createBonusPipe$(
        () => of({ urnAddress: '0xUrnAddress', ilk: 'ILKYILK-A' }),
        () => of(new BigNumber('34845377488320063721')),
        () => of('0xTokenAddress'),
        () => of(new BigNumber(18)),
        () => of('CASH'),
        () => of('token name'),
        (ilk, cdpId) => {
          ilkPassedToClaimCropFunction = ilk
          cdpIdPassedToCropFunction = cdpId
          return of(ClaimTxnState.PENDING)
        },
        new BigNumber(123),
      )

      const state = getStateUnpacker(bonusPipe)

      state().claimAll!()

      expect(state().claimTxnState).eq(ClaimTxnState.PENDING)
      expect(state().claimAll).eq(undefined)
      // @ts-ignore - used before assigned
      expect(ilkPassedToClaimCropFunction).eq('ILKYILK-A')
      // @ts-ignore - used before assigned
      expect(cdpIdPassedToCropFunction.toString()).eq('123')
    })

    it('updates bonuses and bonus state when claim is successful', () => {
      const cropsMock$ = new BehaviorSubject(new BigNumber('34845377488320063721'))
      const sendCropMock$ = new BehaviorSubject(ClaimTxnState.PENDING)

      const bonusPipe = createBonusPipe$(
        () => of({ urnAddress: '0xUrnAddress', ilk: 'ILKYILK-A' }),
        () => cropsMock$,
        () => of('0xTokenAddress'),
        () => of(new BigNumber(18)),
        () => of('CASH'),
        () => of('token name'),
        () => sendCropMock$,
        new BigNumber(123),
      )

      const state = getStateUnpacker(bonusPipe)

      state().claimAll!()

      // mock successful claim
      cropsMock$.next(zero)
      sendCropMock$.next(ClaimTxnState.SUCCEEDED)

      expect(state().bonus?.amountToClaim.toString()).eq('0')
      expect(state().claimAll).to.be.undefined
      expect(state().claimTxnState).eq(ClaimTxnState.SUCCEEDED)
    })
  })
})
