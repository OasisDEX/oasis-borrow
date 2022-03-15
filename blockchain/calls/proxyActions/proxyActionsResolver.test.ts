import { expect } from 'chai'

import { getStateUnpacker } from '../../../helpers/testHelpers'
import { MakerVaultType } from '../vaultResolver'
import { ProxyActionsAdapterType } from './adapters/ProxyActionsSmartContractAdapterInterface'
import { proxyActionsAdapterResolver$ } from './proxyActionsAdapterResolver'

describe('proxyActionsAdapterResolver', () => {
  describe('crate from ilk (open new vault)', () => {
    it('returns a cropjoin proxy actions for CRVV1ETHSTETH-A ilk', () => {
      const adapter$ = proxyActionsAdapterResolver$({ ilk: 'CRVV1ETHSTETH-A' })

      const state = getStateUnpacker(adapter$)

      expect(state().AdapterType).to.eq(ProxyActionsAdapterType.CROPJOIN)
    })
    it('returns default proxy actions for other ilks', () => {
      const adapter$ = proxyActionsAdapterResolver$({ ilk: 'ETH-A' })

      const state = getStateUnpacker(adapter$)

      expect(state().AdapterType).to.eq(ProxyActionsAdapterType.STANDARD)
    })
    it('throws when trying to open a charter vault', () => {
      const adapter$ = proxyActionsAdapterResolver$({ ilk: 'INST-ETH-A' })

      const state = getStateUnpacker(adapter$)

      expect(state).to.throw(
        'can not create a proxy actions adapter from an INST-ETH-A ilk - adapter is not tested for opening vaults',
      )
    })
  })

  describe('create from maker vault type (managing a vault)', () => {
    it('returns a cropjoin proxy actions for cropjoin vault type', () => {
      const adapter$ = proxyActionsAdapterResolver$({ makerVaultType: MakerVaultType.CROP_JOIN })

      const state = getStateUnpacker(adapter$)

      expect(state().AdapterType).to.eq(ProxyActionsAdapterType.CROPJOIN)
    })
    it('returns CHARTER proxy actions for CHARTER vault type', () => {
      const adapter$ = proxyActionsAdapterResolver$({ makerVaultType: MakerVaultType.CHARTER })

      const state = getStateUnpacker(adapter$)

      expect(state().AdapterType).to.eq(ProxyActionsAdapterType.CHARTER)
    })
    it('returns standard proxy actions in all other cases', () => {
      const adapter$ = proxyActionsAdapterResolver$({ makerVaultType: MakerVaultType.STANDARD })

      const state = getStateUnpacker(adapter$)

      expect(state().AdapterType).to.eq(ProxyActionsAdapterType.STANDARD)
    })
  })
})
