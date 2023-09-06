import { ADDRESSES } from '@oasisdex/addresses'

const { mainnet } = ADDRESSES

export type AaveLikeUserConfigurationResult = {
  collateral: boolean
  borrowed: boolean
  asset: string
  assetName: typeof mainnet.common[keyof typeof mainnet.common]
}

export type AaveLikeUserConfigurationResults = AaveLikeUserConfigurationResult[] & {
  hasAssets: (
    collateralToken: AaveLikeUserConfigurationResult['assetName'][],
    debtToken: AaveLikeUserConfigurationResult['assetName'][],
  ) => boolean
}
