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
  })

  describe('create from maker vault type (managing a vault)', () => {
    it('returns standard proxy actions in all other cases', () => {
      const adapter$ = proxyActionsAdapterResolver$({ makerVaultType: MakerVaultType.STANDARD })

      const state = getStateUnpacker(adapter$)

      expect(state().AdapterType).toBe(ProxyActionsAdapterType.STANDARD)
    })
  })
})
