import { MainnetContracts } from 'blockchain/contracts/mainnet'
import { NetworkIds } from 'blockchain/networkIds'

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
