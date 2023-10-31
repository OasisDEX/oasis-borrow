import BigNumber from 'bignumber.js'
import { VaultType } from 'features/generalManageVault/vaultType.types'
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
        { id: new BigNumber(1), protocol: LendingProtocol.Maker },
      ),
    )
    expect(state()).toBe(VaultType.Multiply)
  })
})
