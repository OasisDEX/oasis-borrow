import BigNumber from 'bignumber.js'
import { expect } from 'chai'

import { createCanCreateVaultForIlk$ } from './createCanCreateVaultForIlk'
import { mockIlkData } from './mocks/ilks.mock'
import { mockVaults$ } from './mocks/vaults.mock'
import { getStateUnpacker } from './testHelpers'

describe('create can create vault', () => {
  it('lets the user create a sethCRV vault if they do not already have one', () => {
    const vaults$ = mockVaults$([
      {
        ilk: 'ETH-A',
      },
    ])
    const obs = createCanCreateVaultForIlk$(vaults$, mockIlkData({ ilk: 'CRVV1ETHSTETH-A' })())
    const state = getStateUnpacker(obs)
    expect(state().canOpen).to.eq(true)
  })

  it('blocks the user from creating a sethCRV vault if they already have one', () => {
    const vaults$ = mockVaults$([
      {
        ilk: 'CRVV1ETHSTETH-A',
      },
    ])

    const mockIlk = mockIlkData({ ilk: 'CRVV1ETHSTETH-A' })()

    const obs = createCanCreateVaultForIlk$(vaults$, mockIlk)
    const state = getStateUnpacker(obs)
    expect(state()).to.eql({ canOpen: false, excuse: 'user-already-has-vault' })
  })

  it('lets the user create an ETH vault if they already have one', () => {
    const vaults$ = mockVaults$([
      {
        ilk: 'ETH-A',
      },
    ])
    const obs = createCanCreateVaultForIlk$(vaults$, mockIlkData({ ilk: 'ETH-A' })())
    const state = getStateUnpacker(obs)
    expect(state().canOpen).to.eq(true)
  })

  it('blocks a user from creating a vault when the ilk debt available is less than the debt floor', () => {
    const vaults$ = mockVaults$([
      {
        ilk: 'ETH-A',
      },
    ])

    const ilkData = mockIlkData({
      ilk: 'ETH-A',
      debtCeiling: new BigNumber(0), // bring ilkDebtAvailable down to zero
    })()
    const obs = createCanCreateVaultForIlk$(vaults$, ilkData)
    const state = getStateUnpacker(obs)
    expect(state()).to.eql({ canOpen: false, excuse: 'vault-full' })
  })
})
