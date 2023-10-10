import type { MainnetContracts } from 'blockchain/contracts/mainnet'
import type { NetworkIds } from 'blockchain/networks'

import { isZeroAddress } from './isZeroAddress'

export function warnIfAddressIsZero<T extends keyof MainnetContracts>(
  address: string,
  networkId: NetworkIds,
  contractName: T,
  contractMethod: string,
): void {
  if (!address) {
    console.warn(
      `The ${String(contractName)}.${String(
        contractMethod,
      )} address is UNDEFINED for network ${networkId}`,
    )
  }
  if (isZeroAddress(address)) {
    console.warn(
      `The ${String(contractName)}.${String(
        contractMethod,
      )} address is not set for network ${networkId}`,
    )
  }
}
