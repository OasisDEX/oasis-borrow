import { ADDRESSES } from '@oasisdex/addresses'

const { mainnet } = ADDRESSES

export type UserConfigurationResult = {
  collateral: boolean
  borrowed: boolean
  asset: string
  assetName: (typeof mainnet.common)[keyof typeof mainnet.common]
}

export type UserConfigurationResults = UserConfigurationResult[] & {
  hasAssets: (
    collateralToken: UserConfigurationResult['assetName'],
    debtToken: UserConfigurationResult['assetName'],
  ) => boolean
}
