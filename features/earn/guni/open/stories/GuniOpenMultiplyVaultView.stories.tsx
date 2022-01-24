import BigNumber from 'bignumber.js'
import { NEVER } from 'rxjs'

import { guniOpenMultiplyVaultStory } from '../../../../../helpers/stories/GuniOpenMultiplyVaultStory'
import { GuniOpenVaultView } from '../containers/GuniOpenVaultView'

export const WaitingForIlksToBeFetched = guniOpenMultiplyVaultStory({
  title:
    'We must first validate and verify that the ilks will be fetched before we can render anything.',
  _ilks$: NEVER,
})()

export const InvalidIlk = guniOpenMultiplyVaultStory({
  title: 'Here, the user would be using a url /vault/open/WBTC-Z, should 404',
  ilk: 'ETH-Z',
})()

export const EditingStage = guniOpenMultiplyVaultStory({
  proxyAddress: '0xProxyAddress',
  balanceInfo: { daiBalance: new BigNumber('10000') },
})({
  depositAmount: new BigNumber('1500'),
})

export const ProxyWaitingForConfirmation = guniOpenMultiplyVaultStory({
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'proxyWaitingForConfirmation',
  depositAmount: new BigNumber('1500'),
})

export const ProxyWaitingForApproval = guniOpenMultiplyVaultStory({
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'proxyWaitingForApproval',
  depositAmount: new BigNumber('1500'),
})

export const ProxyFailure = guniOpenMultiplyVaultStory({
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'proxyFailure',
  depositAmount: new BigNumber('1500'),
})

export const ProxyInProgress = guniOpenMultiplyVaultStory({
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'proxyInProgress',
  depositAmount: new BigNumber('1500'),
})

export const ProxySuccess = guniOpenMultiplyVaultStory({
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'proxySuccess',
  depositAmount: new BigNumber('1500'),
})

export const AllowanceWaitingForConfirmation = guniOpenMultiplyVaultStory({
  balanceInfo: { daiBalance: new BigNumber('10000') },
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'allowanceWaitingForConfirmation',
  depositAmount: new BigNumber('1500'),
})

export const AllowanceWaitingForApproval = guniOpenMultiplyVaultStory({
  balanceInfo: { daiBalance: new BigNumber('10000') },
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'allowanceWaitingForApproval',
  depositAmount: new BigNumber('1500'),
})

export const AllowanceFailure = guniOpenMultiplyVaultStory({
  balanceInfo: { daiBalance: new BigNumber('10000') },
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'allowanceFailure',
  depositAmount: new BigNumber('1500'),
})

export const AllowanceInProgress = guniOpenMultiplyVaultStory({
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'allowanceInProgress',
  depositAmount: new BigNumber('1500'),
})

export const AllowanceSuccess = guniOpenMultiplyVaultStory({
  balanceInfo: { daiBalance: new BigNumber('10000') },
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'allowanceSuccess',
  depositAmount: new BigNumber('1500'),
})

export const txWaitingForConfirmation = guniOpenMultiplyVaultStory({
  balanceInfo: { daiBalance: new BigNumber('10000') },
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'txWaitingForConfirmation',
  depositAmount: new BigNumber('1500'),
  requiredCollRatio: new BigNumber(3.5),
})

export const txWaitingForApproval = guniOpenMultiplyVaultStory({
  balanceInfo: { daiBalance: new BigNumber('10000') },
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'txWaitingForApproval',
  depositAmount: new BigNumber('1500'),
  requiredCollRatio: new BigNumber(3.5),
})

export const txFailure = guniOpenMultiplyVaultStory({
  balanceInfo: { daiBalance: new BigNumber('10000') },
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'txFailure',
  depositAmount: new BigNumber('1500'),
  requiredCollRatio: new BigNumber(3.5),
})

export const txInProgress = guniOpenMultiplyVaultStory({
  balanceInfo: { daiBalance: new BigNumber('10000') },
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  stage: 'txInProgress',
  depositAmount: new BigNumber('1500'),
})

export const txSuccess = guniOpenMultiplyVaultStory({
  balanceInfo: { daiBalance: new BigNumber('10000') },
  ilk: 'GUNIV3DAIUSDC1-A',
})({
  id: new BigNumber('122345'),
  stage: 'txSuccess',
  depositAmount: new BigNumber('1500'),
  requiredCollRatio: new BigNumber(3.5),
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'GuniOpenMultiplyVault/Stages',
  component: GuniOpenVaultView,
}
