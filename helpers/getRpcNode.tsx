import { NetworkNames } from 'blockchain/networks'

export function getRpcNode(network: NetworkNames): string | undefined {
  switch (network) {
    // case 'hardhat': // hardhat does not request this one
    case NetworkNames.ethereumMainnet:
      return `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.ethereumGoerli:
      return `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.arbitrumMainnet:
      return !['', undefined].includes(process.env.ARBITRUM_MAINNET_RPC_URL)
        ? `${process.env.ARBITRUM_MAINNET_RPC_URL}`
        : `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.arbitrumGoerli:
      return `https://arbitrum-goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.polygonMainnet:
      return `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.polygonMumbai:
      return `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.optimismMainnet:
      return !['', undefined].includes(process.env.OPTIMISM_MAINNET_RPC_URL)
        ? `${process.env.OPTIMISM_MAINNET_RPC_URL}`
        : `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.baseMainnet:
      return `https://base-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    case NetworkNames.baseGoerli:
      return `https://base-goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    default:
      console.warn(`Network: ${network} does not have defined a rpc node. Returning BadRequest`)
      return undefined
  }
}
