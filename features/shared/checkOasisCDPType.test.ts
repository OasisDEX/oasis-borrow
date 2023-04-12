import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { VaultType } from 'features/generalManageVault/vaultType'
import { getStateUnpacker } from 'helpers/testHelpers'
import { LendingProtocol } from 'lendingProtocols'
import { of } from 'rxjs'

import { createCheckOasisCDPType$ } from './checkOasisCDPType'

describe('checkOasisPositionType', () => {
  it('returns multiply vault if defined in the API and not hardcoded', () => {
    const state = getStateUnpacker(
      createCheckOasisCDPType$(
        () => of(VaultType.Multiply),
        () => of('ETH-A'),
        [],
        { id: new BigNumber(1), protocol: LendingProtocol.Maker },
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
        { id: new BigNumber(1), protocol: LendingProtocol.Maker },
      ),
    )
    expect(state()).to.eq(VaultType.Insti)
  })
})
