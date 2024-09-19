import { mainnetContracts } from 'blockchain/contracts/mainnet'

type SkySwapTokensConfigType = {
  primaryToken: string
  secondaryToken: string
  primaryTokenAddress?: string
  secondaryTokenAddress?: string
  contractAddress: string
  stake: boolean
  description?: string
}

export const skySwapTokensConfig: SkySwapTokensConfigType[] = [
  {
    primaryToken: 'DAI',
    secondaryToken: 'USDS',
    primaryTokenAddress: mainnetContracts.tokens['DAI'].address,
    secondaryTokenAddress: mainnetContracts.tokens['USDS'].address,
    contractAddress: mainnetContracts.sky.daiusds.address,
    stake: false,
    description:
      'Upgrade DAI to USDS and unlock features of the Sky Ecosystem, like sUSDS and SKY rewards.',
  },
  {
    primaryToken: 'MKR',
    secondaryToken: 'SKY',
    primaryTokenAddress: mainnetContracts.tokens['MKR'].address,
    secondaryTokenAddress: mainnetContracts.tokens['SKY'].address,
    contractAddress: mainnetContracts.sky.mkrsky.address,
    stake: false,
    description: 'Upgrade MKR to SKY for a 24,000 for 1 token split, and eligibility for rewards.',
  },
  {
    primaryToken: 'USDS',
    secondaryToken: 'SUSDS',
    primaryTokenAddress: mainnetContracts.tokens['USDS'].address,
    secondaryTokenAddress: mainnetContracts.tokens['SUSDS'].address,
    contractAddress: mainnetContracts.sky.susds.address,
    description: 'Stake USDS to save and earn a competitive yield.',
    stake: true,
  },
]
