import BigNumber from 'bignumber.js'
import { OpenVaultView } from 'features/openVault/components/OpenVaultView'
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

export const OpenWaitingForConfirmation = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'openWaitingForConfirmation',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

export const OpenWaitingForApproval = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'openWaitingForApproval',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

export const OpenFailure = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'openFailure',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

export const OpenInProgress = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  stage: 'openInProgress',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

export const OpenSuccess = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'ETH-A',
})({
  id: new BigNumber('122345'),
  stage: 'openSuccess',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('5000'),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenVault/Stages',
  component: OpenVaultView,
}
