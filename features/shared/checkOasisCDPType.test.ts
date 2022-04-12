import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { of } from 'rxjs'

import { getStateUnpacker } from '../../helpers/testHelpers'
import { VaultType } from '../generalManageVault/vaultType'
import { createCheckOasisCDPType$ } from './checkOasisCDPType'

describe('checkOasisPositionType', () => {
  it('returns multiply vault if defined in the API and not hardcoded', () => {
    const state = getStateUnpacker(
      createCheckOasisCDPType$(
        () => of(VaultType.Multiply),
        () => of('ETH-A'),
        [],
        new BigNumber(1),
      ),
    )
    expect(state()).to.eq(VaultType.Multiply)
  })
  it('returns insti type vault if hardcoded as a charter ilk', () => {
    const state = getStateUnpacker(
      createCheckOasisCDPType$(
        () => of(VaultType.Borrow),
        () => of('INST-ETH-A'),
        ['INST-ETH-A'],
        new BigNumber(1),
      ),
    )
    expect(state()).to.eq(VaultType.Insti)
  })
})
