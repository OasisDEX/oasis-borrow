import { BigNumber } from 'bignumber.js'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { manageVaultStory } from 'helpers/stories/ManageVaultStory'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const HighPrecision = manageVaultStory({
  vault: {
    ilk: 'LINK-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('2000') },
  priceInfo: {
    collateralPrice: new BigNumber('2000000000'),
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('0.00000000001'),
  generateAmount: new BigNumber('300'),
})

export const LowPrecision = manageVaultStory({
  vault: {
    ilk: 'LINK-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('2000') },
  priceInfo: {
    collateralPrice: new BigNumber('0.0001'),
  },
  proxyAddress,
})({
  depositAmount: new BigNumber('100'),
  generateAmount: new BigNumber('300'),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault/Precisions',
}
