import BigNumber from 'bignumber.js'
import { openMultiplyVaultStory } from 'helpers/stories/OpenMultiplyVaultStory'
import { NEVER } from 'rxjs'

import { OpenMultiplyVaultView } from '../containers/OpenMultiplyVaultView'

export const WaitingForIlksToBeFetched = openMultiplyVaultStory({
  title:
    'We must first validate and verify that the ilks will be fetched before we can render anything.',
  _ilks$: NEVER,
})()

export const InvalidIlk = openMultiplyVaultStory({
  title: 'Here, the user would be using a url /vault/open/WBTC-Z, should 404',
  ilk: 'ETH-Z',
})()

export const EditingStage = openMultiplyVaultStory({
  proxyAddress: '0xProxyAddress',
  balanceInfo: { collateralBalance: new BigNumber('100') },
})({
  depositAmount: new BigNumber('50'),
  requiredCollRatio: new BigNumber(3.5),
})

export const ProxyWaitingForConfirmation = openMultiplyVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxyWaitingForConfirmation',
  depositAmount: new BigNumber('50'),
})

export const ProxyWaitingForApproval = openMultiplyVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxyWaitingForApproval',
  depositAmount: new BigNumber('50'),
})

export const ProxyFailure = openMultiplyVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxyFailure',
  depositAmount: new BigNumber('50'),
})

export const ProxyInProgress = openMultiplyVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxyInProgress',
  depositAmount: new BigNumber('50'),
})

export const ProxySuccess = openMultiplyVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxySuccess',
  depositAmount: new BigNumber('50'),
})

export const AllowanceWaitingForConfirmation = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
})({
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('50'),
})

export const AllowanceWaitingForApproval = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
})({
  stage: 'allowanceWaitingForApproval',
  depositAmount: new BigNumber('50'),
})

export const AllowanceFailure = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
})({
  stage: 'allowanceFailure',
  depositAmount: new BigNumber('50'),
})

export const AllowanceInProgress = openMultiplyVaultStory({
  ilk: 'WBTC-A',
})({
  stage: 'allowanceInProgress',
  depositAmount: new BigNumber('50'),
})

export const AllowanceSuccess = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
})({
  stage: 'allowanceSuccess',
  depositAmount: new BigNumber('50'),
})

export const txWaitingForConfirmation = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'txWaitingForConfirmation',
  depositAmount: new BigNumber('50'),
  requiredCollRatio: new BigNumber(3.5),
})

export const txWaitingForApproval = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'txWaitingForApproval',
  depositAmount: new BigNumber('50'),
  requiredCollRatio: new BigNumber(3.5),
})

export const txFailure = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'txFailure',
  depositAmount: new BigNumber('50'),
  requiredCollRatio: new BigNumber(3.5),
})

export const txInProgress = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'txInProgress',
  depositAmount: new BigNumber('50'),
})

export const txSuccess = openMultiplyVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  id: new BigNumber('122345'),
  stage: 'txSuccess',
  depositAmount: new BigNumber('50'),
  requiredCollRatio: new BigNumber(3.5),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenMultiplyVault/Stages',
  component: OpenMultiplyVaultView,
}
