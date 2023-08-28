import { AaveLendingProtocol, checkIfAave, LendingProtocol } from 'lendingProtocols'

export function assertProtocol(protocol: LendingProtocol): asserts protocol is AaveLendingProtocol {
  if (!checkIfAave(protocol)) {
    throw new Error(`Only Aaave v3 is currently supported`)
  }
}
