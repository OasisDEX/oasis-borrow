import {
  AaveLikeLendingProtocol,
  checkIfAave,
  checkIfSpark,
  LendingProtocol,
} from 'lendingProtocols'

export function assertProtocol(
  protocol: LendingProtocol,
): asserts protocol is AaveLikeLendingProtocol {
  if (!checkIfAave(protocol) && !checkIfSpark(protocol)) {
    throw new Error(`Only Aave v3 and Spark v3 is currently supported`)
  }
}
