import { NetworkIds } from 'blockchain/networkIds'

const accountFactoryGenesisBlockGoerli = 8048105
const accountFactoryGenesisBlockMainnet = 16047226

export const accountFactoryNetworkMap = {
  [NetworkIds.MAINNET]: accountFactoryGenesisBlockMainnet,
  [NetworkIds.HARDHAT]: accountFactoryGenesisBlockMainnet,
  [NetworkIds.GOERLI]: accountFactoryGenesisBlockGoerli,
}
