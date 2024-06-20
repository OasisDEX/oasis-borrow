import type { LendingProtocol } from 'lendingProtocols'

export const isLendingProtocolType = (item: LendingProtocol | undefined): item is LendingProtocol =>
  item !== undefined
