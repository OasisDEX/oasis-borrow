import { AaveLikeLendingProtocol, checkIfAave, LendingProtocol } from 'lendingProtocols'

export function assertProtocol(
  protocol: LendingProtocol,
): asserts protocol is AaveLikeLendingProtocol {
  if (!checkIfAave(protocol)) {
    throw new Error(`Only Aave v3 is currently supported`)
  }
}
