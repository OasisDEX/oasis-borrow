import { MakerVaultType } from 'blockchain/calls/vaultResolver'
import { getStateUnpacker } from 'helpers/testHelpers'

import { ProxyActionsAdapterType } from './adapters/ProxyActionsSmartContractAdapterInterface'
import { proxyActionsAdapterResolver$ } from './proxyActionsAdapterResolver'

describe('proxyActionsAdapterResolver', () => {
  describe('crate from ilk (open new vault)', () => {
    it('returns default proxy actions for other ilks', () => {
      const adapter$ = proxyActionsAdapterResolver$({ ilk: 'ETH-A' })

      const state = getStateUnpacker(adapter$)

      expect(state().AdapterType).toBe(ProxyActionsAdapterType.STANDARD)
    })
    it('throws when trying to open a charter vault', () => {
      const adapter$ = proxyActionsAdapterResolver$({ ilk: 'INST-ETH-A' })

      const state = getStateUnpacker(adapter$)

      expect(state).toThrow(
        'can not create a proxy actions adapter from an INST-ETH-A ilk - adapter is not tested for opening vaults',
      )
    })
  })

  describe('create from maker vault type (managing a vault)', () => {
    it('returns a cropjoin proxy actions for cropjoin vault type', () => {
      const adapter$ = proxyActionsAdapterResolver$({ makerVaultType: MakerVaultType.CROP_JOIN })

      const state = getStateUnpacker(adapter$)

      expect(state().AdapterType).toBe(ProxyActionsAdapterType.CROPJOIN)
    })
    it('returns CHARTER proxy actions for CHARTER vault type', () => {
      const adapter$ = proxyActionsAdapterResolver$({ makerVaultType: MakerVaultType.CHARTER })

      const state = getStateUnpacker(adapter$)

      expect(state().AdapterType).toBe(ProxyActionsAdapterType.CHARTER)
    })
    it('returns standard proxy actions in all other cases', () => {
      const adapter$ = proxyActionsAdapterResolver$({ makerVaultType: MakerVaultType.STANDARD })

      const state = getStateUnpacker(adapter$)

      expect(state().AdapterType).toBe(ProxyActionsAdapterType.STANDARD)
    })
  })
})
