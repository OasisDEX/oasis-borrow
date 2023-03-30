export enum LendingProtocol {
  AaveV2 = 'AaveV2',
  AaveV3 = 'AaveV3',
  // TODO we will need provide proper handling for Ajna
  // Ajna = 'Ajna',
}

// This one partially duplicates Lending protocol
// this is because LendingProtocol is used in the way that when
// new protocol is introduced it breaks typescript in number of
// different places
export enum Protocols {
  MAKER = 'maker',
  AAVEV2 = 'aaveV2',
  AAVEV3 = 'aaveV3',
  AJNA = 'ajna',
}
