import { NetworkIds } from 'blockchain/networks'

const accountGuardGenesisBlockGoerli = 8048103
const accountGuardGenesisBlockMainnet = 16047224

export const accountGuardNetworkMap = {
  [NetworkIds.MAINNET]: accountGuardGenesisBlockMainnet,
  [NetworkIds.HARDHAT]: accountGuardGenesisBlockMainnet,
  [NetworkIds.GOERLI]: accountGuardGenesisBlockGoerli,
}
