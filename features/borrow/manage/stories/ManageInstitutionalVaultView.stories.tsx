import { BigNumber } from 'bignumber.js'

import { DEFAULT_PROXY_ADDRESS } from '../../../../helpers/mocks/vaults.mock'
import { manageVaultStory } from '../../../../helpers/stories/ManageVaultStory'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export default { title: 'ManageVault/Institutional Vault' }

export const CollateralEditingStage = manageVaultStory({
  vault: {
    id: new BigNumber(27426),
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('2000') },
  proxyAddress,
})({
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})
