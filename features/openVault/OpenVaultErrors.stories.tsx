import { BigNumber } from 'bignumber.js'
import { DEFAULT_PROXY_ADDRESS } from 'blockchain/vaults'
import { openVaultStory } from './OpenVaultBuilder'
import { OpenVaultView } from './OpenVaultView'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const VaultWillBeUnderCollateralized = openVaultStory({
  proxyAddress,
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('3000'),
})

export const VaultWillBeUnderCollateralizedtNextPrice = openVaultStory({
  proxyAddress,
  depositAmount: new BigNumber('40'),
  generateAmount: new BigNumber('4000'),
  priceInfo: {
    collateralChangePercentage: new BigNumber('-0.7'),
  },
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenVault/Errors',
  component: OpenVaultView,
}
