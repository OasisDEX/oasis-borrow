import mainnet from 'blockchain/addresses/mainnet.json'

export type UserConfigurationResult = {
  collateral: boolean
  borrowed: boolean
  asset: string
  assetName: (typeof mainnet)[keyof typeof mainnet]
}

export type UserConfigurationResults = UserConfigurationResult[] & {
  hasAssets: (
    collateralToken: UserConfigurationResult['assetName'],
    debtToken: UserConfigurationResult['assetName'],
  ) => boolean
}
