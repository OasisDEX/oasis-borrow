import BigNumber from 'bignumber.js'
import { OpenVaultView } from 'features/borrow/open/containers/OpenVaultView'
import { openVaultStory } from 'helpers/stories/OpenVaultStory'
import { zero } from 'helpers/zero'
import { NEVER } from 'rxjs'

export const WaitingForIlksToBeFetched = openVaultStory({
  title:
    'We must first validate and verify that the ilks will be fetched before we can render anything.',
  _ilks$: NEVER,
  ilk: 'WBTC-A',
})()

export const InvalidIlk = openVaultStory({
  title: 'Here, the user would be using a url /vault/open/WBTC-Z, should 404',
  ilks: ['WBTC-A'],
  ilk: 'WBTC-Z',
})()

export const EditingStage = openVaultStory({
  proxyAddress: '0xProxyAddress',
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
})({
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const ProxyWaitingForConfirmation = openVaultStory({
  ilk: 'ETH-A',
  allowance: zero,
})({
  stage: 'proxyWaitingForConfirmation',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const ProxyWaitingForApproval = openVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxyWaitingForApproval',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const ProxyFailure = openVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxyFailure',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const ProxyInProgress = openVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxyInProgress',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const ProxySuccess = openVaultStory({
  ilk: 'ETH-A',
})({
  stage: 'proxySuccess',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const AllowanceWaitingForConfirmation = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
})({
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

export const AllowanceWaitingForApproval = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
})({
  stage: 'allowanceWaitingForApproval',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

export const AllowanceFailure = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
})({
  stage: 'allowanceFailure',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

export const AllowanceInProgress = openVaultStory({
  ilk: 'WBTC-A',
})({
  stage: 'allowanceInProgress',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const AllowanceSuccess = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
})({
  stage: 'allowanceSuccess',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

export const txWaitingForConfirmation = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'txWaitingForConfirmation',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

export const txWaitingForApproval = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'txWaitingForApproval',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

export const txFailure = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'txFailure',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

export const txInProgress = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'txInProgress',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

export const txSuccess = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  id: new BigNumber('122345'),
  stage: 'txSuccess',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenVault/Stages',
  component: OpenVaultView,
}
