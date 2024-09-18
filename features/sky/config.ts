import { mainnetContracts } from 'blockchain/contracts/mainnet'

export const skySwapTokensConfig = [
  {
    primaryToken: 'DAI',
    secondaryToken: 'USDS',
    primaryTokenAddress: mainnetContracts.tokens['DAI'].address,
    secondaryTokenAddress: mainnetContracts.tokens['USDS'].address,
    contractAddress: mainnetContracts.sky.daiusds.address,
    stake: false,
    descriptionPrimary: '',
    descriptionSecondary: '',
  },
  {
    primaryToken: 'MKR',
    secondaryToken: 'SKY',
    primaryTokenAddress: mainnetContracts.tokens['MKR'].address,
    secondaryTokenAddress: mainnetContracts.tokens['SKY'].address,
    contractAddress: mainnetContracts.sky.mkrsky.address,
    stake: false,
    descriptionPrimary: '',
    descriptionSecondary: '',
  },
  {
    primaryToken: 'USDS',
    secondaryToken: 'SUSDS',
    primaryTokenAddress: mainnetContracts.tokens['USDS'].address,
    secondaryTokenAddress: mainnetContracts.tokens['SUSDS'].address,
    contractAddress: mainnetContracts.sky.susds.address,
    descriptionPrimary: '',
    descriptionSecondary: '',
    stake: true,
  },
]
