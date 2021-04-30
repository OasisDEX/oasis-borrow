import { BigNumber } from 'bignumber.js'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { manageVaultStory } from 'helpers/stories/ManageVaultStory'
import { ManageVaultView } from '../ManageVaultView'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const _18Precision = manageVaultStory({
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('2000') },
  priceInfo: {
    collateralPrice: new BigNumber('2000000000'),
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('2'),
  generateAmount: new BigNumber('300'),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault/Precisions',
  component: ManageVaultView,
}
