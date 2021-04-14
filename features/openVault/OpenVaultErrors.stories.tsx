import { BigNumber } from 'bignumber.js'
import { DEFAULT_PROXY_ADDRESS } from 'blockchain/vaults'
import { openVaultStory } from './OpenVaultBuilder'
import { OpenVaultView } from './OpenVaultView'

const proxyAddress = DEFAULT_PROXY_ADDRESS
export const VaultWillBeUnderCollateralized = openVaultStory({
  proxyAddress,
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('4000'),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenVault/Errors',
  component: OpenVaultView,
}
