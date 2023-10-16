import { aaveV3ArbitrumMainnetProductHubProducts } from './arbitrum-mainnet'
import { aaveV3BaseMainnetProductHubProducts } from './base-mainnet'
import { aaveV3EthereumMainnetProductHubProducts } from './ethereum-mainnet'
import { aaveV3OptimimsMainnetProductHubProducts } from './optimims-mainnet'

export const aaveV3ProductHubProducts = [
  ...aaveV3EthereumMainnetProductHubProducts,
  ...aaveV3OptimimsMainnetProductHubProducts,
  ...aaveV3ArbitrumMainnetProductHubProducts,
  ...aaveV3BaseMainnetProductHubProducts,
]
