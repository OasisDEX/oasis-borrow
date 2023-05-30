import { LendingProtocol } from 'lendingProtocols'

export const PRODUCT_HUB_HANDLERS = {
  [LendingProtocol.AaveV2]: () => ({}),
  [LendingProtocol.AaveV3]: () => ({}),
  [LendingProtocol.Ajna]: () => ({}),
  [LendingProtocol.Maker]: () => ({}),
}
