import BigNumber from 'bignumber.js'
import { OpenVaultView } from 'features/openVault/OpenVaultView'
import { NEVER } from 'rxjs'

import { openVaultStory } from './OpenVaultBuilder'

export const WaitingForIlksToBeFetched = openVaultStory({
  title:
    'We must first validate and verify that the ilks will be fetched before we can render anything.',
  _ilks$: NEVER,
  ilk: 'WBTC-A',
})

export const InvalidIlk = openVaultStory({
  title: 'Here, the user would be using a url /vault/open/WBTC-Z, should 404',
  ilks: ['WBTC-A'],
  ilk: 'WBTC-Z',
})

export const EditingStage = openVaultStory({
  proxyAddress: '0xProxyAddress',
  balanceInfo: { collateralBalance: new BigNumber('100') },
  ilk: 'WBTC-A',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
  showGenerateOption: true,
})

export const ProxyWaitingForConfirmation = openVaultStory({
  stage: 'proxyWaitingForConfirmation',
  ilk: 'ETH-A',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const ProxyWaitingForApproval = openVaultStory({
  stage: 'proxyWaitingForApproval',
  ilk: 'ETH-A',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const ProxyFailure = openVaultStory({
  stage: 'proxyFailure',
  ilk: 'ETH-A',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const ProxyInProgress = openVaultStory({
  stage: 'proxyInProgress',
  proxyConfirmations: 2,
  ilk: 'ETH-A',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const ProxySuccess = openVaultStory({
  stage: 'proxySuccess',
  ilk: 'ETH-A',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const AllowanceWaitingForConfirmation = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'WBTC-A',
})

export const AllowanceWaitingForApproval = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  stage: 'allowanceWaitingForApproval',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'WBTC-A',
})

export const AllowanceFailure = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  stage: 'allowanceFailure',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'WBTC-A',
})

export const AllowanceInProgress = openVaultStory({
  stage: 'allowanceInProgress',
  ilk: 'WBTC-A',
  depositAmount: new BigNumber('50'),
  generateAmount: new BigNumber('2500'),
})

export const AllowanceSuccess = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  stage: 'allowanceSuccess',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'WBTC-A',
})

export const OpenWaitingForConfirmation = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  stage: 'openWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'ETH-A',
})

export const OpenWaitingForApproval = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  stage: 'openWaitingForApproval',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'ETH-A',
})

export const OpenFailure = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  stage: 'openFailure',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'ETH-A',
})

export const OpenInProgress = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  stage: 'openInProgress',
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'ETH-A',
})

export const OpenSuccess = openVaultStory({
  balanceInfo: { collateralBalance: new BigNumber('100') },
  stage: 'openSuccess',
  id: new BigNumber('122345'),
  depositAmount: new BigNumber('10'),
  generateAmount: new BigNumber('5000'),
  ilk: 'ETH-A',
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenVault/Stages',
  component: OpenVaultView,
}
