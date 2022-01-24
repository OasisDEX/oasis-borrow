import { BigNumber } from 'bignumber.js'
import { DEFAULT_PROXY_ADDRESS } from 'helpers/mocks/vaults.mock'
import { zero } from 'helpers/zero'

import { guniOpenMultiplyVaultStory } from '../../../../../helpers/stories/GuniOpenMultiplyVaultStory'
import { GuniOpenVaultView } from '../containers/GuniOpenVaultView'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const NoProxyAddress = guniOpenMultiplyVaultStory({
  title: 'User has no proxyAddress and will have to create one before opening a vault',
})({ depositAmount: new BigNumber('100') })

export const InsufficientAllowance = guniOpenMultiplyVaultStory({
  title:
    'User has no allowance for the given collateral and will have to set it before opening a vault',
  proxyAddress,
  allowance: zero,
})({
  depositAmount: new BigNumber('100'),
})

export const PotentialGenerateAmountLessThanDebtFloor = guniOpenMultiplyVaultStory({
  title:
    'User has no allowance for the given collateral and will have to set it before opening a vault',
  proxyAddress,
})({
  depositAmount: new BigNumber('10'),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'GuniOpenMultiplyVault/Non-Blocking',
  component: GuniOpenVaultView,
}
