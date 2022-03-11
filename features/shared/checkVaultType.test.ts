import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { NEVER, of } from 'rxjs'

import { getStateUnpacker } from '../../helpers/testHelpers'
import { VaultType } from '../generalManageVault/vaultType'
import { createCheckVaultType$ } from './checkVaultType'

describe('checkVaultType', () => {
  it('returns multiply vault if defined in the API and not hardcoded', () => {
    const state = getStateUnpacker(
      createCheckVaultType$(() => of(VaultType.Multiply), {}, new BigNumber(1)),
    )
    expect(state()).to.eq(VaultType.Multiply)
  })
  it('returns multiply vault if hardcoded and not defined in the API', () => {
    const state = getStateUnpacker(
      createCheckVaultType$(() => NEVER, { 123: VaultType.Multiply }, new BigNumber(123)),
    )
    expect(state()).to.eq(VaultType.Multiply)
  })
  it('allows hardcoded vaults to take precedence', () => {
    const state = getStateUnpacker(
      createCheckVaultType$(
        () => of(VaultType.Multiply),
        { 123: VaultType.Insti },
        new BigNumber(123),
      ),
    )
    expect(state()).to.eq(VaultType.Insti)
  })
})
